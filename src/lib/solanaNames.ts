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
  network: NetworkType = 'mainnet-beta'
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
async function resolveSNS(walletAddress: string, _network: NetworkType): Promise<string | null> {
  try {
    // Validate wallet address format (basic check)
    if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
      return null;
    }

    // Use Bonfida's reverse lookup API
    const endpoint = 'https://sns-sdk-proxy.bonfida.workers.dev/favorite-domain/';
    const response = await fetch(`${endpoint}${walletAddress}`);

    if (!response.ok) return null;

    const data = await response.json();

    // Check for valid result - must be a string and not an error
    if (data.result && typeof data.result === 'string' && !data.error) {
      // Validate the domain name format (should be alphanumeric with hyphens)
      const domainName = data.result;
      if (/^[a-zA-Z0-9-]+$/.test(domainName)) {
        return `${domainName}.sol`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Resolve using AllDomains API (supports multiple TLDs)
async function resolveAllDomains(walletAddress: string): Promise<ResolvedName | null> {
  try {
    // Validate wallet address format
    if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
      return null;
    }

    // AllDomains API for reverse lookup
    const response = await fetch(
      `https://api.alldomains.id/reverse-lookup/${walletAddress}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.domains && Array.isArray(data.domains) && data.domains.length > 0) {
      const domain = data.domains[0];
      // Validate domain format
      if (typeof domain === 'string' && domain.includes('.')) {
        // Extract TLD
        const tld = DOMAIN_TLDS.find(t => domain.endsWith(t)) || '';
        return { domain, tld };
      }
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
  network: NetworkType = 'mainnet-beta'
): Promise<string> {
  const resolved = await resolveWalletToDomain(walletAddress, network);
  if (resolved) {
    return resolved.domain;
  }
  return formatWalletAddress(walletAddress);
}

// Hook-friendly version that caches results
const nameCache = new Map<string, string>();

export function clearNameCache() {
  nameCache.clear();
}

export async function getCachedDisplayName(
  walletAddress: string,
  network: NetworkType = 'mainnet-beta'
): Promise<string> {
  const cacheKey = `${walletAddress}-${network}`;

  if (nameCache.has(cacheKey)) {
    const cached = nameCache.get(cacheKey)!;
    // Don't return cached values that look like errors
    if (!cached.includes('Invalid') && !cached.includes('error')) {
      return cached;
    }
    // Clear bad cache entry
    nameCache.delete(cacheKey);
  }

  const displayName = await getDisplayName(walletAddress, network);

  // Only cache valid-looking results
  if (displayName && !displayName.includes('Invalid') && !displayName.includes('error')) {
    nameCache.set(cacheKey, displayName);
  }

  return displayName;
}
