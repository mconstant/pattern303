# Backend Verification Service - Deployment Checklist

## ✅ Implementation Complete

All code changes for the backend verification service have been implemented and committed to this PR.

## 📋 Pre-Deployment Checklist

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions → Secrets):

- [ ] **VITE_VERIFY_API_URL** - Your production domain (e.g., `https://p303.xyz`)
  ```bash
  gh secret set VITE_VERIFY_API_URL -b "https://p303.xyz"
  ```

- [ ] **VITE_HELIUS_API_KEY** - Your Helius API key (if not already set)
  ```bash
  gh secret set VITE_HELIUS_API_KEY -b "your_helius_key"
  ```

### 2. Prepare Verification Wallet

⚠️ **SECURITY BEST PRACTICE**: Use a separate verification-only wallet

```bash
# Option A: Create a new verification-only wallet (recommended)
solana-keygen new --outfile ~/.config/solana/verification-wallet.json

# View the new wallet address
solana address -k ~/.config/solana/verification-wallet.json

# Fund it with minimal SOL (0.1-0.2 SOL for transaction fees)
solana transfer <VERIFICATION_WALLET_ADDRESS> 0.1

# Export private key as JSON array
cat ~/.config/solana/verification-wallet.json
# Copy this entire array including brackets: [1,2,3,...]
```

```bash
# Option B: Use existing treasury wallet (less secure)
cat ~/.config/solana/id.json
# Copy this entire array including brackets: [1,2,3,...]
```

### 3. Akash Environment Variables

Prepare these values to add in Akash Console during deployment:

- [ ] **COLLECTION_ADDRESS**: `EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz`
- [ ] **VERIFICATION_WALLET_PKEY**: `[1,2,3,...]` (from step 2)
- [ ] **SOLANA_RPC_URL**: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

## 🚀 Deployment Steps

### Step 1: Build Docker Image

Trigger the "Build Docker Image" workflow in GitHub Actions:
1. Go to Actions → Build Docker Image
2. Click "Run workflow"
3. Wait for build to complete
4. Note the image tag (short SHA)

### Step 2: Deploy to Akash

#### Option A: Automated Deployment (Recommended)

1. Ensure these secrets are set in your GitHub environment (dev/prod):
   - [ ] `AKASH_DEPLOYMENT_DSEQ` - Your deployment sequence number
   - [ ] `VERIFICATION_WALLET_PKEY` - The wallet private key array
   - [ ] All other Akash secrets (wallet, node, etc.)

2. Trigger the "Deploy to Akash Network" workflow:
   - Go to Actions → Deploy to Akash Network
   - Click "Run workflow"
   - Select environment (dev/prod)
   - Select action (deploy/update)
   - Click "Run workflow"

#### Option B: Manual Deployment via Akash Console

