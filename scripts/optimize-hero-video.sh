#!/bin/bash

# Hero Video Optimization Script
# This script compresses and optimizes the hero video for production

set -e

echo "🎬 Hero Video Optimization Script"
echo "=================================="
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo "Install with: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)"
    exit 1
fi

# Check if input video exists
if [ ! -f "public/videos/mushroom-hero.mp4" ]; then
    echo "❌ Error: Video not found at public/videos/mushroom-hero.mp4"
    echo "Please add your video file first"
    exit 1
fi

echo "✓ Found video: public/videos/mushroom-hero.mp4"
echo ""

# Get input file size
INPUT_SIZE=$(du -h "public/videos/mushroom-hero.mp4" | cut -f1)
echo "Input file size: $INPUT_SIZE"
echo ""

# Create backup
echo "📦 Creating backup..."
cp public/videos/mushroom-hero.mp4 public/videos/mushroom-hero-original.mp4
echo "✓ Backup saved to: public/videos/mushroom-hero-original.mp4"
echo ""

# Generate poster image
echo "🖼️  Generating poster image..."
ffmpeg -i public/videos/mushroom-hero.mp4 \
  -ss 00:00:02 \
  -vframes 1 \
  -vf "scale=1920:-2" \
  -q:v 2 \
  public/videos/poster.jpg \
  -y

echo "✓ Poster image created: public/videos/poster.jpg"
POSTER_SIZE=$(du -h "public/videos/poster.jpg" | cut -f1)
echo "  Size: $POSTER_SIZE"
echo ""

# Compress to WebM (Primary)
echo "🎞️  Compressing to WebM (VP9 codec)..."
ffmpeg -i public/videos/mushroom-hero.mp4 \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 1M \
  -vf "scale=1920:-2" \
  -an \
  -auto-alt-ref 0 \
  -row-mt 1 \
  -threads 0 \
  public/videos/mushroom-hero.webm \
  -y

echo "✓ WebM created: public/videos/mushroom-hero.webm"
WEBM_SIZE=$(du -h "public/videos/mushroom-hero.webm" | cut -f1)
echo "  Size: $WEBM_SIZE"
echo ""

# Compress to optimized MP4 (Fallback)
echo "🎞️  Compressing to optimized MP4 (H.264 codec)..."
ffmpeg -i public/videos/mushroom-hero.mp4 \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -profile:v main \
  -level 4.0 \
  -movflags +faststart \
  -vf "scale=1920:-2" \
  -an \
  public/videos/mushroom-hero-optimized.mp4 \
  -y

# Replace original with optimized
mv public/videos/mushroom-hero-optimized.mp4 public/videos/mushroom-hero.mp4

echo "✓ Optimized MP4 created: public/videos/mushroom-hero.mp4"
MP4_SIZE=$(du -h "public/videos/mushroom-hero.mp4" | cut -f1)
echo "  Size: $MP4_SIZE"
echo ""

# Optional: Generate mobile versions
echo "📱 Generate mobile versions? (y/n)"
read -r MOBILE_ANSWER

if [ "$MOBILE_ANSWER" = "y" ]; then
    echo ""
    echo "📱 Generating mobile versions (720p)..."

    # Mobile WebM
    ffmpeg -i public/videos/mushroom-hero-original.mp4 \
      -c:v libvpx-vp9 \
      -crf 32 \
      -b:v 500k \
      -vf "scale=1280:-2" \
      -an \
      -auto-alt-ref 0 \
      public/videos/mushroom-hero-mobile.webm \
      -y

    # Mobile MP4
    ffmpeg -i public/videos/mushroom-hero-original.mp4 \
      -c:v libx264 \
      -crf 30 \
      -preset slow \
      -movflags +faststart \
      -vf "scale=1280:-2" \
      -an \
      public/videos/mushroom-hero-mobile.mp4 \
      -y

    MOBILE_WEBM_SIZE=$(du -h "public/videos/mushroom-hero-mobile.webm" | cut -f1)
    MOBILE_MP4_SIZE=$(du -h "public/videos/mushroom-hero-mobile.mp4" | cut -f1)

    echo "✓ Mobile WebM: $MOBILE_WEBM_SIZE"
    echo "✓ Mobile MP4: $MOBILE_MP4_SIZE"
fi

echo ""
echo "🎉 Optimization Complete!"
echo "========================="
echo ""
echo "Files created:"
echo "  • public/videos/mushroom-hero.webm ($WEBM_SIZE)"
echo "  • public/videos/mushroom-hero.mp4 ($MP4_SIZE)"
echo "  • public/videos/poster.jpg ($POSTER_SIZE)"
echo "  • public/videos/mushroom-hero-original.mp4 (backup)"
echo ""
echo "Next steps:"
echo "  1. Test the video at http://localhost:3000"
echo "  2. Check file sizes are under 10MB"
echo "  3. Verify smooth playback on mobile"
echo "  4. Run Lighthouse audit for performance metrics"
echo ""
echo "To revert: mv public/videos/mushroom-hero-original.mp4 public/videos/mushroom-hero.mp4"
