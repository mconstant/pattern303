# Pattern 303 Verification Service

Lightweight backend service that verifies newly minted Pattern 303 NFTs into the collection.

## What It Does

When a user mints a Pattern 303 NFT, the frontend calls this service which:
1. Validates the NFT is a legitimate P303 pattern
2. Signs a collection verification transaction using the treasury wallet
3. Returns success/failure to the frontend

This allows patterns to appear in the "All Patterns" collection view immediately.

## Environment Variables

```bash
COLLECTION_ADDRESS=EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz
TREASURY_PRIVATE_KEY=[1,2,3,...]  # JSON array of private key bytes
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
PORT=3001
```

## Local Development

```bash
cd server
npm install
npm run dev
```

The service will run on http://localhost:3001

## API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "collection": "EZPi...",
  "authority": "Fkz..."
}
```

### `POST /verify-pattern`
Verify a Pattern 303 NFT into the collection.

**Request:**
```json
{
  "mintAddress": "ABC123..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Pattern verified in collection",
  "mintAddress": "ABC123...",
  "collection": "EZPi..."
}
```

**Response (Error):**
```json
{
  "error": "Not a Pattern 303 NFT",
  "details": {
    "symbol": "WRONG",
    "uri": "https://..."
  }
}
```

## Security Features

- Rate limiting: 10 requests per minute per IP
- Symbol validation: Only P303 NFTs can be verified
- URI validation: Must contain 'p303.xyz' pattern
- Authorization: Only treasury wallet can sign verifications

## Production Deployment

This service is deployed alongside the frontend in the same Docker container on Akash.

The Dockerfile runs both nginx (frontend) and this Node.js service (backend).

## Resources

- **RAM**: ~50-100MB
- **CPU**: Minimal (only on verification requests)
- **Storage**: None (stateless)
- **Network**: RPC calls to Solana only
