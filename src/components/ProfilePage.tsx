import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOwnedPatterns, usePatternsByOwner } from '../hooks/usePatternNFTs';
import { useNomDeGuerre } from '../hooks/useNomDeGuerre';
import { useToken303 } from '../hooks/useToken303';
import { PatternGrid } from './PatternCard';
import { AsciiCamera, AsciiAvatar, AsciiPresetPicker, encodeAsciiArt, decodeAsciiArt } from './AsciiCamera';
import { PatternNFT } from '../lib/patternNFT';
import { Pattern303 } from '../types/pattern';
import { getCreator } from '../lib/creators';
import { formatWalletAddress } from '../lib/solanaNames';

type AvatarMode = 'none' | 'camera' | 'presets';

interface ProfilePageProps {
  onLoadPattern?: (pattern: Pattern303) => void;
  viewingAddress?: string | null;
  onBackToOwnProfile?: () => void;
}

export function ProfilePage({ onLoadPattern, viewingAddress, onBackToOwnProfile }: ProfilePageProps) {
  const { publicKey, connected } = useWallet();

  // Determine if viewing own profile or another user's
  const isViewingOther = !!viewingAddress;
  const profileAddress = viewingAddress || publicKey?.toBase58() || '';
  const isOwnProfile = !isViewingOther && connected;

  // Get patterns - use different hook depending on context
  const ownPatterns = useOwnedPatterns('mainnet-beta');
  const otherPatterns = usePatternsByOwner(viewingAddress || '', 'mainnet-beta');
  const { patterns, loading, error, refresh } = isViewingOther ? otherPatterns : ownPatterns;

  // Get creator info for viewing other profiles
  const [viewedCreator, setViewedCreator] = useState<{ displayName: string; nomDeGuerre: string | null } | null>(null);

  // Own nom de guerre (only used when viewing own profile)
  const {
    nomDeGuerre,
    loading: ndgLoading,
    error: ndgError,
    isMinting: ndgMinting,
    mint: mintNdg,
    change: changeNdg,
    hasNomDeGuerre,
    validateUsername,
    isUsernameTaken,
    mintFee,
    mintFeeDiscounted,
    changeFeeFull,
  } = useNomDeGuerre('mainnet-beta');

  const {
    isHolder,
    balance,
    threshold,
    tokenSymbol,
    ndgChangeFee,
  } = useToken303('mainnet-beta');

  const [avatarMode, setAvatarMode] = useState<AvatarMode>('none');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showNdgForm, setShowNdgForm] = useState(false);
  const [ndgInput, setNdgInput] = useState('');
  const [ndgValidation, setNdgValidation] = useState<{ valid: boolean; error?: string } | null>(null);

  // Load creator info when viewing another profile
  useEffect(() => {
    if (viewingAddress) {
      const creator = getCreator(viewingAddress);
      if (creator) {
        setViewedCreator({
          displayName: creator.displayName,
          nomDeGuerre: creator.nomDeGuerre,
        });
      } else {
        setViewedCreator({
          displayName: formatWalletAddress(viewingAddress),
          nomDeGuerre: null,
        });
      }
    } else {
      setViewedCreator(null);
    }
  }, [viewingAddress]);

  // Load avatar from localStorage
  useEffect(() => {
    const addressToUse = profileAddress;
    if (addressToUse) {
      const saved = localStorage.getItem(`avatar_${addressToUse}`);
      setAvatar(saved);
    } else {
      setAvatar(null);
    }
  }, [profileAddress]);

  // Validate username as user types
  useEffect(() => {
    if (ndgInput) {
      const validation = validateUsername(ndgInput);
      if (validation.valid && isUsernameTaken(ndgInput)) {
        setNdgValidation({ valid: false, error: 'Username is already taken' });
      } else {
        setNdgValidation(validation);
      }
    } else {
      setNdgValidation(null);
    }
  }, [ndgInput, validateUsername, isUsernameTaken]);

  const handleSetAvatar = (ascii: string) => {
    if (!isOwnProfile) return;
    const encoded = encodeAsciiArt(ascii);
    if (publicKey) {
      localStorage.setItem(`avatar_${publicKey.toBase58()}`, encoded);
    }
    setAvatar(encoded);
    setAvatarMode('none');
  };

  const handleClearAvatar = () => {
    if (!isOwnProfile) return;
    if (publicKey) {
      localStorage.removeItem(`avatar_${publicKey.toBase58()}`);
    }
    setAvatar(null);
  };

  const handleSelectPattern = (patternNFT: PatternNFT) => {
    if (onLoadPattern) {
      onLoadPattern(patternNFT.pattern);
    }
  };

  const handleBurnPattern = () => {
    refresh();
  };

  const handleNdgSubmit = async () => {
    if (!ndgInput || !ndgValidation?.valid) return;

    if (hasNomDeGuerre) {
      await changeNdg(ndgInput, isHolder);
    } else {
      await mintNdg(ndgInput, isHolder);
    }

    setShowNdgForm(false);
    setNdgInput('');
  };

  // Show connect prompt only when not viewing another profile and not connected
  if (!connected && !isViewingOther) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-synth-silver mb-4">My Profile</h2>
        <p className="text-gray-400">Connect your wallet to view your profile and patterns.</p>
      </div>
    );
  }

  // Determine display name for the profile
  const displayNomDeGuerre = isViewingOther ? viewedCreator?.nomDeGuerre : nomDeGuerre?.username;
  const displayName = isViewingOther ? viewedCreator?.displayName : (publicKey ? formatWalletAddress(publicKey.toBase58()) : '');

  return (
    <div className="space-y-8">
      {/* Back button when viewing another profile */}
      {isViewingOther && onBackToOwnProfile && (
        <button
          onClick={onBackToOwnProfile}
          className="flex items-center gap-2 text-synth-accent hover:text-orange-400 transition-colors"
        >
          <span>←</span>
          <span>Back to My Profile</span>
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-synth-panel rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            {avatar ? (
              <AsciiAvatar ascii={decodeAsciiArt(avatar)} size="lg" />
            ) : (
              <div className="w-32 h-24 bg-black rounded flex items-center justify-center text-gray-500 text-sm font-mono">
                No Avatar
              </div>
            )}
            {/* Only show avatar controls for own profile */}
            {isOwnProfile && (
              <div className="flex gap-2 text-xs">
                {avatarMode === 'none' ? (
                  <>
                    <button
                      onClick={() => setAvatarMode('camera')}
                      className="text-synth-accent hover:text-orange-400"
                    >
                      Camera
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      onClick={() => setAvatarMode('presets')}
                      className="text-synth-accent hover:text-orange-400"
                    >
                      Choose Art
                    </button>
                    {avatar && (
                      <>
                        <span className="text-gray-600">|</span>
                        <button
                          onClick={handleClearAvatar}
                          className="text-gray-500 hover:text-red-400"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setAvatarMode('none')}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {/* Nom de Guerre / Display Name */}
            <div className="mb-2">
              {isOwnProfile && ndgLoading ? (
                <div className="h-8 bg-gray-700 rounded animate-pulse w-32" />
              ) : displayNomDeGuerre ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-synth-accent">
                    {displayNomDeGuerre}
                  </h2>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                    nom de guerre
                  </span>
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowNdgForm(true)}
                      className="text-xs text-gray-500 hover:text-synth-accent"
                    >
                      change
                    </button>
                  )}
                </div>
              ) : isOwnProfile ? (
                <button
                  onClick={() => setShowNdgForm(true)}
                  className="text-synth-accent hover:text-orange-400 text-sm"
                >
                  + Claim your nom de guerre
                </button>
              ) : (
                <h2 className="text-2xl font-bold text-synth-accent">
                  {displayName}
                </h2>
              )}
            </div>

            <p className="text-sm text-gray-400 font-mono break-all">
              {profileAddress}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span className={`px-2 py-1 rounded ${isHolder ? 'bg-green-900/40 border border-green-500 text-green-200' : 'bg-gray-800 border border-gray-700 text-gray-300'}`}>
                {isHolder
                  ? `$${tokenSymbol} perks active • ${balance.toFixed(2)} held`
                  : `Hold ${threshold}+ $${tokenSymbol} for perks`}
              </span>
              <span className="text-gray-500">Free pattern mints • Discounted nom de guerre</span>
              {!isHolder && (
                <a
                  className="text-amber-400 hover:text-amber-300 font-mono"
                  href="https://pump.fun/search?query=Pattern%20303"
                  target="_blank"
                  rel="noreferrer"
                >
                  Buy $303 on pump.fun ↗
                </a>
              )}
            </div>

            <div className="mt-4 flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-synth-accent">{patterns.length}</div>
                <div className="text-gray-500">Patterns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Nom de Guerre Form - only for own profile */}
        {isOwnProfile && showNdgForm && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-bold text-synth-silver mb-4">
              {hasNomDeGuerre ? 'Change your Nom de Guerre' : 'Claim your Nom de Guerre'}
            </h3>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={ndgInput}
                  onChange={(e) => setNdgInput(e.target.value.toLowerCase())}
                  placeholder="Enter username (3-20 chars)"
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded text-white focus:border-synth-accent focus:outline-none"
                  disabled={ndgMinting}
                />
                {ndgValidation && !ndgValidation.valid && (
                  <p className="text-red-400 text-xs mt-1">{ndgValidation.error}</p>
                )}
                {ndgError && (
                  <p className="text-red-400 text-xs mt-1">{ndgError}</p>
                )}
              </div>
              <button
                onClick={handleNdgSubmit}
                disabled={!ndgValidation?.valid || ndgMinting}
                className={`px-4 py-2 rounded font-bold transition-colors ${
                  ndgValidation?.valid && !ndgMinting
                    ? 'bg-synth-accent hover:bg-orange-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {ndgMinting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Minting...
                  </span>
                ) : hasNomDeGuerre ? (
                  <span className="flex flex-col items-center text-xs">
                    <span>Change</span>
                    <span className="opacity-70">
                      {isHolder && <span className="line-through mr-1 text-gray-400">{changeFeeFull} SOL</span>}
                      {ndgChangeFee} SOL
                    </span>
                  </span>
                ) : (
                  <span className="flex flex-col items-center text-xs">
                    <span>Claim</span>
                    <span className="opacity-70">
                      {isHolder && <span className="line-through mr-1 text-gray-400">{mintFee} SOL</span>}
                      {isHolder ? mintFeeDiscounted : mintFee} SOL
                    </span>
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowNdgForm(false);
                  setNdgInput('');
                }}
                className="px-3 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your nom de guerre is your unique identity on Pattern 303. It's stored as an NFT on Solana.
            </p>
          </div>
        )}

        {/* ASCII Camera - only for own profile */}
        {isOwnProfile && avatarMode === 'camera' && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-bold text-synth-silver mb-4">Capture ASCII Avatar</h3>
            <AsciiCamera
              width={48}
              height={32}
              onCapture={handleSetAvatar}
            />
          </div>
        )}

        {/* ASCII Presets - only for own profile */}
        {isOwnProfile && avatarMode === 'presets' && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-bold text-synth-silver mb-4">Choose an Avatar</h3>
            <AsciiPresetPicker onSelect={handleSetAvatar} />
          </div>
        )}
      </div>

      {/* Patterns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-synth-silver">
            {isOwnProfile ? 'My Patterns' : 'Patterns'}
          </h3>
          <button
            onClick={refresh}
            className="text-sm text-synth-accent hover:text-orange-400"
          >
            Refresh
          </button>
        </div>

        <PatternGrid
          patterns={patterns}
          loading={loading}
          error={error}
          onSelect={handleSelectPattern}
          onBurn={isOwnProfile ? handleBurnPattern : undefined}
          canBurn={isOwnProfile}
          network="mainnet-beta"
          emptyMessage={
            isOwnProfile
              ? "You haven't minted any patterns yet. Create a pattern and mint it as an NFT!"
              : "This creator hasn't minted any patterns yet."
          }
        />
      </div>
    </div>
  );
}
