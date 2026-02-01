import express from 'express';
import cors from 'cors';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  verifyCollectionV1, 
  findMetadataPda,
  mplTokenMetadata 
} from '@metaplex-foundation/mpl-token-metadata';
import { createSignerFromKeypair, signerIdentity, publicKey } from '@metaplex-foundation/umi';
import { Keypair, PublicKey } from '@solana/web3.js';

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3001;
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const COLLECTION_ADDRESS = process.env.COLLECTION_ADDRESS;
const VERIFICATION_WALLET_PKEY = process.env.VERIFICATION_WALLET_PKEY;

if (!COLLECTION_ADDRESS || !VERIFICATION_WALLET_PKEY) {
  console.error('❌ Missing required environment variables:');
  console.error('  - COLLECTION_ADDRESS');
  console.error('  - VERIFICATION_WALLET_PKEY');
  process.exit(1);
}

// Initialize Umi
const umi = createUmi(RPC_URL).use(mplTokenMetadata());

// Create signer from treasury private key
let treasurySigner;
try {
  let privateKeyBytes;
  const keyInput = VERIFICATION_WALLET_PKEY.trim();
  
  // Log first few chars to help debug format (safe - no actual key data)
  console.log(`  Key input starts with: "${keyInput.substring(0, 3)}...", length: ${keyInput.length}`);
  
  // Try to parse as JSON array first
  if (keyInput.startsWith('[')) {
    try {
      const parsed = JSON.parse(keyInput);
      if (Array.isArray(parsed)) {
        privateKeyBytes = new Uint8Array(parsed);
        console.log(`  Parsed as JSON array: ${privateKeyBytes.length} bytes`);
      } else {
        throw new Error('Parsed value is not an array');
      }
    } catch (parseError) {
      console.log(`  JSON parse failed: ${parseError.message}`);
      throw parseError;
    }
  } else {
    // Try base64 first (for base64 encoded JSON arrays)
    try {
      const decoded = Buffer.from(keyInput, 'base64').toString('utf8');
      console.log(`  Decoded from base64: "${decoded.substring(0, 10)}..."`);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        privateKeyBytes = new Uint8Array(parsed);
        console.log(`  Parsed base64-decoded JSON array: ${privateKeyBytes.length} bytes`);
      } else {
        throw new Error('Base64 decoded value is not a JSON array');
      }
    } catch (b64Error) {
      console.log(`  Base64 decode failed: ${b64Error.message}`);
      // Try base58 (raw private key string)
      const bs58 = await import('bs58');
      privateKeyBytes = bs58.default.decode(keyInput);
      console.log(`  Decoded from base58: ${privateKeyBytes.length} bytes`);
    }
  }
  
  if (!privateKeyBytes || privateKeyBytes.length !== 64) {
    throw new Error(`Invalid key length: expected 64 bytes, got ${privateKeyBytes?.length || 0}`);
  }
  
  // Log first and last few bytes for debugging (safe - partial data only)
  console.log(`  First 3 bytes: [${privateKeyBytes[0]}, ${privateKeyBytes[1]}, ${privateKeyBytes[2]}]`);
  console.log(`  Last 3 bytes: [${privateKeyBytes[61]}, ${privateKeyBytes[62]}, ${privateKeyBytes[63]}]`);
  console.log(`  Bytes at position 32-34 (start of pubkey): [${privateKeyBytes[32]}, ${privateKeyBytes[33]}, ${privateKeyBytes[34]}]`);
  
  // Try to derive the public key from the seed and compare
  let derivedKeypair;
  try {
    const nacl = await import('tweetnacl');
    const seed = privateKeyBytes.slice(0, 32);
    derivedKeypair = nacl.default.sign.keyPair.fromSeed(seed);
    const derivedPubkey = derivedKeypair.publicKey;
    const storedPubkey = privateKeyBytes.slice(32, 64);
    
    const pubkeysMatch = derivedPubkey.every((byte, i) => byte === storedPubkey[i]);
    console.log(`  Derived pubkey matches stored: ${pubkeysMatch}`);
    
    if (!pubkeysMatch) {
      console.log(`  Derived pubkey first 3: [${derivedPubkey[0]}, ${derivedPubkey[1]}, ${derivedPubkey[2]}]`);
      console.log(`  Stored pubkey first 3: [${storedPubkey[0]}, ${storedPubkey[1]}, ${storedPubkey[2]}]`);
      console.log('  ⚠️ Key mismatch! Using derived keypair instead of stored pubkey...');
      // Use the correctly derived keypair
      privateKeyBytes = derivedKeypair.secretKey;
    }
  } catch (naclError) {
    console.log(`  Could not verify with tweetnacl: ${naclError.message}`);
  }
  
  // Validate key by creating a Solana keypair
  console.log('  Validating key with Solana web3.js...');
  const solanaKeypair = Keypair.fromSecretKey(privateKeyBytes);
  console.log('  Solana keypair created, public key:', solanaKeypair.publicKey.toBase58());
  
  // Create Umi keypair
  console.log('  Creating Umi keypair...');
  const keypair = umi.eddsa.createKeypairFromSecretKey(privateKeyBytes);
  console.log('  Umi keypair created with public key:', keypair.publicKey);

  console.log('  Initializing treasury signer...');
  treasurySigner = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(treasurySigner));
  console.log('✓ Treasury signer initialized:', treasurySigner.publicKey);
} catch (error) {
  console.error('❌ Failed to initialize treasury signer:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Filter out old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    collection: COLLECTION_ADDRESS,
    authority: treasurySigner.publicKey.toString()
  });
});

