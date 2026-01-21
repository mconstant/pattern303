import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createNft,
  burnV1,
  mplTokenMetadata,
  TokenStandard,
  verifyCollectionV1,
  findMetadataPda,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  generateSigner,
  percentAmount,
  publicKey,
  createGenericFile,
} from '@metaplex-foundation/umi';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Pattern303, NetworkType } from '../types/pattern';
import { SOLANA_NETWORKS, COLLECTION_ADDRESS } from './constants';

// Compact pattern encoding for on-chain storage
// Format: name|creator|tempo|waveform|cutoff|resonance|envMod|decay|accent|steps
// Steps: each step is 1 byte (pitch:4bits, octave:2bits, flags:2bits)
export function encodePatternData(pattern: Pattern303): string {
  const header = [
    pattern.name.slice(0, 32),
    pattern.creator.slice(0, 32),
    pattern.tempo,
    pattern.waveform === 'saw' ? 0 : 1,
    pattern.cutoff,
    pattern.resonance,
    pattern.envMod,
    pattern.decay,
    pattern.accent,
  ].join('|');

  // Encode steps compactly: each step as 2 hex chars
  // pitch (0-12) = 4 bits, octave (-1,0,1 -> 0,1,2) = 2 bits, gate = 1 bit, accent = 1 bit, slide in next nibble
  const stepsHex = pattern.steps.map(step => {
    const pitch = step.pitch & 0x0F; // 4 bits
    const octave = (step.octave + 1) & 0x03; // 2 bits (0,1,2)
    const gate = step.gate ? 1 : 0;
    const accent = step.accent ? 1 : 0;
    const slide = step.slide ? 1 : 0;
    // Pack: ppppooGA (pitch, octave, gate, accent) + 0000000S (slide)
    const byte1 = (pitch << 4) | (octave << 2) | (gate << 1) | accent;
    const byte2 = slide;
    return byte1.toString(16).padStart(2, '0') + byte2.toString(16);
  }).join('');

  return `${header}|${stepsHex}`;
}

// Decode pattern data from compact format
export function decodePatternData(encoded: string): Pattern303 {
  const parts = encoded.split('|');
  const [name, creator, tempo, waveform, cutoff, resonance, envMod, decay, accent, stepsHex] = parts;

  const steps = [];
  for (let i = 0; i < 16; i++) {
    const hexPart = stepsHex.slice(i * 3, i * 3 + 3);
    const byte1 = parseInt(hexPart.slice(0, 2), 16);
    const byte2 = parseInt(hexPart.slice(2, 3), 16);

    // Convert legacy boolean gate to GateType
    const gateFlag = ((byte1 >> 1) & 0x01) === 1;

    steps.push({
      pitch: (byte1 >> 4) & 0x0F,
      octave: (((byte1 >> 2) & 0x03) - 1) as -1 | 0 | 1,
      gate: gateFlag ? 'note' as const : 'rest' as const,
      accent: (byte1 & 0x01) === 1,
      slide: (byte2 & 0x01) === 1,
    });
  }

  return {
    name,
    creator,
    tempo: parseInt(tempo),
    waveform: parseInt(waveform) === 0 ? 'saw' : 'square',
    cutoff: parseInt(cutoff),
    resonance: parseInt(resonance),
    envMod: parseInt(envMod),
    decay: parseInt(decay),
    accent: parseInt(accent),
    steps,
  };
}

// Minting fee configuration
const MINT_FEE_SOL = parseFloat(import.meta.env.VITE_MINT_FEE_SOL || '0.0303');
const TREASURY_WALLET = import.meta.env.VITE_TREASURY_WALLET;

export interface MintResult {
  signature: string;
  mintAddress: string;
  explorerUrl: string;
  feeSignature?: string;
}

export function getMintFee(): number {
  return MINT_FEE_SOL;
}

export function getTreasuryWallet(): string | undefined {
  return TREASURY_WALLET;
}

export function getCollectionAddress(): string | undefined {
  return COLLECTION_ADDRESS || undefined;
}

export interface CollectionResult {
  signature: string;
  collectionAddress: string;
  explorerUrl: string;
}