1. Go to [Akash Console](https://console.akash.network)

2. Create or update deployment using `deploy.yaml`

3. **Set image to**: `ghcr.io/mconstant/pattern303-prod:latest` (or your specific tag)

4. **Add environment variables** in the deployment form:
   ```
   COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
   VERIFICATION_WALLET_PKEY=[paste your wallet array here]
   SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
   ```

5. Review resource allocation:
   - CPU: 0.5 units ✅
   - Memory: 600Mi ✅
   - Storage: 1Gi ✅

6. Deploy and wait for lease creation

### Step 3: Verify Deployment

1. **Check backend health**:
   ```bash
   curl https://your-domain.com:3001/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "collection": "EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz",
     "authority": "FkzL39Ww8pSDFcHuPSypGechS3EP9RE8FtsiYDtauUE2"
   }
   ```

2. **Check frontend loads**:
   ```bash
   curl -I https://your-domain.com
   ```

3. **Test minting flow**:
   - Go to your Pattern 303 app
   - Connect wallet
   - Create a pattern
   - Mint the pattern
   - Check browser console for verification logs:
     ```
     [VERIFY] ✓ Pattern verified in collection: <mint_address>
     ```
   - Wait 30-60 seconds
   - Go to "All Patterns" page
   - Verify your pattern appears

## 🔍 Troubleshooting

### Backend Not Starting

**Check container logs:**
```bash
# Via Akash Console: Deployments → Your deployment → Logs
```

**Common issues:**
- ❌ `Missing required environment variables` → Add COLLECTION_ADDRESS, VERIFICATION_WALLET_PKEY, SOLANA_RPC_URL
- ❌ `Invalid key length` → Check VERIFICATION_WALLET_PKEY is a valid 64-byte array
- ❌ `Failed to initialize treasury signer` → Verify wallet format is correct JSON array

### Verification Failing

**Check verification endpoint:**
```bash
curl -X POST https://your-domain.com:3001/verify-pattern \
  -H "Content-Type: application/json" \
  -d '{"mintAddress":"YOUR_MINT_ADDRESS"}'
```

**Common issues:**
- ❌ `Not a Pattern 303 NFT` → The NFT doesn't have P303 symbol or p303.xyz URI
- ❌ `Rate limit exceeded` → Wait 1 minute and try again
- ❌ `Verification failed` → Check backend has sufficient SOL for transaction fees

### Patterns Not Appearing in "All Patterns"

1. **Wait 30-60 seconds** for blockchain confirmation
2. **Click the Refresh button** on All Patterns page
3. **Check browser console** for errors
4. **Verify the mint** on Solana Explorer:
   - Check if collection field is set
   - Check if `verified: true` in collection metadata

## 📊 Post-Deployment Monitoring

### Key Metrics to Monitor

1. **Backend uptime**: Check `/health` endpoint every 5 minutes
2. **Wallet balance**: Monitor verification wallet balance (should stay above 0.05 SOL)
3. **Verification success rate**: Check backend logs for failed verifications
4. **All Patterns page**: Verify newly minted patterns appear within 60 seconds

### Maintenance Tasks

- [ ] **Weekly**: Check verification wallet balance, top up if below 0.05 SOL
- [ ] **Monthly**: Review backend logs for any patterns of failures
- [ ] **As needed**: Restart container if health check fails

## 📝 Implementation Summary

### Changes Made in This PR

1. **Dockerfile** (`/Dockerfile`)
   - ✅ Added `VITE_VERIFY_API_URL` build argument
   - ✅ Added `VITE_VERIFY_API_URL` environment variable

2. **Deployment Config** (`/deploy.yaml`)
   - ✅ Exposed port 3001 for backend verification service
   - ✅ Increased memory from 512Mi to 600Mi
   - ✅ Added security documentation comments

3. **Backend Dependencies** (`/server/package.json`)
   - ✅ Added `bs58` dependency for key decoding

4. **GitHub Workflows** (`.github/workflows/`)
   - ✅ Updated `build-image.yml` with `VITE_VERIFY_API_URL` build arg
   - ✅ Updated `deploy-akash.yml` with `VITE_VERIFY_API_URL` build arg

### Existing Files (Already Implemented)

These files were already present in the codebase:

- ✅ `server/index.js` - Backend verification service (150 lines)
- ✅ `src/lib/verifyApi.ts` - Frontend API client
- ✅ `src/hooks/useMint.ts` - Minting hook with verification call
- ✅ `src/vite-env.d.ts` - TypeScript definitions
- ✅ `.env.example` - Environment variable documentation
- ✅ Documentation files (COLLECTION_ISSUE.md, IMPLEMENTATION.md, DEPLOYMENT.md)

## 🎉 Ready to Deploy!

All code changes are complete. Follow the deployment steps above to go live.

**Estimated time to deploy**: 15-30 minutes

**Cost impact**: +$0.50/month (minimal)

**Benefits**:
- ✅ Patterns appear in "All Patterns" immediately after minting
- ✅ Improved user experience
- ✅ No manual verification needed
- ✅ Scalable and secure architecture
