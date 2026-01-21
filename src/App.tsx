import { useState, useCallback } from 'react';
import { PatternEditor } from './components/PatternEditor';
import { ProfilePage } from './components/ProfilePage';
import { DiscoverPage } from './components/DiscoverPage';
import { WalletContextProvider } from './components/WalletProvider';
import { WalletButton } from './components/WalletButton';
import { Pattern303 } from './types/pattern';

type Page = 'create' | 'profile' | 'discover';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('create');
  const [loadedPattern, setLoadedPattern] = useState<Pattern303 | null>(null);
  const [viewingProfileAddress, setViewingProfileAddress] = useState<string | null>(null);

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
      {/* Compact Header */}
      <header className="border-b border-gray-700 bg-synth-panel">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1
              className="text-lg sm:text-xl font-black tracking-tight cursor-pointer"
              style={{ color: '#ff6600', fontFamily: 'Arial Black, sans-serif' }}
              onClick={() => setCurrentPage('create')}
            >
              p303
            </h1>
            <nav className="flex gap-0.5 sm:gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (item.id === 'profile') {
                      setViewingProfileAddress(null);
                    }
                  }}
                  className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-synth-accent text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <WalletButton />
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
    </div>
  );
}

export default function App() {
  return (
    <WalletContextProvider network="devnet">
      <AppContent />
    </WalletContextProvider>
  );
}
