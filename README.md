# Pattern 303 🎛️

A modern, web-based synthesizer pattern sequencer inspired by the legendary Roland TR-303, deployed on Akash Network.

## Overview

**Pattern 303** is a React + TypeScript application that lets you create, share, and discover 303-style synthesizer patterns. It features:

- 🎹 **Step Sequencer** - 64-step pattern editor with pitch, accent, slide, and gate controls
- 🎨 **Pattern Banking** - Organize patterns into 4 banks with A/B sections
- 🔊 **Web Audio Synth** - Real-time 303-style synthesis engine
- 🪙 **NFT Integration** - Mint patterns as NFTs on Solana blockchain
- 👛 **Wallet Support** - Connect via Phantom, Solflare, and other Solana wallets
- 🌐 **Discover** - Browse and load patterns created by other users
- ☁️ **Cloud Deploy** - Runs on Akash Network (decentralized cloud computing)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Build**: Vite + ESBuild
- **Blockchain**: Solana Web3.js + Metaplex
- **Deployment**: Docker + Akash SDL
- **Audio**: Web Audio API

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/mconstant/pattern303.git
cd pattern303

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration (optional for local development)
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/           # React components
│   ├── PatternEditor.tsx     # Main sequencer UI
│   ├── StepEditor.tsx        # Individual step editor
│   ├── PatternSheet.tsx      # Pattern display
│   ├── KnobControl.tsx       # Synth parameter knobs
│   ├── TransportControls.tsx # Play/stop controls
│   ├── MintButton.tsx        # NFT minting
│   ├── ProfilePage.tsx       # User patterns & wallet
│   ├── DiscoverPage.tsx      # Pattern discovery
│   ├── WalletButton.tsx      # Wallet connection
│   └── ...
├── hooks/                # Custom React hooks
│   ├── usePattern.ts         # Pattern state management
│   ├── useSynth.ts           # Audio synthesis
│   ├── useMint.ts            # NFT minting logic
│   ├── usePatternNFTs.ts     # NFT fetching
│   └── ...
├── lib/                  # Utilities & services
│   ├── synth303.ts           # TR-303 synth implementation
│   ├── patternNFT.ts         # Metaplex integration
│   ├── solanaNames.ts        # Domain name resolution
│   └── ...
├── types/                # TypeScript definitions
│   └── pattern.ts            # Pattern interface & types
└── App.tsx               # Root component
```

## Pattern Format

Patterns are stored as `Pattern303` objects:

```typescript
interface Pattern303 {
  name: string;              // Pattern name
  creator: string;           // Creator/artist name
  tempo: number;             // 60-300 BPM
  waveform: 'saw' | 'square'; // Oscillator waveform
  cutoff: number;            // Filter cutoff (0-100)
  resonance: number;         // Filter resonance (0-100)
  envMod: number;            // Envelope modulation (0-100)
  decay: number;             // Envelope decay (0-100)
  accent: number;            // Accent level (0-100)
  steps: Step[];             // 64 step array
  bank?: 'I' | 'II' | 'III' | 'IV'; // Pattern bank
  section?: 'A' | 'B';       // Pattern section
  notes?: string;            // Freeform notes
}

interface Step {
  pitch: number;             // 0-12 (C to C, semitones)
  octave: -1 | 0 | 1;        // -1 (down), 0 (normal), 1 (up)
  accent: boolean;           // Accent this step
  slide: boolean;            // Portamento/slide
  gate: 'note' | 'tie' | 'rest'; // Gate type
}
```

## Features

### Pattern Creation

- 64-step sequencer with visual feedback
- Real-time playback with adjustable tempo
- TR-303 inspired synthesis parameters
- Accent and slide controls per step
- Named pattern storage

### Synth Engine

- Sawtooth and square wave oscillators
- 24dB/octave voltage-controlled filter (VCF)
- Attack/decay envelope
- Portamento/slide effect
- Accent velocity control

### Blockchain Features

- Connect Solana wallets (Phantom, Solflare, etc.)
- Mint patterns as NFTs using Metaplex
- View NFT pattern collections
- Support for 303 token holders (free minting)
- Solana name (SNS) integration

### Discovery

- Browse patterns created by other users
- Search and filter by creator
- Load and remix existing patterns
- View creator profiles

## Deployment

### Local Docker Build

```bash
# Build multi-platform image
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t your-username/pattern303:latest \
  --push \
  .
```

### Deploy to Akash Network

Pattern 303 can be deployed to Akash Network for decentralized hosting:

```bash
# 1. Update deploy.yaml with your container image
# 2. Deploy via Akash Console: https://console.akash.network
# 3. Or use Akash CLI: akash tx deployment create deploy.yaml
```

See `deploy.yaml` for Akash SDL configuration.

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Solana RPC endpoint
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Program IDs (if using custom programs)
VITE_PATTERN_NFT_PROGRAM_ID=...

# Feature flags
VITE_ENABLE_MINTING=true
VITE_ENABLE_DISCOVERY=true
```

## API Integration

Pattern 303 integrates with:

- **Solana Blockchain** - Web3.js for on-chain interactions
- **Metaplex** - NFT minting and metadata
- **Solana Name Service (SNS)** - Domain name lookups
- **Akash Network** - Decentralized deployment

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Inspiration

Pattern 303 is inspired by the legendary **Roland TR-303** - one of the most iconic drum machines and synthesizers in electronic music history. While not an emulation, it captures the spirit of the 303's intuitive interface and deep synthesis capabilities for modern web music production.

## Resources

- [Akash Network Documentation](https://akash.network/docs/)
- [Solana Developer Docs](https://docs.solana.com/)
- [Metaplex Documentation](https://developers.metaplex.com/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Roland TR-303 History](https://en.wikipedia.org/wiki/Roland_TR-303)

## Support

For issues and questions, please open a GitHub issue or contact the maintainers.

---

Made with 🎵 for the decentralized music production community.
