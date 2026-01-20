import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Pattern303, NetworkType } from '../types/pattern';
import { mintPatternNFT, mintPatternNFTFree, MintResult } from '../lib/metaplex';
import { trackMintedPattern } from '../lib/patternNFT';
import { is303Holder } from '../lib/token303';

export function useMint(pattern: Pattern303, network: NetworkType) {
  const wallet = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mint = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    setError(null);
    setMintResult(null);

    try {
      // Check if user is a 303 token holder
      const isHolder = await is303Holder(wallet.publicKey.toBase58(), network);

      // Use free minting for holders, regular minting otherwise
      const result = isHolder
        ? await mintPatternNFTFree(wallet, pattern, network)
        : await mintPatternNFT(wallet, pattern, network);

      setMintResult(result);

      // Track the mint for discover tab
      trackMintedPattern(
        result.mintAddress,
        pattern.name || 'Pattern 303',
        wallet.publicKey.toBase58()
      );
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
