import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PatternNFT, fetchOwnedPatterns, fetchRecentPatterns } from '../lib/patternNFT';
import { NetworkType } from '../types/pattern';

export function useOwnedPatterns(network: NetworkType) {
  const { publicKey, connected } = useWallet();
  const [patterns, setPatterns] = useState<PatternNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey || !connected) {
      setPatterns([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const owned = await fetchOwnedPatterns(publicKey.toBase58(), network);
      setPatterns(owned);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch patterns');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, network]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { patterns, loading, error, refresh };
}

export function useDiscoverPatterns(network: NetworkType) {
  const [patterns, setPatterns] = useState<PatternNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const recent = await fetchRecentPatterns(network, 50);
      setPatterns(recent);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch patterns');
    } finally {
      setLoading(false);
    }
  }, [network]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { patterns, loading, error, refresh };
}
