import { Connection, PublicKey } from '@solana/web3.js';
import { SOLANA_NETWORKS } from './constants';
import { NetworkType } from '../types/pattern';

// Known domain TLDs on Solana
const DOMAIN_TLDS = ['.sol', '.abc', '.bonk', '.poor', '.patoshi', '.backpack', '.ottr', '.glow'];

export interface ResolvedName {
  domain: string;
  tld: string;
}

// Resolve wallet address to domain name using various services
export async function resolveWalletToDomain(
  walletAddress: string,
  network: NetworkType = 'devnet'
): Promise<ResolvedName | null> {
  try {
    // Try Bonfida SNS first (.sol domains)
    const solDomain = await resolveSNS(walletAddress, network);
    if (solDomain) {
      return { domain: solDomain, tld: '.sol' };
    }

    // Try AllDomains API for other TLDs
    const allDomain = await resolveAllDomains(walletAddress);
    if (allDomain) {
      return allDomain;
    }

    return null;
  } catch (e) {
    console.error('Failed to resolve domain:', e);
    return null;
  }
}

// Resolve using Bonfida SNS API
async function resolveSNS(walletAddress: string, network: NetworkType): Promise<string | null> {
  try {
    // Use Bonfida's reverse lookup API
    const endpoint = network === 'devnet'
      ? 'https://sns-sdk-proxy.bonfida.workers.dev/favorite-domain/'
      : 'https://sns-sdk-proxy.bonfida.workers.dev/favorite-domain/';

    const response = await fetch(`${endpoint}${walletAddress}`);

    if (!response.ok) return null;

    const data = await response.json();

    if (data.result) {
      return `${data.result}.sol`;
    }

    return null;
  } catch {
    return null;
  }
}

// Resolve using AllDomains API (supports multiple TLDs)
async function resolveAllDomains(walletAddress: string): Promise<ResolvedName | null> {
  try {
    // AllDomains API for reverse lookup
    const response = await fetch(
      `https://api.alldomains.id/reverse-lookup/${walletAddress}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.domains && data.domains.length > 0) {
      const domain = data.domains[0];
      // Extract TLD
      const tld = DOMAIN_TLDS.find(t => domain.endsWith(t)) || '';
      return { domain, tld };
    }

    return null;
  } catch {
    return null;
  }
}

// Format wallet address for display (short form)
export function formatWalletAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Get display name: domain if available, otherwise short wallet address
export async function getDisplayName(
  walletAddress: string,
  network: NetworkType = 'devnet'
): Promise<string> {
  const resolved = await resolveWalletToDomain(walletAddress, network);
  if (resolved) {
    return resolved.domain;
  }
  return formatWalletAddress(walletAddress);
}

// Hook-friendly version that caches results
const nameCache = new Map<string, string>();

export async function getCachedDisplayName(
  walletAddress: string,
  network: NetworkType = 'devnet'
): Promise<string> {
  const cacheKey = `${walletAddress}-${network}`;

  if (nameCache.has(cacheKey)) {
    return nameCache.get(cacheKey)!;
  }

  const displayName = await getDisplayName(walletAddress, network);
  nameCache.set(cacheKey, displayName);

  return displayName;
}
