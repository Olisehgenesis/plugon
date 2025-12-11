#!/bin/bash

# Script to generate PNG icons from SVG files
# Requires: ImageMagick (convert) or Inkscape

echo "Generating icon files from SVG..."

# Check for ImageMagick
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    # Generate 200x200 icon
    convert public/icon.svg -resize 200x200 public/icon.png
    # Generate OG image (1200x630)
    convert public/og-image.svg -resize 1200x630 public/og-image.png
    echo "✓ Icons generated successfully!"
elif command -v inkscape &> /dev/null; then
    echo "Using Inkscape..."
    inkscape public/icon.svg --export-filename=public/icon.png --export-width=200 --export-height=200
    inkscape public/og-image.svg --export-filename=public/og-image.png --export-width=1200 --export-height=630
    echo "✓ Icons generated successfully!"
else
    echo "⚠ ImageMagick or Inkscape not found."
    echo "Please install one of them:"
    echo "  macOS: brew install imagemagick"
    echo "  Or use an online converter: https://cloudconvert.com/svg-to-png"
    echo ""
    echo "Required sizes:"
    echo "  - icon.png: 200x200px"
    echo "  - og-image.png: 1200x630px (3:2 ratio)"
fi

