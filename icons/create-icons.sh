#!/bin/bash

# Create a simple placeholder for all required icon sizes
# This script creates solid color PNG files with text

# Array of required sizes
SIZES=(72 96 128 144 152 192 384 512)

# Create icons for each size
for size in "${SIZES[@]}"; do
  echo "Creating icon-${size}x${size}.png"
  
  # Create a simple icon with ImageMagick if available
  # If this fails, you'll need to create icons manually
  convert -size ${size}x${size} xc:#6750A4 -fill white -gravity center \
    -font Arial -pointsize $((size/3)) -annotate 0 "LM" \
    icon-${size}x${size}.png
done

echo "Done creating icons!"