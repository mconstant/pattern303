# Production Testing Guide

Comprehensive manual testing steps for Pattern 303 with verification service.

## Pre-Deployment Checklist

- [ ] Docker image built with all build args
- [ ] Image pushed to ghcr.io
- [ ] Akash deployment created with runtime env vars
- [ ] DNS/domain pointing to deployment
- [ ] SSL/TLS certificate (if using custom domain)

## Testing Phases

### Phase 1: Infrastructure Testing

#### 1.1 Frontend Availability

```bash
# Test frontend is serving
curl -I https://p303.xyz

# Expected: HTTP 200, Content-Type: text/html
```

**Browser Test:**
1. Open https://p303.xyz
2. Verify page loads without errors
3. Check browser console for errors
4. Verify network requests succeed

**Pass Criteria:**
- ✅ Page loads in <3 seconds
- ✅ No console errors
- ✅ All assets load (fonts, images)

#### 1.2 Backend Availability

```bash
# Test backend health endpoint
curl https://p303.xyz:3001/health

# Expected output:
{
  "status": "ok",
  "collection": "EZPi...",
  "authority": "Fkz..."
}
```

**Pass Criteria:**
- ✅ Returns HTTP 200
- ✅ Shows correct collection address
- ✅ Shows correct authority address

#### 1.3 CORS Configuration

```bash
# Test CORS headers
curl -I -X OPTIONS https://p303.xyz:3001/verify-pattern \
  -H "Origin: https://p303.xyz" \
  -H "Access-Control-Request-Method: POST"

# Expected: Access-Control-Allow-Origin header present
```

**Pass Criteria:**
- ✅ CORS headers present
- ✅ Origin allowed

### Phase 2: Wallet Connection Testing

#### 2.1 Connect Phantom Wallet

1. Click "Connect Wallet" button
2. Select Phantom
3. Approve connection

**Pass Criteria:**
- ✅ Wallet connects successfully
- ✅ Wallet address displayed
- ✅ Network shown (mainnet-beta)
- ✅ No console errors

#### 2.2 Verify 303 Token Detection

1. With wallet connected, check console logs
2. Look for token holder status

**Pass Criteria:**
- ✅ Token balance fetched
- ✅ Holder status displayed correctly
- ✅ Free mint option shown if >303 tokens

### Phase 3: Pattern Creation Testing

#### 3.1 Create a Test Pattern

1. Navigate to "Create" tab
2. Adjust some knobs (tempo, cutoff, etc.)
3. Add some notes to the sequencer
4. Play the pattern (test synth)
5. Name the pattern: "Production Test Pattern 1"

**Pass Criteria:**
- ✅ Audio plays correctly
- ✅ Pattern updates in real-time
- ✅ All controls responsive

#### 3.2 Generate Pattern Preview

1. Click "Preview NFT" or similar button
2. View the SVG/image preview

**Pass Criteria:**
- ✅ SVG renders correctly
- ✅ Pattern data visible in preview
- ✅ No broken images

### Phase 4: Minting & Verification Testing

#### 4.1 Mint Pattern (Critical Test)

1. Click "Mint Pattern" button
2. Approve transaction in wallet
3. Wait for confirmation

**Monitor:**
- Browser console logs
- Network tab in DevTools
- Wallet notification

**Expected Console Logs:**
```
[COLLECTION] Attempting to verify collection membership...
[COLLECTION] ⚠️ Could not verify collection (expected for non-authority)
[VERIFY] ✓ Pattern verified in collection: ABC123...
```

**Pass Criteria:**
- ✅ Transaction confirms (view on Solana Explorer)
- ✅ Success message appears with mint address
- ✅ Verification endpoint called (check Network tab)
- ✅ Verification succeeds (check console)

#### 4.2 Verify Backend Received Request

