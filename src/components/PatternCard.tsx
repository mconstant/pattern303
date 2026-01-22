import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PatternNFT } from '../lib/patternNFT';
import { burnPatternNFT } from '../lib/metaplex';
import { MiniPatternSheet } from './MiniPatternSheet';
import { useSynth } from '../hooks/useSynth';
import { NetworkType } from '../types/pattern';

interface PatternCardProps {
  patternNFT: PatternNFT;
  onSelect?: (pattern: PatternNFT) => void;
  onBurn?: (mintAddress: string) => void;
  showOwner?: boolean;
  canBurn?: boolean;
  network?: NetworkType;
}

export function PatternCard({
  patternNFT,
  onSelect,
  onBurn,
  showOwner = false,
  canBurn = false,
  network = 'mainnet-beta',
}: PatternCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [burnError, setBurnError] = useState<string | null>(null);
  const { togglePlayback, stop } = useSynth(patternNFT.pattern);
  const wallet = useWallet();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      togglePlayback();
      setIsPlaying(true);
    }
  };

  const handleClick = () => {
    if (!showConfirm) {
      onSelect?.(patternNFT);
    }
  };

  const handleBurnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmBurn = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!wallet.connected) return;

    setIsBurning(true);
    setBurnError(null);

    try {
      await burnPatternNFT(wallet, patternNFT.mintAddress, network);
      onBurn?.(patternNFT.mintAddress);
    } catch (err) {
      console.error('Burn error:', err);
      setBurnError(err instanceof Error ? err.message : 'Failed to burn NFT');
    } finally {
      setIsBurning(false);
      setShowConfirm(false);
    }
  };

  const handleCancelBurn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
    setBurnError(null);
  };

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div
      onClick={handleClick}
      className="bg-synth-panel rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-synth-accent transition-all relative"
    >
      {/* Pattern visualization - Mini Pattern Sheet */}
      <div className="p-2">
        <MiniPatternSheet pattern={patternNFT.pattern} showTitle={true} />
      </div>

      {/* Info */}
      <div className="p-3 pt-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-synth-silver truncate flex-1 text-sm">
            {patternNFT.name}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={handlePlay}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-synth-accent hover:bg-orange-600'
              }`}
            >
              {isPlaying ? (
                <span className="text-white text-xs">■</span>
              ) : (
                <span className="text-white text-xs">▶</span>
              )}
            </button>
            {canBurn && (
              <button
                onClick={handleBurnClick}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-600 hover:bg-red-600 transition-colors"
                title="Burn NFT"
              >
                <span className="text-white text-xs">🔥</span>
              </button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          {patternNFT.pattern.creator && (
            <div className="text-gray-500 truncate">
              by {patternNFT.pattern.creator}
            </div>
          )}
          {showOwner && (
            <div className="text-gray-500">
              Owner: {shortAddress(patternNFT.owner)}
            </div>
          )}
          <div className="text-gray-600 truncate text-[10px]">
            {shortAddress(patternNFT.mintAddress)}
          </div>
        </div>
      </div>

      {/* Burn confirmation overlay */}
      {showConfirm && (
        <div
          className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {isBurning ? (
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-red-400 text-sm">Burning...</p>
            </div>
          ) : burnError ? (
            <div className="text-center">
              <p className="text-red-400 text-sm mb-2">{burnError}</p>
              <button
                onClick={handleCancelBurn}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="text-white text-sm mb-1 font-bold">Burn this pattern?</p>
              <p className="text-gray-400 text-xs mb-3 text-center">
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelBurn}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBurn}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded"
                >
                  Burn
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Grid layout for multiple pattern cards
export function PatternGrid({
  patterns,
  loading,
  error,
  onSelect,
  onBurn,
  showOwner = false,
  canBurn = false,
  network = 'mainnet-beta',
  emptyMessage = 'No patterns found',
}: {
  patterns: PatternNFT[];
  loading?: boolean;
  error?: string | null;
  onSelect?: (pattern: PatternNFT) => void;
  onBurn?: (mintAddress: string) => void;
  showOwner?: boolean;
  canBurn?: boolean;
  network?: NetworkType;
  emptyMessage?: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-synth-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {patterns.map((pattern) => (
        <PatternCard
          key={pattern.mintAddress}
          patternNFT={pattern}
          onSelect={onSelect}
          onBurn={onBurn}
          showOwner={showOwner}
          canBurn={canBurn}
          network={network}
        />
      ))}
    </div>
  );
}
