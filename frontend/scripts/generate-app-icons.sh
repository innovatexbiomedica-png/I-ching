#!/bin/bash
# generate-app-icons.sh
# =====================
# Genera tutti i tagli icona richiesti da iOS e Android partendo dal
# logo 1000×1000 in public/logo-iching-1000x1000.jpg.
#
# Uso:
#   cd frontend && ./scripts/generate-app-icons.sh
#
# Dipendenze: sips (macOS built-in). Su Linux/Windows, sostituire con
# ImageMagick.

set -e
cd "$(dirname "$0")/.."

SRC="public/logo-iching-1000x1000.jpg"
if [ ! -f "$SRC" ]; then
  echo "❌ Sorgente non trovata: $SRC"
  exit 1
fi

echo "📱 Genero icone iOS in ios/App/App/Assets.xcassets/AppIcon.appiconset/"
IOS_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$IOS_DIR"

declare -a IOS_SIZES=(
  "20:AppIcon-20.png"
  "40:AppIcon-20@2x.png"
  "60:AppIcon-20@3x.png"
  "29:AppIcon-29.png"
  "58:AppIcon-29@2x.png"
  "87:AppIcon-29@3x.png"
  "80:AppIcon-40@2x.png"
  "120:AppIcon-40@3x.png"
  "120:AppIcon-60@2x.png"
  "180:AppIcon-60@3x.png"
  "76:AppIcon-76.png"
  "152:AppIcon-76@2x.png"
  "167:AppIcon-83.5@2x.png"
  "1024:AppIcon-512@2x.png"
)
for entry in "${IOS_SIZES[@]}"; do
  size=${entry%%:*}
  name=${entry##*:}
  sips -s format png -Z "$size" "$SRC" --out "$IOS_DIR/$name" >/dev/null
done

# Contents.json minima per Xcode che mappa i file alle dimensioni
cat > "$IOS_DIR/Contents.json" <<'EOF'
{
  "images": [
    { "size": "20x20", "idiom": "iphone", "filename": "AppIcon-20@2x.png", "scale": "2x" },
    { "size": "20x20", "idiom": "iphone", "filename": "AppIcon-20@3x.png", "scale": "3x" },
    { "size": "29x29", "idiom": "iphone", "filename": "AppIcon-29@2x.png", "scale": "2x" },
    { "size": "29x29", "idiom": "iphone", "filename": "AppIcon-29@3x.png", "scale": "3x" },
    { "size": "40x40", "idiom": "iphone", "filename": "AppIcon-40@2x.png", "scale": "2x" },
    { "size": "40x40", "idiom": "iphone", "filename": "AppIcon-40@3x.png", "scale": "3x" },
    { "size": "60x60", "idiom": "iphone", "filename": "AppIcon-60@2x.png", "scale": "2x" },
    { "size": "60x60", "idiom": "iphone", "filename": "AppIcon-60@3x.png", "scale": "3x" },
    { "size": "20x20", "idiom": "ipad", "filename": "AppIcon-20.png", "scale": "1x" },
    { "size": "20x20", "idiom": "ipad", "filename": "AppIcon-20@2x.png", "scale": "2x" },
    { "size": "29x29", "idiom": "ipad", "filename": "AppIcon-29.png", "scale": "1x" },
    { "size": "29x29", "idiom": "ipad", "filename": "AppIcon-29@2x.png", "scale": "2x" },
    { "size": "40x40", "idiom": "ipad", "filename": "AppIcon-40@2x.png", "scale": "2x" },
    { "size": "76x76", "idiom": "ipad", "filename": "AppIcon-76.png", "scale": "1x" },
    { "size": "76x76", "idiom": "ipad", "filename": "AppIcon-76@2x.png", "scale": "2x" },
    { "size": "83.5x83.5", "idiom": "ipad", "filename": "AppIcon-83.5@2x.png", "scale": "2x" },
    { "size": "1024x1024", "idiom": "ios-marketing", "filename": "AppIcon-512@2x.png", "scale": "1x" }
  ],
  "info": { "version": 1, "author": "xcode" }
}
EOF

echo "🤖 Genero icone Android in android/app/src/main/res/mipmap-*/"
declare -a ANDROID_SIZES=(
  "48:mdpi"
  "72:hdpi"
  "96:xhdpi"
  "144:xxhdpi"
  "192:xxxhdpi"
)
for entry in "${ANDROID_SIZES[@]}"; do
  size=${entry%%:*}
  density=${entry##*:}
  dir="android/app/src/main/res/mipmap-${density}"
  mkdir -p "$dir"
  sips -s format png -Z "$size" "$SRC" --out "$dir/ic_launcher.png" >/dev/null
  sips -s format png -Z "$size" "$SRC" --out "$dir/ic_launcher_round.png" >/dev/null
  sips -s format png -Z "$size" "$SRC" --out "$dir/ic_launcher_foreground.png" >/dev/null
done

# Play Store hi-res
mkdir -p store-assets
sips -Z 512 "$SRC" --out store-assets/google-play-icon-512.png >/dev/null
sips -Z 1024 "$SRC" --out store-assets/appstore-icon-1024.png >/dev/null

echo ""
echo "✅ Icone generate:"
echo "   • $(find ios/App/App/Assets.xcassets/AppIcon.appiconset -name '*.png' | wc -l | tr -d ' ') iOS"
echo "   • $(find android/app/src/main/res -name 'ic_launcher*.png' | wc -l | tr -d ' ') Android"
echo "   • 2 store ($(ls store-assets/ | wc -l | tr -d ' ') assets in store-assets/)"
