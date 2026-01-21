import { useState } from 'react';
import { Creator, rateCreator, getUserRatings } from '../lib/creators';

interface CreatorCardProps {
  creator: Creator;
  currentUserWallet?: string;
  onRatingChange?: () => void;
  onSelect?: (walletAddress: string) => void;
}

export function CreatorCard({ creator, currentUserWallet, onRatingChange, onSelect }: CreatorCardProps) {
  const [isRating, setIsRating] = useState(false);

  // Check if current user has already rated this creator
  const userRatings = currentUserWallet ? getUserRatings(currentUserWallet) : {};
  const hasUpvoted = userRatings[creator.walletAddress] === 1;

  const handleUpvote = () => {
    if (!currentUserWallet || isRating) return;
    if (currentUserWallet === creator.walletAddress) return; // Can't rate yourself

    setIsRating(true);
    const result = rateCreator(creator.walletAddress, currentUserWallet, 1);
    if (result.success && onRatingChange) {
      onRatingChange();
    }
    setIsRating(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  return (
    <div
      className="bg-amber-50 border-2 border-amber-900/30 rounded-lg p-4 hover:border-amber-600 transition-colors cursor-pointer"
      onClick={() => onSelect?.(creator.walletAddress)}
    >
      {/* Header with name and rating */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {/* Primary display name */}
          <h3 className="font-mono text-lg font-bold text-amber-900 truncate">
            {creator.nomDeGuerre || creator.displayName}
          </h3>

          {/* Secondary name if nom de guerre exists */}
          {creator.nomDeGuerre && (
            <p className="font-mono text-xs text-amber-700 truncate">
              {creator.displayName}
            </p>
          )}
        </div>

        {/* Rating button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUpvote();
          }}
          disabled={!currentUserWallet || currentUserWallet === creator.walletAddress || isRating}
          className={`flex items-center gap-1 px-3 py-1 rounded-full font-mono text-sm transition-colors ${
            hasUpvoted
              ? 'bg-amber-600 text-white'
              : currentUserWallet && currentUserWallet !== creator.walletAddress
                ? 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                : 'bg-amber-100 text-amber-400 cursor-not-allowed'
          }`}
          title={
            !currentUserWallet
              ? 'Connect wallet to rate'
              : currentUserWallet === creator.walletAddress
                ? "Can't rate yourself"
                : hasUpvoted
                  ? 'Remove upvote'
                  : 'Upvote creator'
          }
        >
          <span className="text-base">{hasUpvoted ? '▲' : '△'}</span>
          <span className="font-bold">{creator.rating}</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs font-mono text-amber-700">
        <div className="flex items-center gap-1">
          <span className="text-amber-500">♫</span>
          <span>{creator.patternCount} pattern{creator.patternCount !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-amber-500">◷</span>
          <span>Active {formatDate(creator.lastActive)}</span>
        </div>
      </div>

      {/* Wallet address */}
      <div className="mt-2 pt-2 border-t border-amber-200">
        <p className="font-mono text-xs text-amber-500 truncate">
          {creator.walletAddress}
        </p>
      </div>
    </div>
  );
}
