import { Pattern303, DEFAULT_STEP, NetworkType } from '../types/pattern';
import { COLLECTION_ADDRESS } from './constants';

export interface PatternNFT {
  mintAddress: string;
  name: string;
  owner: string;
  pattern: Pattern303;
  uri: string;
  image?: string;
}

// Decode pattern from our compact URI format
// Format: https://p303.xyz/{tempo}/{waveform}/{synth_params}/{steps}
export function decodePatternFromUri(uri: string): Pattern303 | null {
  try {
    const url = new URL(uri);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts.length < 4) return null;

    const [tempoStr, waveformCode, paramsHex, stepsHex] = parts;

    const tempo = parseInt(tempoStr, 10);
    const waveform = waveformCode === 's' ? 'saw' : 'square';

    // Decode synth params (5 x 2-char hex = 10 chars)
    const cutoff = parseInt(paramsHex.slice(0, 2), 16);
    const resonance = parseInt(paramsHex.slice(2, 4), 16);
    const envMod = parseInt(paramsHex.slice(4, 6), 16);
    const decay = parseInt(paramsHex.slice(6, 8), 16);
    const accent = parseInt(paramsHex.slice(8, 10), 16);

    // Decode steps (16 x 3-char = 48 chars)
    const steps = [];
    for (let i = 0; i < 16; i++) {
      const stepHex = stepsHex.slice(i * 3, i * 3 + 3);
      if (stepHex.length < 3) {
        steps.push({ ...DEFAULT_STEP });
        continue;
      }

      const byte = parseInt(stepHex.slice(0, 2), 16);
      const slideFlag = stepHex[2] === '1';

      // Convert legacy boolean gate to GateType
      const gateFlag = ((byte >> 1) & 0x1) === 1;

      steps.push({
        pitch: (byte >> 4) & 0xF,
        octave: (((byte >> 2) & 0x3) - 1) as -1 | 0 | 1,
        gate: gateFlag ? 'note' as const : 'rest' as const,
        accent: (byte & 0x1) === 1,
        slide: slideFlag,
      });
    }

    return {
      name: 'Loaded Pattern',
      creator: '',
      tempo,
      waveform,
      cutoff,
      resonance,
      envMod,
      decay,
      accent,
      steps,
    };
  } catch (e) {
    console.error('Failed to decode pattern URI:', e);
    return null;
  }
}

// Get the DAS API endpoint for the given network
function getDasEndpoint(network: NetworkType): string {
  return network === 'devnet'
    ? 'https://devnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92'
    : 'https://mainnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92';
}

// Extract P303 patterns from DAS API response items
function extractPatternsFromItems(items: any[], ownerAddress?: string): PatternNFT[] {
  const patterns: PatternNFT[] = [];

  for (const item of items) {
    // Check if it's a P303 NFT by symbol or URI pattern
    const isP303 = item.content?.metadata?.symbol === 'P303' ||
                   item.content?.json_uri?.includes('p303.xyz');

    if (!isP303) continue;

    const uri = item.content?.json_uri || '';
    const pattern = decodePatternFromUri(uri);

    if (pattern) {
      pattern.name = item.content?.metadata?.name || 'Pattern 303';
      patterns.push({
        mintAddress: item.id,
        name: item.content?.metadata?.name || 'Pattern 303',
        owner: item.ownership?.owner || ownerAddress || 'Unknown',
        pattern,
        uri,
        image: item.content?.links?.image,
      });
    }
  }

  return patterns;
}

// Fetch all P303 NFTs owned by a wallet
export async function fetchOwnedPatterns(
  walletAddress: string,
  network: NetworkType
): Promise<PatternNFT[]> {
  try {
    const dasEndpoint = getDasEndpoint(network);

    const response = await fetch(dasEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'pattern303',
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
      return [];
    }

    return extractPatternsFromItems(data.result.items, walletAddress);
  } catch (e) {
    console.error('Failed to fetch owned patterns:', e);
    return [];
  }
}

// Local storage key for tracking known P303 mints
const KNOWN_MINTS_KEY = 'pattern303_known_mints';

// Save a newly minted pattern to local tracking
export function trackMintedPattern(mintAddress: string, name: string, owner: string) {
  try {
    const stored = localStorage.getItem(KNOWN_MINTS_KEY);
    const mints: { mint: string; name: string; owner: string; timestamp: number }[] = stored ? JSON.parse(stored) : [];

    // Avoid duplicates
    if (!mints.some(m => m.mint === mintAddress)) {
      mints.unshift({ mint: mintAddress, name, owner, timestamp: Date.now() });
      // Keep last 500 mints
      localStorage.setItem(KNOWN_MINTS_KEY, JSON.stringify(mints.slice(0, 500)));
    }
  } catch (e) {
    console.warn('Failed to track minted pattern:', e);
  }
}