// Create the P303 collection NFT (one-time setup)
export async function createCollectionNFT(
  wallet: WalletContextState,
  network: NetworkType
): Promise<CollectionResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const endpoint = SOLANA_NETWORKS[network];

  const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));

  const collectionMint = generateSigner(umi);

  const { signature } = await createNft(umi, {
    mint: collectionMint,
    name: 'Pattern 303 Collection',
    symbol: 'P303',
    uri: 'https://p303.xyz/collection.json',
    sellerFeeBasisPoints: percentAmount(5),
    isCollection: true,
  }).sendAndConfirm(umi);

  const collectionAddress = collectionMint.publicKey.toString();
  const signatureStr = Buffer.from(signature).toString('base64');

  const explorerUrl = network === 'devnet'
    ? `https://explorer.solana.com/address/${collectionAddress}?cluster=devnet`
    : `https://explorer.solana.com/address/${collectionAddress}`;

  console.log('Collection NFT created!');
  console.log('Collection Address:', collectionAddress);
  console.log('Add this to your .env: VITE_COLLECTION_ADDRESS=' + collectionAddress);

  return {
    signature: signatureStr,
    collectionAddress,
    explorerUrl,
  };
}

async function payMintingFee(
  wallet: WalletContextState,
  connection: Connection
): Promise<string> {
  if (!TREASURY_WALLET) {
    throw new Error('Treasury wallet not configured. Please set VITE_TREASURY_WALLET in .env');
  }

  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const treasuryPubkey = new PublicKey(TREASURY_WALLET);
  const lamports = Math.floor(MINT_FEE_SOL * LAMPORTS_PER_SOL);

  // Create transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: treasuryPubkey,
    lamports,
  });

  // Create and sign transaction
  const transaction = new Transaction().add(transferInstruction);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  // Sign with wallet
  const signedTransaction = await wallet.signTransaction(transaction);

  // Send and confirm
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  });

  return signature;
}

export async function mintPatternNFT(
  wallet: WalletContextState,
  pattern: Pattern303,
  network: NetworkType
): Promise<MintResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const endpoint = SOLANA_NETWORKS[network];
  const connection = new Connection(endpoint, 'confirmed');

  // Step 1: Pay minting fee to treasury
  let feeSignature: string | undefined;
  if (TREASURY_WALLET) {
    feeSignature = await payMintingFee(wallet, connection);
  }

  // Step 2: Create Umi instance for NFT minting
  const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));

  // Encode pattern data compactly for on-chain storage
  // Use minimal encoding: just the essential step data as hex
  const stepsHex = pattern.steps.map(step => {
    const byte = (step.pitch & 0xF) << 4 |
                 ((step.octave + 1) & 0x3) << 2 |
                 (step.gate ? 2 : 0) |
                 (step.accent ? 1 : 0);
    return byte.toString(16).padStart(2, '0') + (step.slide ? '1' : '0');
  }).join('');

  // Create a very short URI with pattern data embedded
  // Format: https://p303.xyz/{tempo}/{waveform}/{synth_params}/{steps}
  const w = pattern.waveform === 'saw' ? 's' : 'q';
  const params = [pattern.cutoff, pattern.resonance, pattern.envMod, pattern.decay, pattern.accent]
    .map(v => v.toString(16).padStart(2, '0')).join('');

  // The URI contains all pattern data - can be decoded by any viewer
  // Total: ~120 chars which fits in Solana's 200 byte URI limit
  const metadataUri = `https://p303.xyz/${pattern.tempo}/${w}/${params}/${stepsHex}`;

  console.log(`Metadata URI: ${metadataUri}`);
  console.log(`URI length: ${metadataUri.length} chars`);

  // Generate mint signer
  const mint = generateSigner(umi);

  // Create NFT with collection if configured
  const collectionMint = COLLECTION_ADDRESS ? publicKey(COLLECTION_ADDRESS) : undefined;

  const { signature } = await createNft(umi, {
    mint,
    name: pattern.name.slice(0, 32), // Max 32 chars
    symbol: 'P303',
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(5), // 5% royalty
    isCollection: false,
    collection: collectionMint ? { key: collectionMint, verified: false } : undefined,
  }).sendAndConfirm(umi);

  const mintAddress = mint.publicKey.toString();

  // Verify collection membership (signer must be collection update authority)
  if (collectionMint) {
    try {
      await verifyCollectionV1(umi, {
        metadata: findMetadataPda(umi, { mint: mint.publicKey }),
        collectionMint,
        authority: umi.identity,
      }).sendAndConfirm(umi);
      console.log('Collection verified for mint:', mintAddress);
    } catch (e) {
      console.warn('Could not verify collection (you may not be the collection authority):', e);
    }
  }

  const signatureStr = Buffer.from(signature).toString('base64');

  const explorerUrl = network === 'devnet'
    ? `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`
    : `https://explorer.solana.com/address/${mintAddress}`;

  return {
    signature: signatureStr,
    mintAddress,
    explorerUrl,
    feeSignature,
  };
}

