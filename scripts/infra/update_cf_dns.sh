#!/usr/bin/env bash
# Update Cloudflare DNS for p303.xyz (and optional subdomain) to point at an
# Akash backend hostname. Cloudflare CNAME flattening covers the apex.
# Usage: update_cf_dns.sh <subdomain> <new-akash-hostname>
#   subdomain "" / "@" / "prod" → apex (p303.xyz)
#   otherwise → <subdomain>.p303.xyz
set -euo pipefail

SUBDOMAIN="${1:-}"
NEW_ORIGIN="${2:-}"

if [ -z "$NEW_ORIGIN" ]; then
    echo "Usage: update_cf_dns.sh <subdomain> <akash-hostname>"
    exit 1
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "::warning::CLOUDFLARE_API_TOKEN not set - skipping DNS update"
  exit 0
fi

if [ -z "${CLOUDFLARE_ZONE_ID:-}" ]; then
  echo "::warning::CLOUDFLARE_ZONE_ID not set - skipping DNS update"
  exit 0
fi

RECORD_NAME="p303.xyz"
if [ "$SUBDOMAIN" != "" ] && [ "$SUBDOMAIN" != "@" ] && [ "$SUBDOMAIN" != "prod" ]; then
  RECORD_NAME="${SUBDOMAIN}.p303.xyz"
fi

echo "Updating Cloudflare DNS for ${RECORD_NAME} -> CNAME ${NEW_ORIGIN}"

GET_RESP=$(curl -sf -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${RECORD_NAME}&type=CNAME" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json")

RECORD_ID=$(echo "$GET_RESP" | jq -r '.result[0].id // empty')

if [ -n "$RECORD_ID" ]; then
  curl -sf -X PUT "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${RECORD_ID}" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"CNAME\",\"name\":\"${RECORD_NAME}\",\"content\":\"${NEW_ORIGIN}\",\"proxied\":true,\"ttl\":1}" > /dev/null || {
      echo "::warning::DNS Update Failed"
      exit 0
  }
  echo "DNS updated successfully."
else
  curl -sf -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"CNAME\",\"name\":\"${RECORD_NAME}\",\"content\":\"${NEW_ORIGIN}\",\"proxied\":true,\"ttl\":1}" > /dev/null || {
      echo "::warning::DNS Create Failed"
      exit 0
  }
  echo "DNS created successfully."
fi
