import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PatternNFT } from '../lib/patternNFT';
import { burnPatternNFT } from '../lib/metaplex';
import { patternToCompactSvg, svgToDataUri } from '../lib/patternToSvg';
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
  network = 'devnet',
}: PatternCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { togglePlayback, stop } = useSynth(patternNFT.pattern);
  const wallet = useWallet();

  const svgUri = svgToDataUri(patternToCompactSvg(patternNFT.pattern));

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
    onSelect?.(patternNFT);
  };

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div
      onClick={handleClick}
      className="bg-synth-panel rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-synth-accent transition-all"
    >
      {/* Pattern visualization */}
      <div className="aspect-[2/1] bg-[#f5f5dc] p-2">
        <img
          src={svgUri}
          alt={patternNFT.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-synth-silver truncate flex-1">
            {patternNFT.name}
          </h3>
          <button
            onClick={handlePlay}
            className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
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
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>{patternNFT.pattern.tempo} BPM</span>
            <span>{patternNFT.pattern.waveform.toUpperCase()}</span>
          </div>
          {showOwner && (
            <div className="text-gray-500">
              Owner: {shortAddress(patternNFT.owner)}
            </div>
          )}
          <div className="text-gray-500 truncate">
            {shortAddress(patternNFT.mintAddress)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid layout for multiple pattern cards
export function PatternGrid({
  patterns,
  loading,
  error,
  onSelect,
  showOwner = false,
  emptyMessage = 'No patterns found',
}: {
  patterns: PatternNFT[];
  loading?: boolean;
  error?: string | null;
  onSelect?: (pattern: PatternNFT) => void;
  showOwner?: boolean;
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
          showOwner={showOwner}
        />
      ))}
    </div>
  );
}
