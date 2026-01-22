import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getCachedDisplayName, formatWalletAddress } from '../lib/solanaNames';
import { NetworkType } from '../types/pattern';

export function useSolanaName(network: NetworkType = 'mainnet-beta') {
  const { publicKey, connected } = useWallet();
  const [displayName, setDisplayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicKey || !connected) {
      setDisplayName('');
      return;
    }

    const walletAddress = publicKey.toBase58();

    // Set short address immediately
    setDisplayName(formatWalletAddress(walletAddress));
    setIsLoading(true);

    // Try to resolve domain name
    getCachedDisplayName(walletAddress, network)
      .then(name => {
        setDisplayName(name);
      })
      .catch(() => {
        // Keep the short address on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [publicKey, connected, network]);

  return {
    displayName,
    isLoading,
    walletAddress: publicKey?.toBase58() || '',
  };
}