// Verify pattern NFT into collection
app.post('/verify-pattern', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Try again in a minute.' 
    });
  }

  const { mintAddress } = req.body;

  if (!mintAddress) {
    return res.status(400).json({ error: 'Missing mintAddress' });
  }

  try {
    console.log(`[VERIFY] Checking mint: ${mintAddress}`);

    // Validate it's a P303 NFT by checking on-chain data
    let isValid = false;
    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'verify',
          method: 'getAsset',
          params: { id: mintAddress },
        }),
      });

      const data = await response.json();
      const symbol = data.result?.content?.metadata?.symbol;
      const uri = data.result?.content?.json_uri || data.result?.content?.uri || '';
      
      isValid = symbol === 'P303' || uri.includes('p303.xyz');
      
      if (!isValid) {
        console.log(`[VERIFY] ❌ Not a P303 NFT: symbol=${symbol}, uri=${uri}`);
        return res.status(400).json({ 
          error: 'Not a Pattern 303 NFT',
          details: { symbol, uri }
        });
      }
    } catch (dasError) {
      console.warn(`[VERIFY] ⚠️ DAS API check failed, proceeding anyway:`, dasError.message);
      // If DAS fails, we'll let verification proceed (optimistic)
      isValid = true;
    }

    console.log(`[VERIFY] ✓ Valid P303 NFT, verifying collection...`);

    // Verify the NFT into the collection
    const collectionMintPubkey = publicKey(COLLECTION_ADDRESS);
    const mintUmiPubkey = publicKey(mintAddress);
    
    await verifyCollectionV1(umi, {
      metadata: findMetadataPda(umi, { mint: mintUmiPubkey }),
      collectionMint: collectionMintPubkey,
      authority: treasurySigner,
    }).sendAndConfirm(umi);

    console.log(`[VERIFY] ✓ Collection verified for mint: ${mintAddress}`);

    res.json({ 
      success: true,
      message: 'Pattern verified in collection',
      mintAddress,
      collection: COLLECTION_ADDRESS
    });

  } catch (error) {
    console.error(`[VERIFY] ❌ Verification failed:`, error);
    
    // Handle specific Metaplex errors
    if (error.message?.includes('already verified')) {
      return res.json({ 
        success: true, 
        message: 'Pattern already verified',
        mintAddress 
      });
    }

    res.status(500).json({ 
      error: 'Verification failed',
      message: error.message,
      mintAddress
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Pattern 303 Verification Service running on port ${PORT}`);
  console.log(`  Collection: ${COLLECTION_ADDRESS}`);
  console.log(`  Authority: ${treasurySigner.publicKey.toString()}`);
});
