import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton />
      {connected && publicKey && (
        <span className="text-xs text-gray-500">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </span>
      )}
    </div>
  );
}
