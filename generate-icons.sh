#!/bin/bash

# HydraPool PWA Icon Generator
# Generates all required PWA icon sizes from your existing logo

echo "🎨 HydraPool PWA Icon Generator"
echo "================================"

# Check if source logo exists
if [ ! -f "public/icons/logo.png" ]; then
    echo "❌ Error: Source logo not found at public/icons/logo.png"
    exit 1
fi

# Verify it's a valid image
if ! identify public/icons/logo.png > /dev/null 2>&1; then
    echo "❌ Error: public/icons/logo.png is not a valid image file"
    exit 1
fi

echo "✅ Found valid logo at public/icons/logo.png"

# Get original image dimensions
ORIGINAL_SIZE=$(identify -format "%wx%h" public/icons/logo.png)
echo "📏 Original logo size: $ORIGINAL_SIZE"

echo "🔧 Generating PWA icons..."

# Generate favicon.ico (multiple sizes in one file)
echo "   📱 Generating favicon.ico..."
convert public/icons/logo.png -resize 16x16 /tmp/favicon-16.png
convert public/icons/logo.png -resize 32x32 /tmp/favicon-32.png
convert /tmp/favicon-16.png /tmp/favicon-32.png public/favicon.ico

# Generate PWA icons with high quality
echo "   📱 Generating icon-144.png (144x144)..."
convert public/icons/logo.png -resize 144x144 -quality 100 public/icon-144.png

echo "   📱 Generating icon-152.png (152x152)..."
convert public/icons/logo.png -resize 152x152 -quality 100 public/icon-152.png

echo "   📱 Generating icon-192.png (192x192)..."
convert public/icons/logo.png -resize 192x192 -quality 100 public/icon-192.png

echo "   📱 Generating icon-512.png (512x512)..."
convert public/icons/logo.png -resize 512x512 -quality 100 public/icon-512.png

# Generate Apple touch icon
echo "   🍎 Generating apple-touch-icon.png (180x180)..."
convert public/icons/logo.png -resize 180x180 -quality 100 public/apple-touch-icon.png

# Clean up temporary files
rm /tmp/favicon-16.png /tmp/favicon-32.png

echo ""
echo "✅ Successfully generated all PWA icons:"
echo "   📱 favicon.ico (16x16, 32x32) - Browser favicon"
echo "   📱 icon-144.png (144x144) - Windows tile"
echo "   📱 icon-152.png (152x152) - iPad home screen"
echo "   🍎 apple-touch-icon.png (180x180) - iOS home screen"
echo "   📱 icon-192.png (192x192) - Android home screen"
echo "   📱 icon-512.png (512x512) - Android splash screen"

echo ""
echo "🎉 PWA icons generated successfully!"
echo "📝 Your manifest.json is now properly configured"
echo "🚀 Deploy your app to see the HydraPool logo!"

# Show file sizes
echo ""
echo "📊 Generated file sizes:"
ls -lh public/*.png public/favicon.ico 2>/dev/null | awk '{print "   " $9 " - " $5}'
