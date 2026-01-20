import { useDiscoverPatterns } from '../hooks/usePatternNFTs';
import { PatternGrid } from './PatternCard';
import { PatternNFT } from '../lib/patternNFT';
import { Pattern303 } from '../types/pattern';

interface DiscoverPageProps {
  onLoadPattern?: (pattern: Pattern303) => void;
}

export function DiscoverPage({ onLoadPattern }: DiscoverPageProps) {
  const { patterns, loading, error, refresh } = useDiscoverPatterns('devnet');

  const handleSelectPattern = (patternNFT: PatternNFT) => {
    if (onLoadPattern) {
      onLoadPattern(patternNFT.pattern);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-synth-silver">Discover Patterns</h2>
          <p className="text-sm text-gray-400 mt-1">
            Browse patterns minted by the community
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 bg-synth-panel hover:bg-gray-600 text-synth-silver rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

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
    </div>
  );
}
