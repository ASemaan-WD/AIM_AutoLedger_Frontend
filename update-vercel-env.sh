#!/bin/bash

# Update Vercel Environment Variables for Timeout Fix
# This updates the critical timeout values for OCR processing

set -e

echo "======================================"
echo "🔧 Updating Vercel Environment Variables"
echo "======================================"
echo ""

# Update OPENAI_TIMEOUT_SECONDS to 60 (was likely 90)
echo "1. Updating OPENAI_TIMEOUT_SECONDS to 60..."
vercel env rm OPENAI_TIMEOUT_SECONDS production --yes 2>/dev/null || true
echo "60" | vercel env add OPENAI_TIMEOUT_SECONDS production

# Update MAX_VISION_RETRIES to 0 (disable retries for Pro plan)
echo "2. Updating MAX_VISION_RETRIES to 0..."
vercel env rm MAX_VISION_RETRIES production --yes 2>/dev/null || true
echo "0" | vercel env add MAX_VISION_RETRIES production

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "Updated variables:"
echo "  - OPENAI_TIMEOUT_SECONDS = 60"
echo "  - MAX_VISION_RETRIES = 0"
echo ""
echo "Note: These changes will take effect on the next deployment."

