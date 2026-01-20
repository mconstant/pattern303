import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOwnedPatterns } from '../hooks/usePatternNFTs';
import { PatternGrid } from './PatternCard';
import { AsciiCamera, AsciiAvatar, AsciiPresetPicker, encodeAsciiArt, decodeAsciiArt } from './AsciiCamera';
import { PatternNFT } from '../lib/patternNFT';
import { Pattern303 } from '../types/pattern';

type AvatarMode = 'none' | 'camera' | 'presets';

interface ProfilePageProps {
  onLoadPattern?: (pattern: Pattern303) => void;
}

export function ProfilePage({ onLoadPattern }: ProfilePageProps) {
  const { publicKey, connected } = useWallet();
  const { patterns, loading, error, refresh } = useOwnedPatterns('devnet');
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('none');
  const [avatar, setAvatar] = useState<string | null>(null);

  // Load avatar from localStorage when wallet connects
  useEffect(() => {
    if (publicKey) {
      const saved = localStorage.getItem(`avatar_${publicKey.toBase58()}`);
      setAvatar(saved);
    } else {
      setAvatar(null);
    }
  }, [publicKey]);

  const handleSetAvatar = (ascii: string) => {
    const encoded = encodeAsciiArt(ascii);
    if (publicKey) {
      localStorage.setItem(`avatar_${publicKey.toBase58()}`, encoded);
    }
    setAvatar(encoded);
    setAvatarMode('none');
  };

  const handleClearAvatar = () => {
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

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-synth-silver mb-4">My Profile</h2>
        <p className="text-gray-400">Connect your wallet to view your profile and patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-synth-silver mb-2">My Profile</h2>
            <p className="text-sm text-gray-400 font-mono break-all">
              {publicKey?.toBase58()}
            </p>
            <div className="mt-4 flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-synth-accent">{patterns.length}</div>
                <div className="text-gray-500">Patterns</div>
              </div>
            </div>
          </div>
        </div>

        {/* ASCII Camera */}
        {avatarMode === 'camera' && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-bold text-synth-silver mb-4">Capture ASCII Avatar</h3>
            <AsciiCamera
              width={48}
              height={32}
              onCapture={handleSetAvatar}
            />
          </div>
        )}

        {/* ASCII Presets */}
        {avatarMode === 'presets' && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-bold text-synth-silver mb-4">Choose an Avatar</h3>
            <AsciiPresetPicker onSelect={handleSetAvatar} />
          </div>
        )}
      </div>

      {/* My Patterns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-synth-silver">My Patterns</h3>
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
          emptyMessage="You haven't minted any patterns yet. Create a pattern and mint it as an NFT!"
        />
      </div>
    </div>
  );
}
