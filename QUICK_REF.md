# Quick Reference - Pattern 303 Deployment

## 🎯 30-Second Checklist

### GitHub (One Time)
```bash
gh secret set VITE_VERIFY_API_URL -b "https://p303.xyz"
gh secret set VITE_HELIUS_API_KEY -b "your_key"  # optional
```

### Get Private Key
```bash
cat ~/.config/solana/id.json | pbcopy
```

### Akash (Each Deploy)
Add 3 environment variables in Console:
```
COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
TREASURY_PRIVATE_KEY=[paste from above]
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### Verify
```bash
curl https://p303.xyz:3001/health
```

---

## 📋 Common Commands

```bash
# Add GitHub secrets
gh secret set VITE_VERIFY_API_URL -b "https://p303.xyz"

# Export private key
cat ~/.config/solana/id.json

# Build Docker image
git push  # triggers workflow

# Check deployment
curl https://p303.xyz:3001/health

# View logs
akash logs <deployment-id> --service web --follow

# Run tests locally
cd tests && npm install && npm test

# Test production
BASE_URL=https://p303.xyz npm test
```

---

## 🚨 Quick Troubleshooting

### Pattern not showing?
```bash
# Wait 60s, then click Refresh button
# Check backend logs:
akash logs <deployment> | grep VERIFY
```

### Backend not responding?
```bash
# Check if running:
akash logs <deployment> | grep "Verification Service"

# Check env vars:
akash logs <deployment> | grep "Missing"
```

### Tests failing?
```bash
# Download artifacts from Actions tab
# Tests are non-blocking - review but don't panic
```

---

## 📚 Full Documentation

- [COMPLETE_SETUP.md](COMPLETE_SETUP.md) - Start here!
- [GITHUB_SECRETS.md](GITHUB_SECRETS.md) - Secrets setup
- [DEPLOYMENT.md](DEPLOYMENT.MD) - Full deploy guide
- [TESTING.md](TESTING.md) - Test procedures
- [tests/README.md](tests/README.md) - Playwright tests

---

## ✅ Success Checklist

- [ ] GitHub secrets added
- [ ] Docker image built
- [ ] Akash env vars configured
- [ ] Backend health check passes
- [ ] Test mint succeeds
- [ ] Pattern shows in "All Patterns"

**All done? 🎉 You're live!**
