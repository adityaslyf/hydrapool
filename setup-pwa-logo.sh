#!/bin/bash

# HydraPool PWA Logo Setup Script
# Generates all required PWA icon sizes from logo.png

echo "🎨 HydraPool PWA Logo Setup"
echo "============================"

# Check if logo exists
if [ ! -f "public/logo.png" ]; then
    echo "❌ Error: logo.png not found in public/ directory"
    exit 1
fi

# Verify it's a valid image
if ! identify public/logo.png > /dev/null 2>&1; then
    echo "❌ Error: public/logo.png is not a valid image file"
    exit 1
fi

echo "✅ Found valid logo at public/logo.png"

# Get original image dimensions
ORIGINAL_SIZE=$(identify -format "%wx%h" public/logo.png)
echo "📏 Original logo size: $ORIGINAL_SIZE"

echo "🔧 Generating PWA icons using ImageMagick..."

# Generate favicon.ico (16x16 and 32x32 in one file)
echo "   📱 Creating favicon.ico..."
magick public/logo.png -resize 16x16 /tmp/favicon-16.png
magick public/logo.png -resize 32x32 /tmp/favicon-32.png
magick /tmp/favicon-16.png /tmp/favicon-32.png public/favicon.ico

# Generate PWA icons
echo "   📱 Creating icon-144.png (144x144)..."
magick public/logo.png -resize 144x144 -quality 100 public/icon-144.png

echo "   📱 Creating icon-152.png (152x152)..."
magick public/logo.png -resize 152x152 -quality 100 public/icon-152.png

echo "   📱 Creating icon-192.png (192x192)..."
magick public/logo.png -resize 192x192 -quality 100 public/icon-192.png

echo "   📱 Creating icon-512.png (512x512)..."
magick public/logo.png -resize 512x512 -quality 100 public/icon-512.png

# Generate Apple touch icon
echo "   🍎 Creating apple-touch-icon.png (180x180)..."
magick public/logo.png -resize 180x180 -quality 100 public/apple-touch-icon.png

# Clean up temporary files
rm -f /tmp/favicon-16.png /tmp/favicon-32.png

echo ""
echo "✅ Successfully generated all PWA icons:"
echo "   📱 favicon.ico (16x16, 32x32) - Browser favicon"
echo "   📱 icon-144.png (144x144) - Windows tile"
echo "   📱 icon-152.png (152x152) - iPad home screen"
echo "   🍎 apple-touch-icon.png (180x180) - iOS home screen"
echo "   📱 icon-192.png (192x192) - Android home screen"
echo "   📱 icon-512.png (512x512) - Android splash screen"

echo ""
echo "📊 Generated file sizes:"
ls -lh public/favicon.ico public/icon-*.png public/apple-touch-icon.png 2>/dev/null | awk '{print "   " $9 " - " $5}'

echo ""
echo "🎉 PWA icons generated successfully!"
echo "📝 Next: Update your manifest.json to use these icons"
