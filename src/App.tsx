import { useState, useCallback } from 'react';
import { PatternEditor } from './components/PatternEditor';
import { ProfilePage } from './components/ProfilePage';
import { DiscoverPage } from './components/DiscoverPage';
import { WalletContextProvider } from './components/WalletProvider';
import { WalletButton } from './components/WalletButton';
import { AdminPanel, useIsTreasuryWallet } from './components/AdminPanel';
import { Pattern303 } from './types/pattern';

type Page = 'create' | 'profile' | 'discover';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('create');
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
                  {item.id === 'create' ? 'Create' : item.id === 'profile' ? 'Mine' : 'All'}
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
    <WalletContextProvider network={import.meta.env.VITE_SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet'}>
      <AppContent />
    </WalletContextProvider>
  );
}
