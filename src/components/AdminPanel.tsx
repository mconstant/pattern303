import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createCollectionNFT, getCollectionAddress, transferCollectionAuthority } from '../lib/metaplex';
import { TREASURY_WALLET, TOKEN_303_MINT } from '../lib/constants';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const wallet = useWallet();
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ address: string; explorerUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [transferring, setTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  const [serviceHealth, setServiceHealth] = useState<{
    authority?: string;
    balanceSol?: number | null;
    status?: string;
  } | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);

  const currentCollection = getCollectionAddress();
  const walletAddress = wallet.publicKey?.toBase58();
  const isTreasury = walletAddress && TREASURY_WALLET && walletAddress === TREASURY_WALLET;

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setServiceHealth(data))
      .catch(() => setServiceHealth(null))
      .finally(() => setServiceLoading(false));
  }, []);

  // Don't render if not treasury wallet
  if (!isTreasury) {
    return null;
  }

  const handleCreateCollection = async () => {
    // Security: Re-verify treasury wallet before action
    const currentWallet = wallet.publicKey?.toBase58();
    if (!currentWallet || !TREASURY_WALLET || currentWallet !== TREASURY_WALLET) {
      setError('Unauthorized: Not treasury wallet');
      return;
    }

    setCreating(true);
    setError(null);
    setResult(null);

    try {
      const res = await createCollectionNFT(wallet, 'mainnet-beta');
      setResult({
        address: res.collectionAddress,
        explorerUrl: res.explorerUrl,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleTransferAuthority = async () => {
    if (!serviceHealth?.authority || !currentCollection) return;

    setTransferring(true);
    setTransferError(null);
    setTransferResult(null);

    try {
      await transferCollectionAuthority(
        wallet,
        currentCollection,
        serviceHealth.authority,
        'mainnet-beta'
      );
      setTransferResult(serviceHealth.authority);
    } catch (e) {
      setTransferError(e instanceof Error ? e.message : 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-synth-panel border border-gray-700 rounded-lg max-w-lg w-full p-6 my-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-synth-accent">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          {/* Verification Service Status */}
          <div className="bg-synth-dark rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Verification Service</h3>
            {serviceLoading ? (
              <p className="text-gray-500 text-sm">Checking service...</p>
            ) : serviceHealth ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  <span className="text-green-400 text-sm">Online</span>
                </div>
                {serviceHealth.authority && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Signing Wallet</p>
                    <div className="bg-black/30 rounded p-2">
                      <code className="text-xs text-synth-silver break-all">{serviceHealth.authority}</code>
                    </div>
                    <a
                      href={`https://explorer.solana.com/address/${serviceHealth.authority}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-synth-accent hover:underline"
                    >
                      View on Explorer
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1">SOL Balance</p>
                  {serviceHealth.balanceSol != null ? (
                    <p className={`text-sm font-mono ${serviceHealth.balanceSol < 0.01 ? 'text-red-400' : serviceHealth.balanceSol < 0.05 ? 'text-amber-400' : 'text-green-400'}`}>
                      {serviceHealth.balanceSol.toFixed(4)} SOL
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">Unable to fetch balance</p>
                  )}
                  {serviceHealth.balanceSol != null && serviceHealth.balanceSol < 0.01 && (
                    <p className="text-red-400 text-xs mt-1">
                      Low balance — send SOL to the signing wallet to enable verifications
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                <span className="text-red-400 text-sm">Offline — service unreachable</span>
              </div>
            )}
          </div>

          {/* Current Collection Status */}
          <div className="bg-synth-dark rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Collection Status</h3>
            {currentCollection ? (
              <div className="space-y-2">
                <p className="text-green-400 text-sm">Collection configured</p>
                <div className="bg-black/30 rounded p-2">
                  <code className="text-xs text-synth-silver break-all">{currentCollection}</code>
                </div>
                <a
                  href={`https://explorer.solana.com/address/${currentCollection}?cluster=mainnet-beta`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-synth-accent hover:underline"
                >
                  View on Explorer
                </a>

                {/* Transfer authority to verification wallet */}
                {serviceHealth?.authority && !transferResult && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">
                      Transfer update authority to the verification service wallet so it can verify NFTs into this collection.
                    </p>
                    <p className="text-xs text-gray-500 mb-2 font-mono break-all">
                      {serviceHealth.authority}
                    </p>
                    <button
                      onClick={handleTransferAuthority}
                      disabled={transferring}
                      className="w-full px-3 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {transferring ? 'Transferring...' : 'Transfer Authority to Verification Wallet'}
                    </button>
                    {transferError && (
                      <p className="mt-2 text-red-400 text-xs">{transferError}</p>
                    )}
                  </div>
                )}
                {transferResult && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-green-400 text-sm">Authority transferred successfully</p>
                    <p className="text-xs text-gray-500 mt-1">
                      New authority: <span className="font-mono">{transferResult}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-amber-400 text-sm">No collection configured</p>
            )}
          </div>

          {/* Create Collection */}
          <div className="bg-synth-dark rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Create Collection NFT</h3>

            {currentCollection ? (
              <div className="space-y-3">
                <p className="text-green-400 text-sm">Collection is configured and active.</p>
                <p className="text-xs text-gray-500">
                  All new pattern mints will be added to this collection and discoverable globally.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  Create a new P303 collection NFT. After creation, pass the address via environment variable to your Docker container.
                </p>

                {result ? (
                  <div className="space-y-3">
                    <p className="text-green-400 text-sm">Collection created successfully! Now go store it in your GitHub Actions secrets as VITE_COLLECTION_ADDRESS</p>
                    <div className="bg-black/30 rounded p-3">
                      <p className="text-xs text-gray-400 mb-1">Collection Address:</p>
                      <code className="text-sm text-synth-accent break-all">{result.address}</code>
                    </div>
                    <div className="bg-amber-900/30 border border-amber-600/50 rounded p-3">
                      <p className="text-xs text-amber-400 mb-2">Docker build command:</p>
                      <code className="text-xs text-white break-all block">
                        docker build --build-arg VITE_COLLECTION_ADDRESS={result.address} ...
                      </code>
                    </div>
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm text-synth-accent hover:underline"
                    >
                      View on Explorer
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateCollection}
                    disabled={creating}
                    className="w-full px-4 py-3 bg-synth-accent text-black font-semibold rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating Collection...' : 'Create Collection NFT'}
                  </button>
                )}

                {error && (
                  <p className="mt-3 text-red-400 text-sm">{error}</p>
                )}
              </>
            )}
          </div>

          {/* 303 Token Status */}
          <div className="bg-synth-dark rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">303 Token Status</h3>
            {TOKEN_303_MINT ? (
              <div className="space-y-2">
                <p className="text-green-400 text-sm">Token configured</p>
                <div className="bg-black/30 rounded p-2">
                  <code className="text-xs text-synth-silver break-all">{TOKEN_303_MINT}</code>
                </div>
                <a
                  href={`https://explorer.solana.com/address/${TOKEN_303_MINT}?cluster=mainnet-beta`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-synth-accent hover:underline"
                >
                  View on Explorer
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-amber-400 text-sm">No 303 token configured</p>
                <p className="text-xs text-gray-500">
                  The 303 token enables free minting for holders. Create it via GitHub Actions workflow.
                </p>
                <a
                  href="https://github.com/mconstant/pattern303/actions/workflows/create-token.yml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-center font-semibold rounded-lg transition-colors"
                >
                  Create Token via GitHub Actions
                </a>
                <div className="bg-black/30 rounded p-3 space-y-2">
                  <p className="text-xs text-gray-400 font-semibold">Required GitHub Secrets:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li><code className="text-synth-silver">SOLANA_PRIVATE_KEY</code> - Treasury wallet private key</li>
                    <li><code className="text-synth-silver">HELIUS_API_KEY</code> - Helius RPC API key</li>
                    <li><code className="text-synth-silver">SHYFT_API_KEY</code> - Shyft API key (optional)</li>
                  </ul>
                </div>
                <div className="bg-amber-900/30 border border-amber-600/50 rounded p-3">
                  <p className="text-xs text-amber-400 mb-2">After creation, add to Docker build:</p>
                  <code className="text-xs text-white break-all block">
                    --build-arg VITE_303_TOKEN_MINT=&lt;mint_address&gt;
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Connected as Treasury Wallet</p>
            <p className="font-mono truncate">{walletAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check if current wallet is treasury
export function useIsTreasuryWallet(): boolean {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();
  return !!(walletAddress && TREASURY_WALLET && walletAddress === TREASURY_WALLET);
}