// Free minting for 303 token holders (no treasury fee)
export async function mintPatternNFTFree(
  wallet: WalletContextState,
  pattern: Pattern303,
  network: NetworkType
): Promise<MintResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const endpoint = SOLANA_NETWORKS[network];

  // Create Umi instance for NFT minting
  const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));

  // Encode pattern data compactly for on-chain storage
  const stepsHex = pattern.steps.map(step => {
    const byte = (step.pitch & 0xF) << 4 |
                 ((step.octave + 1) & 0x3) << 2 |
                 (step.gate ? 2 : 0) |
                 (step.accent ? 1 : 0);
    return byte.toString(16).padStart(2, '0') + (step.slide ? '1' : '0');
  }).join('');

  const w = pattern.waveform === 'saw' ? 's' : 'q';
  const params = [pattern.cutoff, pattern.resonance, pattern.envMod, pattern.decay, pattern.accent]
    .map(v => v.toString(16).padStart(2, '0')).join('');

  const metadataUri = `https://p303.xyz/${pattern.tempo}/${w}/${params}/${stepsHex}`;

  console.log(`[FREE MINT] Metadata URI: ${metadataUri}`);
  console.log(`[FREE MINT] URI length: ${metadataUri.length} chars`);

  // Generate mint signer
  const mint = generateSigner(umi);

  // Create NFT with collection if configured
  const collectionMint = COLLECTION_ADDRESS ? publicKey(COLLECTION_ADDRESS) : undefined;

  // Create NFT (no treasury fee payment)
  const { signature } = await createNft(umi, {
    mint,
    name: pattern.name.slice(0, 32),
    symbol: 'P303',
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(5),
    isCollection: false,
    collection: collectionMint ? { key: collectionMint, verified: false } : undefined,
  }).sendAndConfirm(umi);

  const mintAddress = mint.publicKey.toString();

  // Verify collection membership (signer must be collection update authority)
  if (collectionMint) {
    try {
      await verifyCollectionV1(umi, {
        metadata: findMetadataPda(umi, { mint: mint.publicKey }),
        collectionMint,
        authority: umi.identity,
      }).sendAndConfirm(umi);
      console.log('[FREE MINT] Collection verified for mint:', mintAddress);
    } catch (e) {
      console.warn('[FREE MINT] Could not verify collection (you may not be the collection authority):', e);
    }
  }

  const signatureStr = Buffer.from(signature).toString('base64');

  const explorerUrl = network === 'devnet'
    ? `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`
    : `https://explorer.solana.com/address/${mintAddress}`;

  return {
    signature: signatureStr,
    mintAddress,
    explorerUrl,
  };
}

// Helper to upload to Arweave via Bundlr (for production use)
export async function uploadToArweave(
  _umi: ReturnType<typeof createUmi>,
  content: string | Uint8Array,
  contentType: string
): Promise<string> {
  // For a production app, you would use Bundlr/Irys here
  // For this demo, we're using data URIs which work but aren't ideal for large files
  const file = createGenericFile(
    typeof content === 'string' ? new TextEncoder().encode(content) : content,
    'pattern',
    { contentType }
  );

  // Return data URI for demo purposes
  const base64 = btoa(String.fromCharCode(...file.buffer));
  return `data:${contentType};base64,${base64}`;
}

export interface BurnResult {
  signature: string;
  explorerUrl: string;
}

// Burn a Pattern 303 NFT
export async function burnPatternNFT(
  wallet: WalletContextState,
  mintAddress: string,
  network: NetworkType
): Promise<BurnResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const endpoint = SOLANA_NETWORKS[network];

  // Create Umi instance
  const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));

  // Burn the NFT
  const { signature } = await burnV1(umi, {
    mint: publicKey(mintAddress),
    authority: umi.identity,
    tokenOwner: umi.identity.publicKey,
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  const signatureStr = Buffer.from(signature).toString('base64');

  const explorerUrl = network === 'devnet'
    ? `https://explorer.solana.com/tx/${signatureStr}?cluster=devnet`
    : `https://explorer.solana.com/tx/${signatureStr}`;

  return {
    signature: signatureStr,
    explorerUrl,
  };
}
