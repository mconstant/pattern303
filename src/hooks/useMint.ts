import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Pattern303, NetworkType } from '../types/pattern';
import { mintPatternNFT, MintResult } from '../lib/metaplex';

export function useMint(pattern: Pattern303, network: NetworkType) {
  const wallet = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mint = useCallback(async () => {
    if (!wallet.connected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    setError(null);
    setMintResult(null);

    try {
      const result = await mintPatternNFT(wallet, pattern, network);
      setMintResult(result);
    } catch (err) {
      console.error('Minting error:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  }, [wallet, pattern, network]);

  const reset = useCallback(() => {
    setMintResult(null);
    setError(null);
  }, []);

  return {
    mint,
    reset,
    isMinting,
    mintResult,
    error,
    canMint: wallet.connected && !isMinting,
  };
}
