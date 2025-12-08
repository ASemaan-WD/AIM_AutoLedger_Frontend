#!/bin/bash

# Toggle auth bypass in .env.local
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "VITE_BYPASS_AUTH=true" > "$ENV_FILE"
    echo "✅ Created .env.local with bypass ENABLED"
    exit 0
fi

# Check current state
if grep -q "VITE_BYPASS_AUTH=true" "$ENV_FILE"; then
    # Disable bypass
    sed -i '' 's/VITE_BYPASS_AUTH=true/VITE_BYPASS_AUTH=false/' "$ENV_FILE"
    echo "🔒 Auth bypass DISABLED"
    echo "   Restart your dev server for changes to take effect"
else
    # Enable bypass
    sed -i '' 's/VITE_BYPASS_AUTH=false/VITE_BYPASS_AUTH=true/' "$ENV_FILE"
    if [ $? -ne 0 ]; then
        # If the line doesn't exist, add it
        echo "VITE_BYPASS_AUTH=true" >> "$ENV_FILE"
    fi
    echo "🔓 Auth bypass ENABLED"
    echo "   Restart your dev server for changes to take effect"
fi




