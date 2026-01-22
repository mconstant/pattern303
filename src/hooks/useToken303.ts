import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { NetworkType } from '../types/pattern';
import {
  getToken303Balance,
  is303Holder,
  isTokenConfigured,
  TOKEN_303_CONFIG,
  getMintingFee,
  getNdgChangeFee,
} from '../lib/token303';

export function useToken303(network: NetworkType = 'mainnet-beta') {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isHolder, setIsHolder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey || !connected || !isTokenConfigured()) {
      setBalance(0);
      setIsHolder(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletAddress = publicKey.toBase58();
      const [tokenBalance, holderStatus] = await Promise.all([
        getToken303Balance(walletAddress, network),
        is303Holder(walletAddress, network),
      ]);

      setBalance(tokenBalance);
      setIsHolder(holderStatus);
    } catch (e) {
      console.error('Failed to fetch 303 token info:', e);
      setError(e instanceof Error ? e.message : 'Failed to fetch token balance');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, network]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    balance,
    isHolder,
    loading,
    error,
    refresh,
    isConfigured: isTokenConfigured(),
    threshold: TOKEN_303_CONFIG.holderThreshold,
    mintingFee: getMintingFee(isHolder),
    ndgChangeFee: getNdgChangeFee(isHolder),
    tokenSymbol: TOKEN_303_CONFIG.symbol,
    tokenName: TOKEN_303_CONFIG.name,
  };
}
