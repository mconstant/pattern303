import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { NetworkType } from '../types/pattern';
import {
  NomDeGuerre,
  fetchUserNomDeGuerre,
  mintNomDeGuerre,
  changeNomDeGuerre,
  isValidUsername,
  isUsernameTaken,
  getUserNdg,
  NDG_MINT_FEE,
  NDG_MINT_FEE_DISCOUNTED,
  NDG_CHANGE_FEE,
  NDG_CHANGE_FEE_REGULAR,
} from '../lib/nomDeGuerre';

export function useNomDeGuerre(network: NetworkType = 'mainnet-beta') {
  const wallet = useWallet();
  const [nomDeGuerre, setNomDeGuerre] = useState<NomDeGuerre | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Load nom de guerre when wallet connects
  const refresh = useCallback(async () => {
    if (!wallet.publicKey) {
      setNomDeGuerre(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check localStorage
      const cached = getUserNdg(wallet.publicKey.toBase58());
      if (cached) {
        setNomDeGuerre(cached);
      }

      // Then fetch from blockchain
      const ndg = await fetchUserNomDeGuerre(wallet.publicKey.toBase58(), network);
      setNomDeGuerre(ndg);
    } catch (e) {
      console.error('Failed to fetch nom de guerre:', e);
      setError(e instanceof Error ? e.message : 'Failed to load nom de guerre');
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, network]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Mint a new nom de guerre
  const mint = useCallback(async (
    username: string,
    is303Holder: boolean = false
  ): Promise<NomDeGuerre | null> => {
    if (!wallet.connected) {
      setError('Please connect your wallet first');
      return null;
    }

    setIsMinting(true);
    setError(null);

    try {
      const ndg = await mintNomDeGuerre(wallet, username, network, is303Holder);
      setNomDeGuerre(ndg);
      return ndg;
    } catch (e) {
      console.error('Failed to mint nom de guerre:', e);
      setError(e instanceof Error ? e.message : 'Failed to mint nom de guerre');
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [wallet, network]);

  // Change existing nom de guerre
  const change = useCallback(async (
    newUsername: string,
    is303Holder: boolean = false
  ): Promise<NomDeGuerre | null> => {
    if (!wallet.connected || !nomDeGuerre) {
      setError('No nom de guerre to change');
      return null;
    }

    setIsMinting(true);
    setError(null);

    try {
      const ndg = await changeNomDeGuerre(
        wallet,
        nomDeGuerre.mintAddress,
        newUsername,
        network,
        is303Holder
      );
      setNomDeGuerre(ndg);
      return ndg;
    } catch (e) {
      console.error('Failed to change nom de guerre:', e);
      setError(e instanceof Error ? e.message : 'Failed to change nom de guerre');
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [wallet, nomDeGuerre, network]);

  return {
    nomDeGuerre,
    loading,
    error,
    isMinting,
    mint,
    change,
    refresh,
    hasNomDeGuerre: !!nomDeGuerre,
    validateUsername: isValidUsername,
    isUsernameTaken,
    mintFee: NDG_MINT_FEE,
    mintFeeDiscounted: NDG_MINT_FEE_DISCOUNTED,
    changeFee: NDG_CHANGE_FEE,
    changeFeeDiscounted: NDG_CHANGE_FEE,
    changeFeeFull: NDG_CHANGE_FEE_REGULAR,
  };
}
