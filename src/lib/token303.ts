import { Connection, PublicKey } from '@solana/web3.js';
import { NetworkType } from '../types/pattern';
import { SOLANA_NETWORKS } from './constants';

/**
 * Pattern 303 Token ($303)
 *
 * Token Details:
 * - Name: Pattern 303
 * - Symbol: 303
 * - Total Supply: 3,030,000,000 (3.03 Billion)
 * - Decimals: 9 (like most Solana memecoins)
 *
 * Tokenomics (Banano-inspired):
 * - Fair launch on pump.fun
 * - No pre-mine, no team allocation
 * - Community-driven distribution
 *
 * Holder Benefits:
 * - 303+ tokens: Free pattern minting (only pay Solana fees)
 * - 303+ tokens: Discounted nom de guerre changes (0.0108 SOL vs 0.0303 SOL)
 *
 * The token mint address will be set after launch on pump.fun
 */

// Token configuration - update after pump.fun launch
export const TOKEN_303_CONFIG = {
  // This will be set after pump.fun launch
  mintAddress: import.meta.env.VITE_303_TOKEN_MINT || '',
  symbol: '303',
  name: 'Pattern 303',
  decimals: 9,
  totalSupply: 3_030_000_000,

  // Holder threshold for benefits (303 tokens)
  holderThreshold: 303,

  // Benefits
  freeMintingThreshold: 303, // Hold 303+ tokens for free minting
  discountedNdgThreshold: 303, // Hold 303+ tokens for discounted NDG changes
};

// Get Pump.fun link for the 303 token mint. Falls back to search if mint is not configured.
export function getPumpFunUrl(): string {
  if (TOKEN_303_CONFIG.mintAddress) {
    return `https://pump.fun/coin/${TOKEN_303_CONFIG.mintAddress}`;
  }
  return 'https://pump.fun/search?query=Pattern%20303';
}

// Check if token is configured
export function isTokenConfigured(): boolean {
  return !!TOKEN_303_CONFIG.mintAddress;
}

// Get token balance for a wallet
export async function getToken303Balance(
  walletAddress: string,
  network: NetworkType
): Promise<number> {
  if (!isTokenConfigured()) {
    return 0;
  }

  try {
    const endpoint = SOLANA_NETWORKS[network];
    const connection = new Connection(endpoint, 'confirmed');

    const walletPubkey = new PublicKey(walletAddress);
    const mintPubkey = new PublicKey(TOKEN_303_CONFIG.mintAddress);

    // Get token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: mintPubkey }
    );

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    // Sum up balances from all token accounts
    let totalBalance = 0;
    for (const account of tokenAccounts.value) {
      const info = account.account.data.parsed.info;
      totalBalance += info.tokenAmount.uiAmount || 0;
    }

    return totalBalance;
  } catch (e) {
    console.error('Failed to get 303 token balance:', e);
    return 0;
  }
}

// Check if wallet qualifies for holder benefits
export async function is303Holder(
  walletAddress: string,
  network: NetworkType
): Promise<boolean> {
  const balance = await getToken303Balance(walletAddress, network);
  return balance >= TOKEN_303_CONFIG.holderThreshold;
}

// Check if wallet qualifies for free minting
export async function qualifiesForFreeMinting(
  walletAddress: string,
  network: NetworkType
): Promise<boolean> {
  const balance = await getToken303Balance(walletAddress, network);
  return balance >= TOKEN_303_CONFIG.freeMintingThreshold;
}

// Check if wallet qualifies for discounted NDG changes
export async function qualifiesForDiscountedNdg(
  walletAddress: string,
  network: NetworkType
): Promise<boolean> {
  const balance = await getToken303Balance(walletAddress, network);
  return balance >= TOKEN_303_CONFIG.discountedNdgThreshold;
}

// Get minting fee based on holder status
export function getMintingFee(is303Holder: boolean): number {
  // Regular fee is 0.0303 SOL, holders pay only Solana network fees (~0.00001 SOL)
  return is303Holder ? 0 : 0.0303;
}

// Get NDG change fee based on holder status
export function getNdgChangeFee(is303Holder: boolean): number {
  // Holders pay 0.0108 SOL, regular users pay 0.0303 SOL
  return is303Holder ? 0.0108 : 0.0303;
}

/**
 * Instructions for launching on pump.fun:
 *
 * 1. Go to pump.fun
 * 2. Create a new token with:
 *    - Name: Pattern 303
 *    - Symbol: 303
 *    - Description: The official token of the Pattern 303 TB-303 NFT platform.
 *                   Hold 303+ tokens for free pattern minting and discounts.
 *    - Image: Use the favicon/logo from the app
 *    - Twitter: (your twitter)
 *    - Website: https://p303.xyz
 *
 * 3. After creation, copy the mint address and add it to .env:
 *    VITE_303_TOKEN_MINT=<mint_address>
 *
 * 4. The token will automatically be picked up by the app
 *
 * Tokenomics notes:
 * - pump.fun handles fair launch mechanics
 * - Early buyers get tokens at lower prices
 * - As more people buy, price increases on bonding curve
 * - Once market cap hits threshold, liquidity is added to Raydium
 */
