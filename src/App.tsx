import { useState, useCallback } from 'react';
import { PatternEditor } from './components/PatternEditor';
import { ProfilePage } from './components/ProfilePage';
import { DiscoverPage } from './components/DiscoverPage';
import { WalletContextProvider } from './components/WalletProvider';
import { WalletButton } from './components/WalletButton';
import { Pattern303, DEFAULT_PATTERN, DEFAULT_STEP } from './types/pattern';

type Page = 'create' | 'profile' | 'discover';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('create');
  const [loadedPattern, setLoadedPattern] = useState<Pattern303 | null>(null);

  const handleLoadPattern = useCallback((pattern: Pattern303) => {
    setLoadedPattern({ ...pattern });
    setCurrentPage('create');
  }, []);

  const navItems: { id: Page; label: string }[] = [
    { id: 'create', label: 'Create' },
    { id: 'profile', label: 'My Patterns' },
    { id: 'discover', label: 'Discover' },
  ];

  return (
    <div className="min-h-screen bg-synth-dark flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700 bg-synth-panel">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-synth-accent">Pattern 303</h1>

            {/* Navigation */}
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        {currentPage === 'create' && (
          <PatternEditor
            initialPattern={loadedPattern}
            onPatternChange={() => setLoadedPattern(null)}
          />
        )}
        {currentPage === 'profile' && (
          <ProfilePage onLoadPattern={handleLoadPattern} />
        )}
        {currentPage === 'discover' && (
          <DiscoverPage onLoadPattern={handleLoadPattern} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          <p>Pattern 303 - Create and mint TB-303 patterns as NFTs on Solana</p>
          <p className="mt-1">Patterns stored fully on-chain • Built on Devnet</p>
        </div>
      </footer>
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
