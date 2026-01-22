import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDiscoverPatterns } from '../hooks/usePatternNFTs';
import { PatternGrid } from './PatternCard';
import { PatternNFT } from '../lib/patternNFT';
import { Pattern303 } from '../types/pattern';
import { CreatorDirectory } from './CreatorDirectory';
import { getPumpFunUrl } from '../lib/token303';

type DiscoverTab = 'patterns' | 'creators';

interface DiscoverPageProps {
  onLoadPattern?: (pattern: Pattern303) => void;
  onViewProfile?: (walletAddress: string) => void;
}

export function DiscoverPage({ onLoadPattern, onViewProfile }: DiscoverPageProps) {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<DiscoverTab>('patterns');
  const { patterns, loading, error, refresh } = useDiscoverPatterns('mainnet-beta');

  const walletAddress = publicKey?.toBase58();

  const handleSelectPattern = (patternNFT: PatternNFT) => {
    if (onLoadPattern) {
      onLoadPattern(patternNFT.pattern);
    }
  };

  const handleSelectCreator = (creatorWallet: string) => {
    if (onViewProfile) {
      onViewProfile(creatorWallet);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-synth-silver">Discover</h2>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'patterns'
              ? 'Browse patterns minted by the community'
              : 'Explore and rate pattern creators'}
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-4 py-2 font-mono text-sm rounded-lg transition-colors ${
              activeTab === 'patterns'
                ? 'bg-amber-600 text-white'
                : 'bg-synth-panel text-synth-silver hover:bg-gray-600'
            }`}
          >
            ♫ Patterns
          </button>
          <button
            onClick={() => setActiveTab('creators')}
            className={`px-4 py-2 font-mono text-sm rounded-lg transition-colors ${
              activeTab === 'creators'
                ? 'bg-amber-600 text-white'
                : 'bg-synth-panel text-synth-silver hover:bg-gray-600'
            }`}
          >
            ★ Creators
          </button>
          {activeTab === 'patterns' && (
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-synth-panel hover:bg-gray-600 text-synth-silver rounded-lg transition-colors disabled:opacity-50 font-mono text-sm"
            >
              {loading ? '...' : '↻'}
            </button>
          )}
        </div>
      </div>

      {/* Token holder perks */}
      <div className="bg-synth-panel border border-gray-600 rounded-lg p-3 text-sm text-gray-200">
        <div className="font-mono font-bold text-amber-400 mb-1">$303 holder perks</div>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li>Hold <span className="font-bold">≥ 303 $303</span> to mint patterns <span className="font-bold">for free</span>.</li>
          <li>Nom de guerre mints are discounted for $303 holders.</li>
        </ul>
        <a
          className="inline-flex items-center gap-1 mt-2 text-amber-400 hover:text-amber-300 font-mono text-xs"
          href={getPumpFunUrl()}
          target="_blank"
          rel="noreferrer"
        >
          Buy $303 on pump.fun ↗
        </a>
      </div>

      {/* Tab content */}
      {activeTab === 'patterns' ? (
        <>
          {/* Pattern Grid */}
          <PatternGrid
            patterns={patterns}
            loading={loading}
            error={error}
            onSelect={handleSelectPattern}
            showOwner={true}
            emptyMessage="No patterns discovered yet. Be the first to mint!"
          />

          {/* Info */}
          {patterns.length > 0 && (
            <p className="text-center text-sm text-gray-500">
              Click a pattern to load it into the editor • Click play to preview
            </p>
          )}
        </>
      ) : (
        <CreatorDirectory
          currentUserWallet={walletAddress}
          onSelectCreator={handleSelectCreator}
        />
      )}
    </div>
  );
}
