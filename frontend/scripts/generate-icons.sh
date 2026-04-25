#!/bin/bash
# Script per generare icone PWA da un'immagine sorgente
# Requisiti: ImageMagick (convert)

SOURCE="/app/frontend/public/logo-iching-hd.png"
OUTPUT_DIR="/app/frontend/public/icons"

# Crea directory se non esiste
mkdir -p $OUTPUT_DIR

# Dimensioni icone richieste per PWA
SIZES=(72 96 128 144 152 192 384 512)

for size in "${SIZES[@]}"; do
  echo "Generating ${size}x${size} icon..."
  convert "$SOURCE" -resize ${size}x${size} -gravity center -background "#F9F7F2" -extent ${size}x${size} "$OUTPUT_DIR/icon-${size}x${size}.png"
done

# Genera badge per notifiche (più piccolo)
convert "$SOURCE" -resize 72x72 -gravity center -background "#F9F7F2" -extent 72x72 "$OUTPUT_DIR/badge-72x72.png"

# Genera icone shortcut
convert "$SOURCE" -resize 96x96 -gravity center -background "#F9F7F2" -extent 96x96 "$OUTPUT_DIR/shortcut-consult.png"
convert "$SOURCE" -resize 96x96 -gravity center -background "#F9F7F2" -extent 96x96 "$OUTPUT_DIR/shortcut-history.png"
convert "$SOURCE" -resize 96x96 -gravity center -background "#F9F7F2" -extent 96x96 "$OUTPUT_DIR/shortcut-library.png"

# Genera splash screens per iOS
echo "Generating iOS splash screens..."
convert "$SOURCE" -resize 300x300 -gravity center -background "#F9F7F2" -extent 1125x2436 "$OUTPUT_DIR/splash-1125x2436.png"
convert "$SOURCE" -resize 300x300 -gravity center -background "#F9F7F2" -extent 1242x2688 "$OUTPUT_DIR/splash-1242x2688.png"
convert "$SOURCE" -resize 300x300 -gravity center -background "#F9F7F2" -extent 828x1792 "$OUTPUT_DIR/splash-828x1792.png"

echo "Done! Icons generated in $OUTPUT_DIR"