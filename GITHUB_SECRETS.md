# GitHub Secrets & Environment Variables Configuration

## Required GitHub Secrets

You need to add **ONE new secret** for the verification service.

### Repository Secrets (Settings → Secrets and variables → Actions → Secrets)

#### Existing (keep these):
- ✅ `VITE_TREASURY_WALLET` - Your treasury wallet address
- ✅ `VITE_303_TOKEN_MINT` - Your 303 token mint address
- ✅ `VITE_COLLECTION_ADDRESS` - Your P303 collection address

#### New (add this):
- 🆕 `VITE_VERIFY_API_URL` - Your verification API URL (e.g., `https://p303.xyz`)

### Optional for Enhanced Security:
- 🆕 `VITE_HELIUS_API_KEY` - Your Helius RPC API key (recommended)

## Environment Variables for Akash Deployment

These are **runtime** secrets that should be set in Akash Console (NOT in GitHub):

### Akash Console → Environment Variables

When deploying on Akash, add these environment variables:

```bash
COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
TREASURY_PRIVATE_KEY=[your,private,key,array,here]
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
PORT=3001
```

⚠️ **IMPORTANT**: `TREASURY_PRIVATE_KEY` is your wallet's private key as a JSON array.

## Getting Your Private Key

```bash
# View your keypair file
cat ~/.config/solana/id.json

# It will output something like:
[123,45,67,89,...]
```

Copy the entire array including brackets `[...]` and paste it as the `TREASURY_PRIVATE_KEY` value in Akash.

## GitHub Actions Workflow Updates

### Update `.github/workflows/build-image.yml`

Add the new build arg to the Docker build step:

```yaml
build-args: |
  VITE_TREASURY_WALLET=${{ secrets.VITE_TREASURY_WALLET }}
  VITE_303_TOKEN_MINT=${{ secrets.VITE_303_TOKEN_MINT }}
  VITE_COLLECTION_ADDRESS=${{ secrets.VITE_COLLECTION_ADDRESS }}
  VITE_HELIUS_API_KEY=${{ secrets.VITE_HELIUS_API_KEY }}
  VITE_VERIFY_API_URL=${{ secrets.VITE_VERIFY_API_URL }}  # ← ADD THIS
```

## Security Checklist

- [ ] Added `VITE_VERIFY_API_URL` to GitHub Secrets
- [ ] Optionally added `VITE_HELIUS_API_KEY` to GitHub Secrets
- [ ] Exported treasury wallet private key as JSON array
- [ ] Stored `TREASURY_PRIVATE_KEY` securely (NOT in GitHub, only in Akash)
- [ ] Stored `SOLANA_RPC_URL` with Helius key securely
- [ ] Updated build workflow with new build args

## Quick Setup Commands

### 1. Add GitHub Secrets via CLI

```bash
# Set the new secret
gh secret set VITE_VERIFY_API_URL -b "https://p303.xyz"

# Optional: Set Helius key
gh secret set VITE_HELIUS_API_KEY -b "your_helius_key_here"

# Verify secrets
gh secret list
```

### 2. Export Private Key for Akash

```bash
# Export your private key
cat ~/.config/solana/id.json | pbcopy

# Now paste this into Akash Console as TREASURY_PRIVATE_KEY
```

## Testing Secrets Locally

Create a `.env` file (never commit this!):

```bash
# Frontend (build-time)
VITE_TREASURY_WALLET=FkzL39Ww8pSDFcHuPSypGechS3EP9RE8FtsiYDtauUE2
VITE_303_TOKEN_MINT=your_token_mint
VITE_COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
VITE_HELIUS_API_KEY=your_helius_key
VITE_VERIFY_API_URL=http://localhost:3001

# Backend (runtime)
COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
TREASURY_PRIVATE_KEY=[paste,your,key,array,here]
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_key
```

## Summary

### In GitHub (Build Time)
- Build args are injected during Docker build
- Add 1-2 new secrets to GitHub repository

### In Akash (Runtime)
- Environment variables are passed to running container
- Add 3 new environment variables in Akash Console

**No changes to existing secrets** - just additions! ✅
