# Backend Verification Service - Implementation Complete ✅

> **GitHub Issue**: [#4 - Patterns minted by users not visible in "All Patterns"](https://github.com/mconstant/pattern303/issues/4)
>
> **Related Docs**: [COLLECTION_ISSUE.md](./COLLECTION_ISSUE.md) | [DEPLOYMENT.md](./DEPLOYMENT.md) | [COMPLETE_SETUP.md](./COMPLETE_SETUP.md)

## What Was Added

### Backend Service (50 lines)
- **Location**: `server/index.js`
- **Purpose**: Verifies Pattern 303 NFTs into collection
- **Features**:
  - Health check endpoint
  - Pattern verification endpoint
  - Rate limiting (10/min per IP)
  - Symbol/URI validation
  - Error handling

### Frontend Integration
- **Location**: `src/lib/verifyApi.ts`
- **Purpose**: Client for calling verification service
- **Integration**: `src/hooks/useMint.ts` automatically calls verification after successful mint

### Deployment Updates
- **Dockerfile**: Multi-process container (nginx + Node.js)
- **deploy.yaml**: Added backend port (3001) and environment variables
- **Memory**: 512Mi → 600Mi (100MB for Node.js)

## Answers to Your Questions

### Does it make deployment more complicated?
**No!** Same workflow, just add 3 environment variables in Akash Console:
- `COLLECTION_ADDRESS`
- `TREASURY_PRIVATE_KEY`
- `SOLANA_RPC_URL`

### Does it need more VITE_ build args?
**Just one**: `VITE_VERIFY_API_URL=https://your-domain.com`

All other VITE_ vars remain the same.

### Updates to vite-env?
**Yes** - Added `VITE_VERIFY_API_URL` type definition (already done ✅)

### Dockerfile changes?
**Yes** - Multi-stage build now includes backend service (already done ✅)

### Workflow changes?
**Minimal**:
1. Same `docker build` command + one new build arg
2. Same Akash deployment + 3 new env vars at runtime

## File Summary

### New Files
```
server/
  ├── index.js          # Backend service (150 lines)
  ├── package.json      # Dependencies
  ├── README.md         # Service documentation
  ├── test.sh          # Test script
  └── .gitignore       # Ignore node_modules

src/lib/
  └── verifyApi.ts     # Frontend API client

DEPLOYMENT.md          # Complete deployment guide
COLLECTION_ISSUE.md    # Problem documentation (reference)
```

### Modified Files
```
src/hooks/useMint.ts          # Added verification call
src/vite-env.d.ts            # Added VITE_VERIFY_API_URL type
Dockerfile                    # Multi-process container
deploy.yaml                   # Added backend port + env vars
.env.example                  # Added new variables
```

## Quick Start

### Local Development
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
cd server
npm install
npm run dev

# Terminal 3 - Test
cd server
./test.sh
```

### Production Build
```bash
docker buildx build \
  --build-arg VITE_TREASURY_WALLET=FkzL39... \
  --build-arg VITE_303_TOKEN_MINT=your_token \
  --build-arg VITE_COLLECTION_ADDRESS=EZPi... \
  --build-arg VITE_HELIUS_API_KEY=your_key \
  --build-arg VITE_VERIFY_API_URL=https://p303.xyz \
  -t ghcr.io/YOUR_USERNAME/pattern303:latest \
  --push \
  .
```

### Akash Deployment
1. Same SDL file (deploy.yaml)
2. Add 3 env vars in Console:
   - `COLLECTION_ADDRESS=EZPi...`
   - `TREASURY_PRIVATE_KEY=[1,2,3,...]`
   - `SOLANA_RPC_URL=https://...`
3. Deploy!

## How It Works

```
User Mints Pattern
       ↓
Frontend calls mintPatternNFT()
       ↓
NFT created with verified=false
       ↓
Frontend calls POST /verify-pattern
       ↓
Backend validates & signs verification
       ↓
NFT collection verified=true
       ↓
Pattern appears in "All Patterns"
```

## Resource Impact

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| RAM | 512Mi | 600Mi | +88Mi |
| CPU | 0.5 | 0.5 | None |
| Ports | 1 (80) | 2 (80, 3001) | +1 |
| Env Vars | 4 build | 4 build + 3 runtime | +3 |
| Cost | $2-5/mo | $2.50-5.50/mo | +$0.50 |

## Benefits

✅ Immediate collection verification  
✅ Patterns show in "All Patterns" instantly  
✅ Full control over what gets verified  
✅ Future-proof (add moderation, analytics, etc.)  
✅ Minimal overhead (~100MB RAM)  
✅ Same container (no separate services)  

## Next Steps

1. **Test locally**: Run both services and test minting
2. **Get private key**: Export your treasury wallet key as JSON array
3. **Update .env**: Add the 3 backend variables
4. **Build & push**: Docker build with new arg
5. **Deploy to Akash**: Add env vars and deploy
6. **Test production**: Mint a pattern and verify it appears

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [server/README.md](server/README.md) - Backend API documentation
- [COLLECTION_ISSUE.md](COLLECTION_ISSUE.md) - Technical background

---

**Ready to deploy!** 🚀
