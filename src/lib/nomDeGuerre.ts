import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createNft,
  updateV1,
  mplTokenMetadata,
  fetchDigitalAsset,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  generateSigner,
  percentAmount,
  publicKey,
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
import { NetworkType } from '../types/pattern';
import { SOLANA_NETWORKS } from './constants';

// Nom de Guerre costs
export const NDG_MINT_FEE = 0.0303; // SOL to mint a new nom de guerre (regular users)
export const NDG_MINT_FEE_DISCOUNTED = 0.0108; // Discounted mint for 303 token holders
export const NDG_CHANGE_FEE = 0.0108; // SOL to change nom de guerre (for 303 token holders)
export const NDG_CHANGE_FEE_REGULAR = 0.0303; // Regular users pay full price to change

// Local storage for tracking taken usernames (client-side cache)
const TAKEN_USERNAMES_KEY = 'pattern303_taken_usernames';
const USER_NDG_KEY = 'pattern303_user_ndg';

export interface NomDeGuerre {
  mintAddress: string;
  username: string;
  owner: string;
}

// Get locally cached taken usernames
function getCachedUsernames(): Record<string, string> {
  try {
    const stored = localStorage.getItem(TAKEN_USERNAMES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Cache a taken username
function cacheUsername(username: string, owner: string) {
  try {
    const cached = getCachedUsernames();
    cached[username.toLowerCase()] = owner;
    localStorage.setItem(TAKEN_USERNAMES_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('Failed to cache username:', e);
  }
}

// Save user's NDG to localStorage
function saveUserNdg(walletAddress: string, ndg: NomDeGuerre) {
  try {
    const key = `${USER_NDG_KEY}_${walletAddress}`;
    localStorage.setItem(key, JSON.stringify(ndg));
  } catch (e) {
    console.warn('Failed to save user NDG:', e);
  }
}

// Get user's NDG from localStorage
export function getUserNdg(walletAddress: string): NomDeGuerre | null {
  try {
    const key = `${USER_NDG_KEY}_${walletAddress}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Validate username format
export function isValidUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, _ and -' };
  }
  return { valid: true };
}

// Check if username is taken (client-side cache check)
export function isUsernameTaken(username: string): boolean {
  const cached = getCachedUsernames();
  return username.toLowerCase() in cached;
}

// Get treasury wallet from env
function getTreasuryWallet(): string | undefined {
  return import.meta.env.VITE_TREASURY_WALLET;
}

// Pay fee to treasury
async function payFee(
  wallet: WalletContextState,
  connection: Connection,
  amount: number
): Promise<string> {
  const treasury = getTreasuryWallet();
  if (!treasury) {
    throw new Error('Treasury wallet not configured');
  }

  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const treasuryPubkey = new PublicKey(treasury);
  const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

  const transferInstruction = SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: treasuryPubkey,
    lamports,
  });

  const transaction = new Transaction().add(transferInstruction);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  const signedTransaction = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  });

  return signature;
}

// Mint a new nom de guerre NFT
export async function mintNomDeGuerre(
  wallet: WalletContextState,
  username: string,
  network: NetworkType,
  is303Holder: boolean = false
): Promise<NomDeGuerre> {
  // Validate
  const validation = isValidUsername(username);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (isUsernameTaken(username)) {
    throw new Error(`Username "${username}" is already taken`);
  }

  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const endpoint = SOLANA_NETWORKS[network];
  const connection = new Connection(endpoint, 'confirmed');

  // Pay minting fee (discounted for 303 holders)
  const mintFee = is303Holder ? NDG_MINT_FEE_DISCOUNTED : NDG_MINT_FEE;
  await payFee(wallet, connection, mintFee);

  // Create Umi instance
  const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));

  // Create the nom de guerre NFT
  // URI format: https://p303.xyz/ndg/{username}
  const metadataUri = `https://p303.xyz/ndg/${encodeURIComponent(username)}`;

  const mint = generateSigner(umi);

  await createNft(umi, {
    mint,
    name: `NDG: ${username}`,
    symbol: 'NDG',
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: false,
  }).sendAndConfirm(umi);

  const mintAddress = mint.publicKey.toString();
  const owner = wallet.publicKey.toBase58();

  // Cache the username
  cacheUsername(username, owner);

  const ndg: NomDeGuerre = {
    mintAddress,
    username,
    owner,
  };

  // Save to user's local storage
  saveUserNdg(owner, ndg);

  return ndg;
}

// Change existing nom de guerre (update the NFT name/URI)
export async function changeNomDeGuerre(
  wallet: WalletContextState,
  existingMintAddress: string,
  newUsername: string,
  network: NetworkType,
  is303Holder: boolean = false
): Promise<NomDeGuerre> {
  // Validate
  const validation = isValidUsername(newUsername);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (isUsernameTaken(newUsername)) {
    throw new Error(`Username "${newUsername}" is already taken`);
  }

  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const endpoint = SOLANA_NETWORKS[network];
  const connection = new Connection(endpoint, 'confirmed');

  // Pay change fee (discounted for 303 holders)
  const fee = is303Holder ? NDG_CHANGE_FEE : NDG_CHANGE_FEE_REGULAR;
  await payFee(wallet, connection, fee);

  // Create Umi instance
  const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));

  // Update the NFT
  const metadataUri = `https://p303.xyz/ndg/${encodeURIComponent(newUsername)}`;

  const asset = await fetchDigitalAsset(umi, publicKey(existingMintAddress));

  await updateV1(umi, {
    mint: publicKey(existingMintAddress),
    authority: umi.identity,
    data: {
      ...asset.metadata,
      name: `NDG: ${newUsername}`,
      uri: metadataUri,
    },
  }).sendAndConfirm(umi);

  const owner = wallet.publicKey.toBase58();

  // Update cache
  cacheUsername(newUsername, owner);

  const ndg: NomDeGuerre = {
    mintAddress: existingMintAddress,
    username: newUsername,
    owner,
  };

  // Save to user's local storage
  saveUserNdg(owner, ndg);

  return ndg;
}

// Fetch user's nom de guerre from blockchain
export async function fetchUserNomDeGuerre(
  walletAddress: string,
  network: NetworkType
): Promise<NomDeGuerre | null> {
  try {
    const dasEndpoint = network === 'devnet'
      ? 'https://devnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92'
      : 'https://mainnet.helius-rpc.com/?api-key=9193208f-feae-4b68-9be6-8314a1443c45';

    const response = await fetch(dasEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'ndg-fetch',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 100,
        },
      }),
    });

    const data = await response.json();

    if (!data.result?.items) {
      return null;
    }

    // Find NDG NFT
    for (const item of data.result.items) {
      if (item.content?.metadata?.symbol === 'NDG') {
        const uri = item.content?.json_uri || '';
        // Extract username from URI: https://p303.xyz/ndg/{username}
        const match = uri.match(/\/ndg\/([^\/]+)$/);
        if (match) {
          const username = decodeURIComponent(match[1]);
          const ndg: NomDeGuerre = {
            mintAddress: item.id,
            username,
            owner: walletAddress,
          };

          // Cache it
          cacheUsername(username, walletAddress);
          saveUserNdg(walletAddress, ndg);

          return ndg;
        }
      }
    }

    return null;
  } catch (e) {
    console.error('Failed to fetch nom de guerre:', e);
    // Fall back to local storage
    return getUserNdg(walletAddress);
  }
}
