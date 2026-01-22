#!/bin/bash
# Setup verification-only wallet for Akash deployment
# This script helps create and configure a low-privilege wallet for collection verification

set -e

echo "🔐 Pattern 303 - Verification Wallet Setup"
echo "=========================================="
echo ""

# Configuration
VERIFICATION_KEYPAIR="$HOME/.config/solana/verification-only.json"
COLLECTION_ADDRESS="EZPiXbhJ5MMdQ79ATXmtQx1xVaC9yB5r19CSLxXRkcmz"
INITIAL_FUNDING="0.1"

# Step 1: Create verification wallet
echo "Step 1: Creating verification-only wallet..."
if [ -f "$VERIFICATION_KEYPAIR" ]; then
    echo "⚠️  Verification wallet already exists at $VERIFICATION_KEYPAIR"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping wallet creation."
    else
        rm "$VERIFICATION_KEYPAIR"
        solana-keygen new --outfile "$VERIFICATION_KEYPAIR" --no-bip39-passphrase
    fi
else
    solana-keygen new --outfile "$VERIFICATION_KEYPAIR" --no-bip39-passphrase
fi

# Get the new wallet address
VERIFICATION_ADDRESS=$(solana address -k "$VERIFICATION_KEYPAIR")
echo ""
echo "✅ Verification wallet created!"
echo "   Address: $VERIFICATION_ADDRESS"
echo ""

# Step 2: Fund the wallet
echo "Step 2: Funding verification wallet with $INITIAL_FUNDING SOL..."
echo "   (Using currently configured Solana CLI wallet)"
echo ""
read -p "Proceed with transfer? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    solana transfer "$VERIFICATION_ADDRESS" "$INITIAL_FUNDING" --allow-unfunded-recipient
    echo ""
    echo "✅ Funded verification wallet with $INITIAL_FUNDING SOL"
else
    echo "⏭️  Skipping funding. You can fund manually later:"
    echo "   solana transfer $VERIFICATION_ADDRESS 0.1"
fi

# Step 3: Display private key for Akash
echo ""
echo "Step 3: Private key for Akash environment variable"
echo "=================================================="
echo ""
echo "Copy the following private key array to your Akash deployment:"
echo ""
cat "$VERIFICATION_KEYPAIR"
echo ""
echo ""

# Step 4: Instructions for updating collection authority
echo "Step 4: Update Collection Authority"
echo "===================================="
echo ""
echo "⚠️  IMPORTANT: You need to update the collection's update authority"
echo "   to the verification wallet address using your main treasury wallet."
echo ""
echo "   Verification wallet address: $VERIFICATION_ADDRESS"
echo "   Collection address: $COLLECTION_ADDRESS"
echo ""
echo "You can do this using Metaplex Sugar or with this command:"
echo ""
echo "   metaboss collections set-update-authority \\"
echo "     --keypair ~/.config/solana/id.json \\"
echo "     --account $COLLECTION_ADDRESS \\"
echo "     --new-update-authority $VERIFICATION_ADDRESS"
echo ""
echo "Or use the Metaplex web UI: https://www.metaplex.com/"
echo ""

# Step 5: Summary
echo "📋 Setup Summary"
echo "================"
echo ""
echo "Verification Wallet: $VERIFICATION_ADDRESS"
echo "Balance: Check with: solana balance -k $VERIFICATION_KEYPAIR"
echo ""
echo "Next steps:"
echo "1. ✅ Verification wallet created and funded"
echo "2. ⏳ Transfer collection update authority (see command above)"
echo "3. ⏳ Copy private key to Akash env var: VERIFICATION_WALLET_PKEY"
echo "4. ⏳ Deploy to Akash with updated environment variables"
echo ""
echo "🔒 Security notes:"
echo "   • This wallet should ONLY be used for collection verification"
echo "   • Keep funding minimal (0.05-0.1 SOL)"
echo "   • Your main treasury wallet stays secure off Akash"
echo "   • Monitor balance periodically and top up as needed"
echo ""
