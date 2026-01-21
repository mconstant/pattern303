import { NetworkType } from '../types/pattern';
import { getCachedDisplayName } from './solanaNames';
import { fetchUserNomDeGuerre } from './nomDeGuerre';
import { PatternNFT } from './patternNFT';

// Creator profile interface
export interface Creator {
  walletAddress: string;
  displayName: string; // SNS domain or short address
  nomDeGuerre: string | null;
  patternCount: number;
  rating: number; // Sum of upvotes
  ratedBy: string[]; // Wallet addresses that have rated this creator
  firstSeen: number; // Timestamp
  lastActive: number; // Timestamp
}

// Storage keys
const CREATORS_KEY = 'pattern303_creators';
const RATINGS_KEY = 'pattern303_ratings';

// Get all tracked creators
export function getCreators(): Record<string, Creator> {
  try {
    const stored = localStorage.getItem(CREATORS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save creators to storage
function saveCreators(creators: Record<string, Creator>) {
  try {
    localStorage.setItem(CREATORS_KEY, JSON.stringify(creators));
  } catch (e) {
    console.warn('Failed to save creators:', e);
  }
}

// Get user's ratings
export function getUserRatings(walletAddress: string): Record<string, number> {
  try {
    const key = `${RATINGS_KEY}_${walletAddress}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save user's ratings
function saveUserRatings(walletAddress: string, ratings: Record<string, number>) {
  try {
    const key = `${RATINGS_KEY}_${walletAddress}`;
    localStorage.setItem(key, JSON.stringify(ratings));
  } catch (e) {
    console.warn('Failed to save ratings:', e);
  }
}

// Track a creator when they mint a pattern
export async function trackCreator(
  walletAddress: string,
  network: NetworkType
): Promise<Creator> {
  const creators = getCreators();
  const now = Date.now();

  // Get display name (SNS or short address)
  const displayName = await getCachedDisplayName(walletAddress, network);

  // Try to get nom de guerre
  let nomDeGuerre: string | null = null;
  try {
    const ndg = await fetchUserNomDeGuerre(walletAddress, network);
    if (ndg) {
      nomDeGuerre = ndg.username;
    }
  } catch {
    // Ignore NDG fetch errors
  }

  if (creators[walletAddress]) {
    // Update existing creator
    creators[walletAddress] = {
      ...creators[walletAddress],
      displayName,
      nomDeGuerre: nomDeGuerre || creators[walletAddress].nomDeGuerre,
      patternCount: creators[walletAddress].patternCount + 1,
      lastActive: now,
    };
  } else {
    // Create new creator
    creators[walletAddress] = {
      walletAddress,
      displayName,
      nomDeGuerre,
      patternCount: 1,
      rating: 0,
      ratedBy: [],
      firstSeen: now,
      lastActive: now,
    };
  }

  saveCreators(creators);
  return creators[walletAddress];
}

// Update a creator's display info (called when viewing profiles)
export async function refreshCreatorInfo(
  walletAddress: string,
  network: NetworkType
): Promise<Creator | null> {
  const creators = getCreators();

  if (!creators[walletAddress]) {
    return null;
  }

  // Get fresh display name
  const displayName = await getCachedDisplayName(walletAddress, network);

  // Try to get nom de guerre
  let nomDeGuerre: string | null = null;
  try {
    const ndg = await fetchUserNomDeGuerre(walletAddress, network);
    if (ndg) {
      nomDeGuerre = ndg.username;
    }
  } catch {
    // Keep existing
    nomDeGuerre = creators[walletAddress].nomDeGuerre;
  }

  creators[walletAddress] = {
    ...creators[walletAddress],
    displayName,
    nomDeGuerre,
  };

  saveCreators(creators);
  return creators[walletAddress];
}

// Rate a creator (upvote)
export function rateCreator(
  creatorAddress: string,
  raterAddress: string,
  value: 1 | -1 | 0 // 1 = upvote, -1 = remove upvote, 0 = clear
): { success: boolean; newRating: number } {
  const creators = getCreators();
  const userRatings = getUserRatings(raterAddress);

  if (!creators[creatorAddress]) {
    return { success: false, newRating: 0 };
  }

  // Can't rate yourself
  if (creatorAddress === raterAddress) {
    return { success: false, newRating: creators[creatorAddress].rating };
  }

  const creator = creators[creatorAddress];
  const previousRating = userRatings[creatorAddress] || 0;

  if (value === 0) {
    // Clear rating
    if (previousRating !== 0) {
      creator.rating -= previousRating;
      creator.ratedBy = creator.ratedBy.filter(a => a !== raterAddress);
      delete userRatings[creatorAddress];
    }
  } else if (value === 1) {
    // Upvote
    if (previousRating === 1) {
      // Already upvoted, remove it
      creator.rating -= 1;
      creator.ratedBy = creator.ratedBy.filter(a => a !== raterAddress);
      delete userRatings[creatorAddress];
    } else {
      // Add upvote (or change from downvote if we had that)
      creator.rating += (1 - previousRating);
      if (!creator.ratedBy.includes(raterAddress)) {
        creator.ratedBy.push(raterAddress);
      }
      userRatings[creatorAddress] = 1;
    }
  }

  saveCreators(creators);
  saveUserRatings(raterAddress, userRatings);

  return { success: true, newRating: creator.rating };
}

// Sort options
export type CreatorSortField = 'displayName' | 'nomDeGuerre' | 'walletAddress' | 'patternCount' | 'rating' | 'lastActive';
export type SortDirection = 'asc' | 'desc';

// Get sorted and filtered creator list
export function getCreatorList(options: {
  sortBy?: CreatorSortField;
  sortDir?: SortDirection;
  search?: string;
  minPatterns?: number;
  minRating?: number;
}): Creator[] {
  const {
    sortBy = 'rating',
    sortDir = 'desc',
    search = '',
    minPatterns = 0,
    minRating = 0,
  } = options;

  const creators = getCreators();
  let list = Object.values(creators);

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    list = list.filter(c =>
      c.displayName.toLowerCase().includes(searchLower) ||
      c.walletAddress.toLowerCase().includes(searchLower) ||
      (c.nomDeGuerre && c.nomDeGuerre.toLowerCase().includes(searchLower))
    );
  }

  // Filter by minimum patterns
  if (minPatterns > 0) {
    list = list.filter(c => c.patternCount >= minPatterns);
  }

  // Filter by minimum rating
  if (minRating > 0) {
    list = list.filter(c => c.rating >= minRating);
  }

  // Sort
  list.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortBy) {
      case 'displayName':
        aVal = a.displayName.toLowerCase();
        bVal = b.displayName.toLowerCase();
        break;
      case 'nomDeGuerre':
        aVal = (a.nomDeGuerre || 'zzz').toLowerCase();
        bVal = (b.nomDeGuerre || 'zzz').toLowerCase();
        break;
      case 'walletAddress':
        aVal = a.walletAddress;
        bVal = b.walletAddress;
        break;
      case 'patternCount':
        aVal = a.patternCount;
        bVal = b.patternCount;
        break;
      case 'rating':
        aVal = a.rating;
        bVal = b.rating;
        break;
      case 'lastActive':
        aVal = a.lastActive;
        bVal = b.lastActive;
        break;
      default:
        aVal = a.rating;
        bVal = b.rating;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return list;
}

// Get a single creator
export function getCreator(walletAddress: string): Creator | null {
  const creators = getCreators();
  return creators[walletAddress] || null;
}

// Import creators from pattern mint tracking (legacy localStorage-based)
export function syncCreatorsFromMints() {
  // This will be called to sync creators from the tracked mints
  const mintsKey = 'pattern303_known_mints';
  try {
    const stored = localStorage.getItem(mintsKey);
    if (!stored) return;

    const mints: { mint: string; name: string; owner: string; timestamp: number }[] = JSON.parse(stored);
    const creators = getCreators();

    // Group by owner
    const ownerPatterns: Record<string, number> = {};
    const ownerFirstSeen: Record<string, number> = {};
    const ownerLastActive: Record<string, number> = {};

    for (const mint of mints) {
      ownerPatterns[mint.owner] = (ownerPatterns[mint.owner] || 0) + 1;
      if (!ownerFirstSeen[mint.owner] || mint.timestamp < ownerFirstSeen[mint.owner]) {
        ownerFirstSeen[mint.owner] = mint.timestamp;
      }
      if (!ownerLastActive[mint.owner] || mint.timestamp > ownerLastActive[mint.owner]) {
        ownerLastActive[mint.owner] = mint.timestamp;
      }
    }

    // Update or create creators
    for (const [owner, count] of Object.entries(ownerPatterns)) {
      if (creators[owner]) {
        creators[owner].patternCount = Math.max(creators[owner].patternCount, count);
        creators[owner].lastActive = Math.max(creators[owner].lastActive, ownerLastActive[owner]);
      } else {
        creators[owner] = {
          walletAddress: owner,
          displayName: `${owner.slice(0, 4)}...${owner.slice(-4)}`,
          nomDeGuerre: null,
          patternCount: count,
          rating: 0,
          ratedBy: [],
          firstSeen: ownerFirstSeen[owner],
          lastActive: ownerLastActive[owner],
        };
      }
    }

    saveCreators(creators);
  } catch (e) {
    console.warn('Failed to sync creators from mints:', e);
  }
}

// Sync creators from discovered patterns (from collection query)
export function syncCreatorsFromPatterns(patterns: PatternNFT[]) {
  if (!patterns || patterns.length === 0) return;

  const creators = getCreators();
  const now = Date.now();

  // Group patterns by owner
  const ownerPatterns: Record<string, PatternNFT[]> = {};
  for (const pattern of patterns) {
    const owner = pattern.owner;
    if (!owner || owner === 'Unknown') continue;
    if (!ownerPatterns[owner]) {
      ownerPatterns[owner] = [];
    }
    ownerPatterns[owner].push(pattern);
  }

  // Update or create creators
  for (const [owner, ownerPats] of Object.entries(ownerPatterns)) {
    const count = ownerPats.length;

    if (creators[owner]) {
      // Update existing creator with potentially higher count
      creators[owner].patternCount = Math.max(creators[owner].patternCount, count);
      creators[owner].lastActive = now;
    } else {
      // Create new creator
      creators[owner] = {
        walletAddress: owner,
        displayName: `${owner.slice(0, 4)}...${owner.slice(-4)}`,
        nomDeGuerre: null,
        patternCount: count,
        rating: 0,
        ratedBy: [],
        firstSeen: now,
        lastActive: now,
      };
    }
  }

  saveCreators(creators);
  console.log(`Synced ${Object.keys(ownerPatterns).length} creators from ${patterns.length} patterns`);
}
