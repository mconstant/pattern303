import { useState, useEffect, useCallback } from 'react';
import { CreatorCard } from './CreatorCard';
import {
  Creator,
  CreatorSortField,
  SortDirection,
  getCreatorList,
  syncCreatorsFromMints,
} from '../lib/creators';

interface CreatorDirectoryProps {
  currentUserWallet?: string;
  onSelectCreator?: (walletAddress: string) => void;
}

export function CreatorDirectory({ currentUserWallet, onSelectCreator }: CreatorDirectoryProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [sortBy, setSortBy] = useState<CreatorSortField>('rating');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [search, setSearch] = useState('');
  const [minPatterns, setMinPatterns] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadCreators = useCallback(() => {
    const list = getCreatorList({
      sortBy,
      sortDir,
      search,
      minPatterns,
      minRating,
    });
    setCreators(list);
    setIsLoading(false);
  }, [sortBy, sortDir, search, minPatterns, minRating]);

  useEffect(() => {
    // Sync creators from tracked mints on mount
    syncCreatorsFromMints();
    loadCreators();
  }, [loadCreators]);

  const handleSortChange = (field: CreatorSortField) => {
    if (sortBy === field) {
      // Toggle direction
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      // Default to desc for numeric fields, asc for text
      setSortDir(['patternCount', 'rating', 'lastActive'].includes(field) ? 'desc' : 'asc');
    }
  };

  const sortOptions: { field: CreatorSortField; label: string }[] = [
    { field: 'rating', label: 'Rating' },
    { field: 'patternCount', label: 'Patterns' },
    { field: 'displayName', label: 'Name' },
    { field: 'nomDeGuerre', label: 'Nom de Guerre' },
    { field: 'walletAddress', label: 'Address' },
    { field: 'lastActive', label: 'Activity' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xl font-bold text-amber-900">
          Creator Directory
        </h2>
        <span className="font-mono text-sm text-amber-600">
          {creators.length} creator{creators.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search and filters */}
      <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, address, or nom de guerre..."
            title="Search by wallet address, display name, or nom de guerre (artist name)"
            className="w-full px-4 py-2 pr-10 font-mono text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 text-amber-900 placeholder-amber-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="font-mono text-xs text-amber-600 self-center mr-1">Sort:</span>
          {sortOptions.map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSortChange(field)}
              className={`px-3 py-1 font-mono text-xs rounded-full transition-colors ${
                sortBy === field
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-200 text-amber-700 hover:bg-amber-300'
              }`}
            >
              {label}
              {sortBy === field && (
                <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="font-mono text-xs text-amber-600">Min patterns:</label>
            <select
              value={minPatterns}
              onChange={(e) => setMinPatterns(Number(e.target.value))}
              className="px-2 py-1 font-mono text-xs bg-white border border-amber-300 rounded focus:outline-none focus:border-amber-500 text-amber-900"
            >
              <option value={0}>Any</option>
              <option value={1}>1+</option>
              <option value={3}>3+</option>
              <option value={5}>5+</option>
              <option value={10}>10+</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-mono text-xs text-amber-600">Min rating:</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-2 py-1 font-mono text-xs bg-white border border-amber-300 rounded focus:outline-none focus:border-amber-500 text-amber-900"
            >
              <option value={0}>Any</option>
              <option value={1}>1+</option>
              <option value={5}>5+</option>
              <option value={10}>10+</option>
              <option value={25}>25+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Creator list */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="font-mono text-amber-600 animate-pulse">
            Loading creators...
          </div>
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-12 bg-amber-50/50 border border-amber-200 rounded-lg">
          <p className="font-mono text-amber-600 mb-2">
            {search || minPatterns > 0 || minRating > 0
              ? 'No creators match your filters'
              : 'No creators found yet'}
          </p>
          <p className="font-mono text-xs text-amber-500">
            {search || minPatterns > 0 || minRating > 0
              ? 'Try adjusting your search or filters'
              : 'Creators appear when patterns are minted'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard
              key={creator.walletAddress}
              creator={creator}
              currentUserWallet={currentUserWallet}
              onRatingChange={loadCreators}
              onSelect={onSelectCreator}
            />
          ))}
        </div>
      )}
    </div>
  );
}