// Get locally tracked mints
export function getTrackedMints(): { mint: string; name: string; owner: string; timestamp: number }[] {
  try {
    const stored = localStorage.getItem(KNOWN_MINTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Get unique creators from tracked mints
function getKnownCreators(): string[] {
  const mints = getTrackedMints();
  const creators = new Set<string>();
  for (const mint of mints) {
    if (mint.owner) {
      creators.add(mint.owner);
    }
  }
  return Array.from(creators);
}

// Fetch all P303 NFTs from the collection using getAssetsByGroup
async function fetchPatternsFromCollection(
  network: NetworkType,
  limit: number = 50
): Promise<PatternNFT[]> {
  if (!COLLECTION_ADDRESS) {
    console.log('No collection address configured, skipping collection fetch');
    return [];
  }

  const dasEndpoint = getDasEndpoint(network);

  try {
    console.log(`Fetching patterns from collection: ${COLLECTION_ADDRESS}`);

    const response = await fetch(dasEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'p303-collection',
        method: 'getAssetsByGroup',
        params: {
          groupKey: 'collection',
          groupValue: COLLECTION_ADDRESS,
          page: 1,
          limit: limit,
        },
      }),
    });

    const data = await response.json();

    if (!data.result?.items) {
      console.log('No items found in collection');
      return [];
    }

    console.log(`Found ${data.result.items.length} items in collection`);
    return extractPatternsFromItems(data.result.items);
  } catch (e) {
    console.error('Failed to fetch patterns from collection:', e);
    return [];
  }
}

// Fetch recent P303 NFTs
// Primary strategy: Query collection via getAssetsByGroup
// Fallback: Query known creators and tracked mints (for backwards compatibility)
export async function fetchRecentPatterns(
  network: NetworkType,
  limit: number = 50
): Promise<PatternNFT[]> {
  const dasEndpoint = getDasEndpoint(network);
  const allPatterns: PatternNFT[] = [];
  const seenMints = new Set<string>();

  try {
    // Primary strategy: Fetch from collection
    if (COLLECTION_ADDRESS) {
      const collectionPatterns = await fetchPatternsFromCollection(network, limit);
      for (const p of collectionPatterns) {
        if (!seenMints.has(p.mintAddress)) {
          seenMints.add(p.mintAddress);
          allPatterns.push(p);
        }
      }

      // If we got patterns from the collection, return them
      if (allPatterns.length > 0) {
        return allPatterns.slice(0, limit);
      }
    }

    // Fallback: Fetch from known creators (for patterns minted before collection was set up)
    const creators = getKnownCreators();
    console.log(`Fallback: Fetching patterns from ${creators.length} known creators`);

    // Fetch patterns from each creator in parallel
    const creatorPromises = creators.slice(0, 10).map(async (creatorAddress) => {
      try {
        const response = await fetch(dasEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: `p303-creator-${creatorAddress}`,
            method: 'getAssetsByOwner',
            params: {
              ownerAddress: creatorAddress,
              page: 1,
              limit: 20,
            },
          }),
        });

        const data = await response.json();
        if (data.result?.items) {
          return extractPatternsFromItems(data.result.items, creatorAddress);
        }
        return [];
      } catch {
        return [];
      }
    });

    const creatorResults = await Promise.all(creatorPromises);
    for (const patterns of creatorResults) {
      for (const p of patterns) {
        if (!seenMints.has(p.mintAddress)) {
          seenMints.add(p.mintAddress);
          allPatterns.push(p);
        }
      }
    }

    // Also fetch individually tracked mints (in case owner transferred)
    const trackedMints = getTrackedMints();
    const mintAddressesToFetch = trackedMints
      .filter(m => !seenMints.has(m.mint))
      .slice(0, 20)
      .map(m => m.mint);

    if (mintAddressesToFetch.length > 0) {
      const mintPromises = mintAddressesToFetch.map(async (mintAddress) => {
        try {
          const response = await fetch(dasEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: `p303-mint-${mintAddress}`,
              method: 'getAsset',
              params: { id: mintAddress },
            }),
          });

          const data = await response.json();
          const item = data.result;
          if (!item) return null;

          const uri = item.content?.json_uri || '';
          const pattern = decodePatternFromUri(uri);
          if (!pattern) return null;

          pattern.name = item.content?.metadata?.name || 'Pattern 303';

          return {
            mintAddress: item.id,
            name: item.content?.metadata?.name || 'Pattern 303',
            owner: item.ownership?.owner || 'Unknown',
            pattern,
            uri,
            image: item.content?.links?.image,
          } as PatternNFT;
        } catch {
          return null;
        }
      });

      const mintResults = await Promise.all(mintPromises);
      for (const p of mintResults) {
        if (p && !seenMints.has(p.mintAddress)) {
          seenMints.add(p.mintAddress);
          allPatterns.push(p);
        }
      }
    }

    return allPatterns.slice(0, limit);
  } catch (e) {
    console.error('Failed to fetch recent patterns:', e);
    return [];
  }
}

// Get a single pattern by mint address
export async function fetchPatternByMint(
  mintAddress: string,
  network: NetworkType
): Promise<PatternNFT | null> {
  try {
    const dasEndpoint = getDasEndpoint(network);

    const response = await fetch(dasEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'pattern303-get',
        method: 'getAsset',
        params: { id: mintAddress },
      }),
    });

    const data = await response.json();
    const item = data.result;

    if (!item) return null;

    const uri = item.content?.json_uri || '';
    const pattern = decodePatternFromUri(uri);

    if (!pattern) return null;

    pattern.name = item.content?.metadata?.name || 'Pattern 303';

    return {
      mintAddress: item.id,
      name: item.content?.metadata?.name || 'Pattern 303',
      owner: item.ownership?.owner || 'Unknown',
      pattern,
      uri,
      image: item.content?.links?.image,
    };
  } catch (e) {
    console.error('Failed to fetch pattern:', e);
    return null;
  }
}

// Fetch patterns by a specific creator address
export async function fetchPatternsByCreator(
  creatorAddress: string,
  network: NetworkType
): Promise<PatternNFT[]> {
  return fetchOwnedPatterns(creatorAddress, network);
}
