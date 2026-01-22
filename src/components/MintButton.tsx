import { useState } from 'react';
import { Pattern303, NetworkType } from '../types/pattern';
import { useMint } from '../hooks/useMint';
import { useToken303 } from '../hooks/useToken303';
import { patternToSvg, svgToDataUri } from '../lib/patternToSvg';
import { getMintFee, getTreasuryWallet } from '../lib/metaplex';

interface MintButtonProps {
  pattern: Pattern303;
  network: NetworkType;
}

export function MintButton({ pattern, network }: MintButtonProps) {
  const { mint, reset, isMinting, mintResult, error, canMint } = useMint(pattern, network);
  const { isHolder, balance, isConfigured, threshold } = useToken303(network);
  const [showPreview, setShowPreview] = useState(false);

  const svgDataUri = svgToDataUri(patternToSvg(pattern));
  const regularMintFee = getMintFee();
  const treasuryWallet = getTreasuryWallet();
  const hasTreasury = !!treasuryWallet;

  // Effective fee - free for 303 holders (just network fees), regular price otherwise
  const effectiveFee = isHolder ? 0 : regularMintFee;
  const feeDisplay = isHolder ? 'FREE' : `${effectiveFee} SOL`;

  return (
    <div className="flex flex-col gap-4">
      {/* 303 Token Status */}
      {isConfigured && (
        <div className={`p-3 rounded-lg ${isHolder ? 'bg-green-900/30 border border-green-600' : 'bg-gray-800 border border-gray-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold ${isHolder ? 'text-green-400' : 'text-gray-400'}`}>
                {isHolder ? '303 Holder Benefits Active' : '$303 Token Holder Benefits'}
              </p>
              <p className="text-xs text-gray-500">
                {isHolder
                  ? `You hold ${balance.toFixed(2)} $303 - Free minting unlocked!`
                  : `Hold ${threshold}+ $303 tokens for free pattern minting`
                }
              </p>
            </div>
            {isHolder && (
              <span className="text-2xl">🎫</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Preview button */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-synth-panel hover:bg-gray-600 text-synth-silver rounded transition-colors"
        >
          {showPreview ? 'Hide Preview' : 'Preview NFT'}
        </button>

        {/* Mint button */}
        <button
          onClick={mint}
          disabled={!canMint || (!hasTreasury && !isHolder)}
          className={`
            px-6 py-3 rounded-lg font-bold text-lg transition-all
            ${canMint && (hasTreasury || isHolder)
              ? isHolder
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-synth-accent to-orange-500 hover:from-orange-500 hover:to-synth-accent text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isMinting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Minting...
            </span>
          ) : (
            <span className="flex flex-col items-center">
              <span>Mint as NFT</span>
              <span className="text-xs opacity-80">
                {isHolder && <span className="line-through mr-1 text-gray-400">{regularMintFee} SOL</span>}
                {feeDisplay}
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Treasury config warning */}
      {!hasTreasury && !isHolder && (
        <div className="p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg text-yellow-200 text-sm">
          <p className="font-bold">Treasury wallet not configured</p>
          <p className="text-xs mt-1">Set VITE_TREASURY_WALLET in your .env file to enable minting</p>
        </div>
      )}

      {/* Preview */}
      {showPreview && (
        <div className="p-4 bg-synth-dark rounded-lg">
          <h3 className="text-synth-silver mb-2">NFT Preview</h3>
          <img
            src={svgDataUri}
            alt="Pattern preview"
            className="w-full max-w-2xl rounded border border-gray-600"
          />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={reset}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success display */}
      {mintResult && (
        <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">
          <p className="font-bold">NFT Minted Successfully!</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              <span className="text-gray-400">Mint Address:</span>{' '}
              <code className="text-green-300">{mintResult.mintAddress.slice(0, 8)}...{mintResult.mintAddress.slice(-8)}</code>
            </p>
            <p className="text-yellow-200 text-xs mt-2">
              ℹ️ Your pattern may take a moment to appear in "My Patterns" and "All Patterns". Click the Refresh button on those pages if it doesn't show up immediately.
            </p>
            <a
              href={mintResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-white text-sm"
            >
              View on Solana Explorer
            </a>
          </div>
          <button
            onClick={reset}
            className="mt-3 text-xs text-green-400 hover:text-green-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
