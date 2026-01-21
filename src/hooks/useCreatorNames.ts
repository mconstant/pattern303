import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatWalletAddress, resolveWalletToDomain } from '../lib/solanaNames';
import { fetchUserNomDeGuerre } from '../lib/nomDeGuerre';
import { NetworkType } from '../types/pattern';

export interface CreatorNameOption {
  label: string;
  value: string;
  type: 'wallet' | 'sns' | 'nomDeGuerre';
}

export function useCreatorNames(network: NetworkType = 'devnet') {
  const { publicKey, connected } = useWallet();
  const [options, setOptions] = useState<CreatorNameOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [primaryName, setPrimaryName] = useState<string>('');

  useEffect(() => {
    if (!publicKey || !connected) {
      setOptions([]);
      setPrimaryName('');
      return;
    }

    const walletAddress = publicKey.toBase58();
    const shortAddress = formatWalletAddress(walletAddress);

    // Start with wallet address
    const initialOptions: CreatorNameOption[] = [
      { label: `Wallet: ${shortAddress}`, value: shortAddress, type: 'wallet' },
    ];
    setOptions(initialOptions);
    setPrimaryName(shortAddress);
    setIsLoading(true);

    // Fetch all name options in parallel
    Promise.all([
      resolveWalletToDomain(walletAddress, network),
      fetchUserNomDeGuerre(walletAddress, network),
    ])
      .then(([domain, nomDeGuerre]) => {
        const newOptions: CreatorNameOption[] = [
          { label: `Wallet: ${shortAddress}`, value: shortAddress, type: 'wallet' },
        ];

        if (domain) {
          newOptions.push({
            label: `SNS: ${domain.domain}`,
            value: domain.domain,
            type: 'sns',
          });
          // Set SNS as primary if available
          setPrimaryName(domain.domain);
        }

        if (nomDeGuerre) {
          newOptions.push({
            label: `Nom de Guerre: ${nomDeGuerre.username}`,
            value: nomDeGuerre.username,
            type: 'nomDeGuerre',
          });
          // Nom de guerre takes priority as primary name
          setPrimaryName(nomDeGuerre.username);
        }

        setOptions(newOptions);
      })
      .catch(console.warn)
      .finally(() => {
        setIsLoading(false);
      });
  }, [publicKey, connected, network]);

  return {
    options,
    isLoading,
    primaryName,
    walletAddress: publicKey?.toBase58() || '',
  };
}
