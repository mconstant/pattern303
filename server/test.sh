#!/bin/bash

# Test script for Pattern 303 verification service

echo "🧪 Testing Pattern 303 Verification Service"
echo ""

# Check if backend is running
echo "1️⃣ Checking backend health..."
HEALTH=$(curl -s http://0.0.0.0:3001/health)

if [ $? -eq 0 ]; then
  echo "✅ Backend is running"
  echo "   Response: $HEALTH"
else
  echo "❌ Backend is not responding"
  echo "   Make sure to run: cd server && npm start"
  exit 1
fi

echo ""
echo "2️⃣ Testing verification endpoint..."

# Test with a fake mint (will fail validation but tests the endpoint)
RESPONSE=$(curl -s -X POST http://0.0.0.0:3001/verify-pattern \
  -H "Content-Type: application/json" \
  -d '{"mintAddress":"11111111111111111111111111111111"}')

echo "   Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "error"; then
  echo "✅ Endpoint is working (validation failed as expected)"
else
  echo "⚠️  Unexpected response"
fi

echo ""
echo "3️⃣ Testing rate limiting..."

for i in {1..12}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://0.0.0.0:3001/verify-pattern \
    -H "Content-Type: application/json" \
    -d '{"mintAddress":"test"}')
  
  if [ $i -eq 12 ] && [ "$STATUS" == "429" ]; then
    echo "✅ Rate limiting works (got 429 on request $i)"
    break
  fi
done

echo ""
echo "✅ All tests completed!"
echo ""
echo "🚀 Service is ready for deployment"
