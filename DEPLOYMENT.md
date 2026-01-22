# Deployment Guide - Pattern 303 with Verification Service

## Overview

Your Pattern 303 app now includes a backend verification service. **Deployment complexity is minimal** - just a few additional environment variables.

## What Changed

### Before
- Frontend only (nginx serving static files)
- 1 port exposed (80)
- Build-time env vars only (VITE_*)

### After
- Frontend + Backend (nginx + Node.js in same container)
- 2 ports exposed (80, 3001)
- Build-time vars (VITE_*) + Runtime vars (backend config)

## Required Environment Variables

### Build-Time (VITE_* variables)
These are baked into the frontend during `docker build`:

```bash
VITE_TREASURY_WALLET=FkzL39Ww8pSDFcHuPSypGechS3EP9RE8FtsiYDtauUE2
VITE_303_TOKEN_MINT=your_token_mint
VITE_COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
VITE_HELIUS_API_KEY=your_helius_key
VITE_VERIFY_API_URL=https://your-domain.com  # Backend API URL
```

### Runtime (Backend variables)
These are passed at container runtime in Akash:

```bash
COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
VERIFICATION_WALLET_PKEY=[1,2,3,...]  # JSON array of your private key bytes
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
PORT=3001
```

## Getting Your Treasury Private Key

You need the private key as a JSON array. Use this command:

```bash
# If you have a keypair file (id.json):
cat ~/.config/solana/id.json

# Output will be like: [1,2,3,4,5,...]
```

⚠️ **Security**: This key has signing authority! Store it securely in Akash as an environment variable (not in code).

## Local Development

### 1. Install dependencies for both frontend and backend:

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Create `.env` file:

```bash
# Frontend vars
VITE_TREASURY_WALLET=FkzL39Ww8pSDFcHuPSypGechS3EP9RE8FtsiYDtauUE2
VITE_303_TOKEN_MINT=your_token
VITE_COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
VITE_HELIUS_API_KEY=your_key
VITE_VERIFY_API_URL=http://localhost:3001

# Backend vars (for local testing)
COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
VERIFICATION_WALLET_PKEY=[your,private,key,array]
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### 3. Run both services:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

## Docker Build

Build with all required build args:

```bash
docker buildx build \
  --build-arg VITE_TREASURY_WALLET=FkzL39... \
  --build-arg VITE_303_TOKEN_MINT=your_token \
  --build-arg VITE_COLLECTION_ADDRESS=EZPi... \
  --build-arg VITE_HELIUS_API_KEY=your_key \
  --build-arg VITE_VERIFY_API_URL=https://your-domain.com \
  -t ghcr.io/YOUR_USERNAME/pattern303:latest \
  --push \
  .
```

**No changes needed** from before - just add `VITE_VERIFY_API_URL`.

## Akash Deployment

### Option 1: Via Akash Console

1. Go to https://console.akash.network
2. Deploy with your SDL (deploy.yaml)
3. **Add environment variables** in the deployment form:
   - `COLLECTION_ADDRESS`
   - `VERIFICATION_WALLET_PKEY`
   - `SOLANA_RPC_URL`

### Option 2: Via SDL File

Your `deploy.yaml` already includes the env vars section. Just set them in Akash Console or CLI:

```yaml
env:
  - COLLECTION_ADDRESS=EZPi...
  - VERIFICATION_WALLET_PKEY=[1,2,3,...]
  - SOLANA_RPC_URL=https://...
  - PORT=3001
```

### Ports

The SDL exposes both ports:
- Port 80: Frontend (nginx)
- Port 3001: Backend verification API

## DNS Configuration

If using custom domain:

1. Point your domain to Akash provider
2. Update `VITE_VERIFY_API_URL` to your domain (e.g., `https://p303.xyz`)
3. The backend will be available at `https://p303.xyz:3001` or use a subdomain:
   - Frontend: `https://p303.xyz`
   - Backend: `https://api.p303.xyz`

## Verification Flow

1. User mints pattern → Frontend calls `mintPatternNFT()`
2. Mint succeeds → Frontend calls `/verify-pattern` endpoint
3. Backend validates NFT → Signs collection verification
4. Pattern appears in "All Patterns" immediately

## Resource Usage

**Total container resources:**
- CPU: 0.5 units (unchanged)
- RAM: 512Mi → **600Mi recommended** (added 100MB for Node.js)
- Storage: 1Gi (unchanged)

Update in deploy.yaml:
```yaml
memory:
  size: 600Mi  # Was 512Mi
```

## Troubleshooting

### Backend not starting
- Check logs: `docker logs <container>`
- Verify `VERIFICATION_WALLET_PKEY` is valid JSON array
- Ensure `COLLECTION_ADDRESS` matches your collection

### Verification failing
- Check backend is reachable: `curl http://your-domain:3001/health`
- Verify RPC URL has valid Helius key
- Check browser console for CORS errors

### Patterns not appearing in "All Patterns"
- Wait 30-60 seconds for blockchain confirmation
- Click the Refresh button
- Check backend logs for verification errors

## Rollback Plan

If something breaks, you can disable the verification service:

1. Remove backend env vars from Akash
2. The app will still work - patterns just won't auto-verify
3. Patterns will still show in "My Patterns"

## Cost Impact

**Before**: ~$2-5/month on Akash  
**After**: ~$2.50-5.50/month (added ~$0.50 for extra RAM)

Negligible increase!

## Summary

✅ Minimal deployment complexity  
✅ Same Docker workflow  
✅ Just 3 new environment variables  
✅ <10% resource increase  
✅ No separate services/containers needed  

You're good to go! 🚀
