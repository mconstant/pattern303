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

## GitHub Actions Workflows

This project includes three automated workflows. They require GitHub Actions secrets to be configured.

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret from the tables below

### Workflow 1: Build Docker Image (`build-image.yml`)

**Trigger**: On push to `main`, on pull requests, or manual dispatch

**Secrets Required**:

| Secret Name | Description | Example |
|---|---|---|
| `VITE_TREASURY_WALLET` | Solana wallet address for royalties/treasury | `Gq7BUS7zV...` |
| `VITE_303_TOKEN_MINT` | SPL token mint address for 303 token | `303Token...` |
| `VITE_COLLECTION_ADDRESS` | NFT collection address on Metaplex | `CollectionAddr...` |

These secrets are injected as build arguments into the Docker image.

### Workflow 2: Deploy to Akash Network (`deploy-akash.yml`)

**Trigger**: On push to `main` or manual dispatch (with action selection)

**Secrets Required**:

| Secret Name | Description | Setup Instructions |
|---|---|---|
| `VITE_TREASURY_WALLET` | Solana wallet address for royalties/treasury | Same as Build Docker Image |
| `VITE_303_TOKEN_MINT` | SPL token mint address for 303 token | Same as Build Docker Image |
| `VITE_COLLECTION_ADDRESS` | NFT collection address on Metaplex | Same as Build Docker Image |
| `AKASH_KEY_PASSWORD` | Password for Akash wallet keyring | Create a secure password |
| `AKASH_WALLET_KEY` | Base64-encoded Akash wallet keyring tar.gz | See instructions below |
| `AKASH_NODE` | Akash RPC endpoint | https://rpc.akash.network:443 (mainnet) |
| `AKASH_CHAIN_ID` | Akash chain ID | akash (mainnet) or akashnet-2 |
| `AKASH_ACCOUNT_ADDRESS` | Your Akash wallet account address | Generated during keyring setup |
| `AKASH_DEPLOYMENT_DSEQ` | Deployment sequence number (optional) | Set after first deployment to enable updates |

**Setting up Akash Wallet from BIP39 Mnemonic** (Local Setup):

If you have an existing BIP39 mnemonic (12 or 24 words), follow these steps **locally on your machine** to import it and set up your keyring:

```bash
# 1. Install Akash provider-services CLI (if not already installed)
# For macOS:
brew tap akash-network/tap
brew install akash-provider-services
# OR download binary:
curl -sfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | bash
sudo mv ./bin/provider-services /usr/local/bin

# Verify installation
provider-services version

# 2. Create the keyring directory
mkdir -p ~/.akash/keyring-file

# 3. Import your mnemonic into the keyring
provider-services keys add my-akash-account --recover --keyring-backend file --home ~/.akash

# 4. When prompted, paste your BIP39 mnemonic (12 or 24 words)
# 5. When prompted, set a SECURE keyring passphrase (remember this!)
#    Use a strong passphrase - this protects your keyring

# 6. Verify your account was created
provider-services keys list --keyring-backend file --home ~/.akash

# 7. Get your account address and save it
AKASH_ACCOUNT=$(provider-services keys show my-akash-account --keyring-backend file --home ~/.akash -a)
echo "Your Akash Account Address: $AKASH_ACCOUNT"
```

**Extract and Set GitHub Secrets**:

After setting up your keyring locally, create the GitHub secrets:

```bash
# 1. Create base64-encoded keyring backup (no line wrapping)
cd ~/.akash
tar --no-symlinks -czf keyring-backup.tar.gz -C ~/.akash keyring-file
base64 -w 0 < keyring-backup.tar.gz | pbcopy  # macOS (copies to clipboard)
# OR for Linux:
base64 -w 0 < keyring-backup.tar.gz > keyring-base64.txt

# 2. Get your account address (if not already saved)
AKASH_ACCOUNT=$(provider-services keys show my-akash-account --keyring-backend file --home ~/.akash -a)

# 3. Display values to set as GitHub secrets
echo "Set these as GitHub Secrets (Settings → Secrets and variables → Actions):"
echo ""
echo "AKASH_WALLET_KEY:"
echo "[Paste from clipboard or keyring-base64.txt]"
echo ""
echo "AKASH_ACCOUNT_ADDRESS:"
echo "$AKASH_ACCOUNT"
echo ""
echo "AKASH_KEY_PASSWORD:"
echo "[Enter the passphrase you set in step 5 above]"
echo ""
echo "Other secrets to add:"
echo "AKASH_NODE = https://rpc.akash.forbole.com:443"
echo "AKASH_CHAIN_ID = akashnet-2"
```

Then in GitHub:
1. Go to your repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each of these:
   - `AKASH_WALLET_KEY` = [the base64 output from above]
   - `AKASH_ACCOUNT_ADDRESS` = [your akash1... address]
   - `AKASH_KEY_PASSWORD` = [the passphrase you created locally]
   - `AKASH_NODE` = `https://rpc.akash.network:443`
   - `AKASH_CHAIN_ID` = `akash`

**Funding Your Akash Account**:

Before deploying, you need AKT tokens to pay for compute resources:

```bash
# 1. Get your account address
provider-services keys show my-akash-account --keyring-backend file --home ~/.akash -a

# 2. Transfer AKT tokens to this address from an exchange or wallet
#    Minimum recommended: 5 AKT for first deployment
#    Get AKT: https://akash.network/token

# 3. Check your balance
provider-services query bank balances $(provider-services keys show my-akash-account -a --keyring-backend file --home ~/.akash) \
  --node https://rpc.akash.forbole.com:443
```

**Authentication Note**:

The workflow uses **JWT authentication** (default in provider-services v0.10.0+), which means:
- ✅ No blockchain certificates required
- ✅ No certificate expiration to manage
- ✅ No additional transaction costs
- ✅ Simpler setup

JWT tokens are automatically generated by provider-services using your wallet's private key.

**After First Deployment** (Optional but Recommended):

After your first deployment is live, store the deployment sequence number for automated updates:

```bash
# 1. List your active deployments
provider-services query deployment list --owner $(provider-services keys show my-akash-account -a --keyring-backend file --home ~/.akash) \
  --node https://rpc.akash.forbole.com:443

# 2. Copy the DSEQ value from the output
# 3. In GitHub: Go to Settings → Secrets and variables → Actions → Variables
# 4. Add repository variable: AKASH_DEPLOYMENT_DSEQ = [your DSEQ value]
# 5. Future pushes will update the existing deployment instead of creating new ones
```

### Workflow 3: Create 303 Token on Pump.fun (`create-token.yml`)

**Trigger**: Manual dispatch only (via GitHub Actions UI)

**Secrets Required**:

| Secret Name | Description | Setup Instructions |
|---|---|---|
| `SOLANA_PRIVATE_KEY` | Base58-encoded Solana wallet private key | Export from wallet (Phantom, Solflare, etc.) |
| `HELIUS_API_KEY` | API key for Helius RPC endpoint | Sign up at [helius.dev](https://helius.dev) |
| `SHYFT_API_KEY` | API key for Shyft (optional, for enhanced metadata) | Sign up at [shyft.to](https://shyft.to) |

**Setting up Solana Private Key**:

```bash
# Using Solana CLI
solana config get
# Then export the keypair from: ~/.config/solana/id.json
```

Or for Phantom/Solflare wallets:
1. Export your private key from your wallet settings
2. Ensure it's in Base58 format
3. Add to GitHub Secrets as `SOLANA_PRIVATE_KEY`

⚠️ **Security Note**: Never commit private keys to your repository. Always use GitHub Secrets.

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

