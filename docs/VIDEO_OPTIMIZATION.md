# Video Optimization Guide for Hero Section

## Overview
The hero video is a critical component that needs extreme optimization to ensure fast page loads and smooth playback.

## Performance Optimizations Implemented

### 1. Lazy Loading with Intersection Observer
- Video only loads when the hero section is in viewport
- Uses `requestIdleCallback` to defer loading until browser is idle
- Automatic pause when section scrolls out of view

### 2. Preload Strategy
- `preload="metadata"` - Only loads video metadata initially
- Full video loads progressively when in view
- Reduces initial page load by ~5-10MB

### 3. Conditional Rendering
- Video element only renders when `shouldLoadVideo` is true
- Fallback gradients display instantly while video loads
- Smooth opacity transition when video is ready

### 4. Resource Optimization
- WebM format (60% smaller than MP4) loaded first
- MP4 fallback for Safari/older browsers
- Poster image for instant visual feedback

## Video Compression Guide

### Current File Location
- **Primary:** `/public/videos/mushroom-hero.mp4`
- **Optimized:** `/public/videos/mushroom-hero.webm` (recommended)
- **Poster:** `/public/videos/poster.svg` or `poster.jpg`

### Optimal Video Specifications

**Target Specs:**
- **Resolution:** 1920x1080 (1080p) maximum
- **Bitrate:** 1-2 Mbps for web delivery
- **Duration:** 15-30 seconds (loops seamlessly)
- **File Size:** <5MB ideal, <10MB maximum
- **Frame Rate:** 24-30fps
- **Audio:** Remove audio track (not needed for background video)

### FFmpeg Compression Commands

#### 1. WebM Format (Primary - Best Compression)
```bash
ffmpeg -i mushroom-hero.mp4 \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 1M \
  -vf "scale=1920:-2" \
  -an \
  -auto-alt-ref 0 \
  public/videos/mushroom-hero.webm
```

**Parameters explained:**
- `-c:v libvpx-vp9` - VP9 codec (best compression)
- `-crf 30` - Constant Rate Factor (quality: lower = better, 28-32 is good for web)
- `-b:v 1M` - Target 1 Mbps bitrate
- `-vf "scale=1920:-2"` - Scale to 1920px width, maintain aspect ratio
- `-an` - Remove audio track
- `-auto-alt-ref 0` - Disable alternate reference frames (better compatibility)

#### 2. MP4 Format (Fallback - Better Compatibility)
```bash
ffmpeg -i mushroom-hero.mp4 \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -profile:v main \
  -level 4.0 \
  -movflags +faststart \
  -vf "scale=1920:-2" \
  -an \
  public/videos/mushroom-hero.mp4
```

**Parameters explained:**
- `-c:v libx264` - H.264 codec (universal compatibility)
- `-crf 28` - Constant Rate Factor for quality
- `-preset slow` - Slower encoding = better compression
- `-profile:v main` - Main profile for broad compatibility
- `-movflags +faststart` - Move metadata to start for progressive download
- `-vf "scale=1920:-2"` - Scale to 1920px width
- `-an` - Remove audio track

#### 3. Generate Poster Image
```bash
# Extract frame at 2 seconds as poster
ffmpeg -i mushroom-hero.mp4 \
  -ss 00:00:02 \
  -vframes 1 \
  -vf "scale=1920:-2" \
  -q:v 2 \
  public/videos/poster.jpg
```

### Mobile Optimization (Optional)

For even better mobile performance, create a lower resolution version:

```bash
# Mobile WebM (720p)
ffmpeg -i mushroom-hero.mp4 \
  -c:v libvpx-vp9 \
  -crf 32 \
  -b:v 500k \
  -vf "scale=1280:-2" \
  -an \
  public/videos/mushroom-hero-mobile.webm

# Mobile MP4 (720p)
ffmpeg -i mushroom-hero.mp4 \
  -c:v libx264 \
  -crf 30 \
  -preset slow \
  -movflags +faststart \
  -vf "scale=1280:-2" \
  -an \
  public/videos/mushroom-hero-mobile.mp4
```

Then update the component to use responsive sources:
```tsx
<video>
  <source
    src="/videos/mushroom-hero.webm"
    type="video/webm"
    media="(min-width: 768px)"
  />
  <source
    src="/videos/mushroom-hero-mobile.webm"
    type="video/webm"
    media="(max-width: 767px)"
  />
  <source src="/videos/mushroom-hero.mp4" type="video/mp4" />
</video>
```

## Performance Checklist

- ✅ **Intersection Observer** - Only loads when visible
- ✅ **Lazy rendering** - Video element not in DOM until needed
- ✅ **Preload metadata** - Fast initial load
- ✅ **Dual formats** - WebM + MP4 for optimal compression
- ✅ **Auto-pause** - Pauses when scrolled out of view
- ✅ **Will-change optimization** - GPU acceleration only when animating
- ✅ **requestIdleCallback** - Non-blocking load initialization
- ✅ **Poster image** - Instant visual feedback
- ⬜ **CDN delivery** - Consider hosting on Vercel Blob or Cloudinary
- ⬜ **Mobile optimization** - Separate lower-res videos for mobile devices

## Testing Performance

### Lighthouse Metrics
Run Lighthouse in Chrome DevTools and target:
- **LCP (Largest Contentful Paint):** <2.5s
- **FCP (First Contentful Paint):** <1.8s
- **CLS (Cumulative Layout Shift):** <0.1
- **TBT (Total Blocking Time):** <200ms

### Network Throttling
Test with Chrome DevTools throttling:
- Fast 3G
- Slow 4G
- Ensure video doesn't block page rendering

### File Size Check
```bash
ls -lh public/videos/
```

Target sizes:
- WebM: 2-4MB
- MP4: 4-6MB
- Poster: <100KB

## Advanced Optimizations

### 1. CDN Hosting
For production, consider hosting videos on a CDN:

```tsx
// Example with Vercel Blob
<source src="https://your-blob-url.vercel-storage.com/mushroom-hero.webm" />
```

### 2. Adaptive Bitrate Streaming (HLS)
For longer videos (>30s), consider HLS:

```bash
# Generate HLS playlist
ffmpeg -i input.mp4 \
  -c:v libx264 -crf 23 -preset slow \
  -hls_time 4 -hls_playlist_type vod \
  -hls_segment_filename "segment_%03d.ts" \
  playlist.m3u8
```

### 3. Reduce Motion Preference
Respect user's motion preferences:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  // Show static poster instead
}
```

## Monitoring

### Key Metrics to Track
- Video load time
- Time to first frame
- Total download size
- Playback errors
- Buffer events

### Analytics Events
```javascript
// Track video performance
window.dataLayer.push({
  'event': 'hero_video_loaded',
  'video_load_time': performance.now(),
  'video_size': videoElement.buffered.end(0)
});
```

## Troubleshooting

### Video Not Playing
1. Check file exists: `/public/videos/mushroom-hero.mp4`
2. Verify MIME types are correct
3. Check browser console for errors
4. Test without autoplay restrictions

### Slow Loading
1. Compress video further (increase CRF value)
2. Reduce resolution to 1280x720
3. Shorten duration to 15 seconds
4. Use WebM format exclusively

### High LCP Score
1. Ensure poster image is optimized (<50KB)
2. Preload poster image in layout
3. Consider static image hero on mobile
4. Defer video load until after FCP

## Next Steps
1. Run compression commands to create WebM version
2. Generate optimized poster image
3. Test on slow 3G connection
4. Monitor Lighthouse scores
5. Consider mobile-specific version if needed
