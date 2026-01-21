import { Pattern303, DEFAULT_STEP, NetworkType } from '../types/pattern';

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

// Fetch all P303 NFTs owned by a wallet
export async function fetchOwnedPatterns(
  walletAddress: string,
  network: NetworkType
): Promise<PatternNFT[]> {
  try {
    // Use Metaplex DAS API for devnet/mainnet
    const dasEndpoint = network === 'devnet'
      ? 'https://devnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92'
      : 'https://mainnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92';

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

    // Filter for P303 NFTs and decode patterns
    const patterns: PatternNFT[] = [];

    for (const item of data.result.items) {
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
          owner: walletAddress,
          pattern,
          uri,
          image: item.content?.links?.image,
        });
      }
    }

    return patterns;
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

// Fetch recent P303 NFTs (for discovery/browse)
export async function fetchRecentPatterns(
  network: NetworkType,
  limit: number = 50
): Promise<PatternNFT[]> {
  try {
    const dasEndpoint = network === 'devnet'
      ? 'https://devnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92'
      : 'https://mainnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92';

    // Get locally tracked mints first
    const trackedMints = getTrackedMints().slice(0, limit);

    if (trackedMints.length === 0) {
      return [];
    }

    // Fetch each tracked mint in parallel
    const fetchPromises = trackedMints.map(async ({ mint, owner: trackedOwner }) => {
      try {
        const response = await fetch(dasEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: `p303-${mint}`,
            method: 'getAsset',
            params: { id: mint },
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
          owner: item.ownership?.owner || trackedOwner || 'Unknown',
          pattern,
          uri,
          image: item.content?.links?.image,
        } as PatternNFT;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    return results.filter((p): p is PatternNFT => p !== null);
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
    const dasEndpoint = network === 'devnet'
      ? 'https://devnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92'
      : 'https://mainnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92';

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