```bash
# Check Akash logs for verification
akash logs <deployment> --service web

# OR via curl test
curl -X POST https://p303.xyz:3001/verify-pattern \
  -H "Content-Type: application/json" \
  -d '{"mintAddress":"YOUR_MINT_ADDRESS_FROM_STEP_4.1"}'

# Expected: {"success": true} or "already verified"
```

**Pass Criteria:**
- ✅ Backend received verification request
- ✅ Backend validated NFT
- ✅ Backend signed verification transaction
- ✅ No errors in logs

### Phase 5: Pattern Discovery Testing

#### 5.1 Check "My Patterns" Tab

1. Navigate to "My Patterns"
2. Wait 30-60 seconds for indexing
3. Click "Refresh" button if needed

**Pass Criteria:**
- ✅ Newly minted pattern appears
- ✅ Pattern name correct
- ✅ Pattern preview renders
- ✅ Pattern data accurate

#### 5.2 Check "All Patterns" Tab

1. Navigate to "Discover" or "All Patterns"
2. Look for your pattern
3. Click "Refresh" if not immediately visible

**Pass Criteria:**
- ✅ Pattern appears in collection view
- ✅ Pattern marked as verified
- ✅ Can load and play the pattern

#### 5.3 Verify On-Chain Data

```bash
# Query Helius DAS API for your wallet's assets
curl -X POST https://mainnet.helius-rpc.com/?api-key=YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test",
    "method": "getAssetsByOwner",
    "params": {
      "ownerAddress": "YOUR_WALLET_ADDRESS",
      "page": 1,
      "limit": 100
    }
  }' | jq '.result.items[] | select(.content.metadata.symbol == "P303")'

# Should return your pattern with correct metadata
```

**Pass Criteria:**
- ✅ Pattern NFT exists on-chain
- ✅ Symbol is "P303"
- ✅ URI contains pattern data
- ✅ Collection membership verified

### Phase 6: Pattern Loading Testing

#### 6.1 Load Pattern from "My Patterns"

1. Click "Load" on your minted pattern
2. Verify it loads into editor
3. Play the pattern

**Pass Criteria:**
- ✅ Pattern loads correctly
- ✅ All parameters match original
- ✅ Audio playback works
- ✅ Can edit and play

#### 6.2 Load Pattern from "All Patterns"

