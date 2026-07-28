#!/bin/bash
echo "========================================================"
echo "  Starting Dentrix AI Mobile App (Expo Metro Bundler)"
echo "========================================================"
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Kill any leftover process on port 8081
lsof -ti :8081 | xargs kill -9 2>/dev/null || true

echo "Working Directory: $(pwd)"
echo ""
echo "Launching Expo Metro bundler..."
echo "Scan the QR code with Expo Go on your mobile device."
echo "If your Wi-Fi blocks LAN connections, run with '--tunnel'."
echo ""

if [ "$1" == "--tunnel" ]; then
  npx expo start --tunnel --clear
else
  npx expo start --host lan --clear
fi
