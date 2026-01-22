import { useState, useCallback } from 'react';
import { PatternEditor } from './components/PatternEditor';
import { ProfilePage } from './components/ProfilePage';
import { DiscoverPage } from './components/DiscoverPage';
import { AboutPage } from './components/AboutPage';
import { WalletContextProvider } from './components/WalletProvider';
import { WalletButton } from './components/WalletButton';
import { AdminPanel, useIsTreasuryWallet } from './components/AdminPanel';
import { Pattern303 } from './types/pattern';
import { getPumpFunUrl } from './lib/token303';

type Page = 'create' | 'profile' | 'discover' | 'about';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('about');
  const [loadedPattern, setLoadedPattern] = useState<Pattern303 | null>(null);
  const [viewingProfileAddress, setViewingProfileAddress] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const isTreasury = useIsTreasuryWallet();

  const handleLoadPattern = useCallback((pattern: Pattern303) => {
    setLoadedPattern({ ...pattern });
    setCurrentPage('create');
  }, []);

  const handleViewProfile = useCallback((walletAddress: string) => {
    setViewingProfileAddress(walletAddress);
    setCurrentPage('profile');
  }, []);

  const handleBackToOwnProfile = useCallback(() => {
    setViewingProfileAddress(null);
  }, []);

  const navItems: { id: Page; label: string }[] = [
    { id: 'create', label: 'Create' },
    { id: 'profile', label: 'My Patterns' },
    { id: 'discover', label: 'Discover' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-synth-dark flex flex-col">
      {/* Ultra-Compact Header */}
      <header className="border-b border-gray-700 bg-synth-panel">
        <div className="max-w-7xl mx-auto px-1.5 sm:px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span
              className="text-sm font-black cursor-pointer"
              style={{ color: '#ff6600', fontFamily: 'Arial Black' }}
              onClick={() => setCurrentPage('create')}
            >
              p303
            </span>
            <nav className="flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (item.id === 'profile') {
                      setViewingProfileAddress(null);
                    }
                  }}
                  className={`px-1.5 py-1 text-[10px] sm:text-xs font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-synth-accent'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {item.id === 'create'
                    ? 'Create'
                    : item.id === 'profile'
                      ? 'Mine'
                      : item.id === 'discover'
                        ? 'All'
                        : 'About'}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {isTreasury && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="px-2 py-1 text-[10px] font-mono bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/30 transition-colors"
              >
                Admin
              </button>
            )}
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main content - tighter padding on mobile */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex-grow w-full">
        <div className="mb-3 bg-synth-panel border border-gray-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-200 flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-mono font-bold text-amber-400">$303 perks</span>
          <span className="text-gray-300">Hold ≥303 $303 to mint patterns for free and get discounted <span title="Your unique artist name on Pattern 303, stored as an NFT on Solana" className="cursor-help border-b border-dotted border-gray-400">nom de guerre</span> mints.</span>
          <a
            className="text-amber-400 hover:text-amber-300 font-mono"
            href={getPumpFunUrl()}
            target="_blank"
            rel="noreferrer"
          >
            Buy $303 on pump.fun ↗
          </a>
        </div>

        {currentPage === 'create' && (
          <PatternEditor
            initialPattern={loadedPattern}
            onPatternChange={() => setLoadedPattern(null)}
          />
        )}
        {currentPage === 'profile' && (
          <ProfilePage
            onLoadPattern={handleLoadPattern}
            viewingAddress={viewingProfileAddress}
            onBackToOwnProfile={handleBackToOwnProfile}
          />
        )}
        {currentPage === 'discover' && (
          <DiscoverPage
            onLoadPattern={handleLoadPattern}
            onViewProfile={handleViewProfile}
          />
        )}
        {currentPage === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Admin Panel - double-check treasury wallet at render time */}
      {showAdminPanel && isTreasury && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WalletContextProvider network='mainnet-beta'>
      <AppContent />
    </WalletContextProvider>
  );
}