1. Go to "All Patterns"
2. Find a pattern (yours or someone else's)
3. Click "Load"
4. Play the pattern

**Pass Criteria:**
- ✅ Can load any pattern
- ✅ Pattern data decodes correctly
- ✅ Audio synthesis works

### Phase 7: Stress Testing

#### 7.1 Rate Limiting Test

```bash
# Test backend rate limiting (10 requests/min)
for i in {1..15}; do
  echo "Request $i"
  curl -X POST https://p303.xyz:3001/verify-pattern \
    -H "Content-Type: application/json" \
    -d '{"mintAddress":"test"}' \
    -w "\nHTTP Status: %{http_code}\n"
  sleep 1
done

# Expected: First 10 succeed, next 5 return 429
```

**Pass Criteria:**
- ✅ Rate limiting enforces 10/min limit
- ✅ Returns 429 status after limit
- ✅ Service remains responsive

#### 7.2 Multiple Pattern Mints

1. Mint 3-5 patterns in succession
2. Verify each one gets verified
3. Check all appear in "My Patterns"

**Pass Criteria:**
- ✅ All mints succeed
- ✅ All verifications succeed
- ✅ All patterns appear correctly

### Phase 8: Error Handling Testing

#### 8.1 Invalid Mint Address

```bash
# Test with invalid mint address
curl -X POST https://p303.xyz:3001/verify-pattern \
  -H "Content-Type: application/json" \
  -d '{"mintAddress":"invalid"}'

# Expected: 400 error with message
```

**Pass Criteria:**
- ✅ Returns appropriate error
- ✅ Error message helpful
- ✅ Service doesn't crash

#### 8.2 Network Failure Simulation

1. Disconnect internet briefly
2. Try to mint/load pattern
3. Reconnect

**Pass Criteria:**
- ✅ Graceful error handling
- ✅ Retry mechanisms work
- ✅ No data corruption

### Phase 9: Cross-Browser Testing

Test on:
- [ ] Chrome/Brave
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Pass Criteria:**
- ✅ Works on all browsers
- ✅ Wallet adapters work
- ✅ Audio synthesis works
- ✅ UI responsive

### Phase 10: Performance Testing

#### 10.1 Load Time

```bash
# Test page load performance
curl -w "@curl-format.txt" -o /dev/null -s https://p303.xyz

# Where curl-format.txt contains:
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
```

**Pass Criteria:**
- ✅ DNS lookup <200ms
- ✅ Initial connect <500ms
- ✅ Total load <3s

#### 10.2 Backend Response Time

```bash
# Test verification endpoint latency
time curl -X POST https://p303.xyz:3001/health
```

**Pass Criteria:**
- ✅ Health check <100ms
- ✅ Verification <2s (includes blockchain confirmation)

## Production Testing Checklist

### Infrastructure
- [ ] Frontend loads successfully
- [ ] Backend health endpoint responds
- [ ] CORS configured correctly
- [ ] SSL/TLS working (if applicable)

### Wallet & Connection
- [ ] Wallet connects (Phantom, Solflare, etc.)
- [ ] Network detection works
- [ ] Token balance fetched correctly

### Pattern Creation
- [ ] Can create patterns
- [ ] Audio synthesis works
- [ ] All controls responsive
- [ ] Preview generation works

### Minting & Verification
- [ ] Patterns mint successfully
- [ ] Mint transaction confirms on-chain
- [ ] Verification service called
- [ ] Verification succeeds
- [ ] Patterns appear in "My Patterns"
- [ ] Patterns appear in "All Patterns"

### Pattern Loading
- [ ] Can load own patterns
- [ ] Can load other users' patterns
- [ ] Pattern data decodes correctly
- [ ] Audio playback works

### Error Handling
- [ ] Rate limiting works
- [ ] Invalid inputs handled gracefully
- [ ] Network errors recovered
- [ ] Clear error messages

### Performance
- [ ] Page load <3s
- [ ] Backend responds <100ms
- [ ] Verification completes <5s
- [ ] No memory leaks

### Cross-Platform
- [ ] Works on desktop browsers
- [ ] Works on mobile browsers
- [ ] Wallet adapters work everywhere

## Quick Smoke Test (5 minutes)

Fastest way to verify everything works:

```bash
# 1. Check health
curl https://p303.xyz:3001/health

# 2. Open app
open https://p303.xyz

# 3. Connect wallet → Create pattern → Mint → Verify appears in "All Patterns"
```

If all three succeed, deployment is healthy! ✅

## Logging & Monitoring

### View Live Logs

```bash
# Akash logs
akash logs <deployment-id> --service web --follow

# Look for:
[COLLECTION] ✓ Collection verified for mint: ...
[VERIFY] ✓ Pattern verified in collection: ...
```

### Key Metrics to Monitor

- Mint success rate (should be ~100%)
- Verification success rate (should be ~100%)
- Backend uptime (should be 99%+)
- Average verification time (<5s)
- Rate limit hits (should be rare)

## Troubleshooting Common Issues

### Pattern Not Appearing

1. Wait 60 seconds (Helius indexing delay)
2. Click "Refresh" button
3. Check browser console for errors
4. Verify mint succeeded on Solana Explorer
5. Check backend logs for verification

### Verification Failing

1. Check backend logs
2. Verify `TREASURY_PRIVATE_KEY` is correct
3. Verify `COLLECTION_ADDRESS` matches
4. Check RPC URL is valid
5. Ensure rate limit not exceeded

### Backend Not Responding

1. Check Akash deployment status
2. Verify port 3001 is exposed
3. Check environment variables set
4. Review startup logs for errors

---

**All tests pass?** You're good to go! 🚀
