/**
 * Extract YouTube video ID from various URL formats.
 */
export function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get platform gradient CSS for placeholder thumbnails.
 */
export function getPlatformGradient(platformKey) {
  const gradients = {
    instagram: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af)",
    linkedin: "linear-gradient(135deg, #0077b5, #0a66c2)",
    tiktok: "linear-gradient(135deg, #25f4ee, #171717, #fe2c55)",
    youtube: "linear-gradient(135deg, #ff2222, #cc0000)",
    social: "linear-gradient(135deg, #526380, #3d5066)",
  };
  return gradients[platformKey] || gradients.social;
}

/**
 * Get platform emoji/icon for placeholder fallback.
 */
export function getPlatformIcon(platformKey) {
  const icons = {
    instagram: "📸",
    linkedin: "💼",
    tiktok: "🎵",
    youtube: "▶️",
    social: "📱",
  };
  return icons[platformKey] || icons.social;
}

/**
 * Extract Instagram shortcode from various URL formats.
 */
export function extractInstagramShortcode(url) {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:p|reel|reels)\/([^/?&#]+)/);
  return match ? match[1] : null;
}

/**
 * Try to construct a direct Instagram media URL.
 * Instagram redirects /p/SHORTCODE/media/?size=l to their CDN.
 * Works when used as an <img src> — browser follows the 302 redirect.
 */
export function getInstagramMediaUrl(postUrl) {
  const shortcode = extractInstagramShortcode(postUrl);
  if (!shortcode) return null;
  return `https://www.instagram.com/p/${shortcode}/media/?size=l`;
}

/**
 * Best-effort thumbnail URL extraction.
 * Returns a URL string, or null if no thumbnail can be determined.
 *
 * Priority:
 *  1. item.thumbnail from CMS/fallback
 *  2. YouTube video ID → img.youtube.com
 *  3. Instagram shortcode → direct media redirect
 *  4. null → component will show gradient placeholder
 */
export function resolveThumbnailUrl(item, platformKey) {
  // 1. If the item already has a thumbnail from CMS or fallback data
  if (item.thumbnail) {
    return item.thumbnail;
  }

  // 2. YouTube — predictable thumbnail URL
  if (platformKey === "youtube") {
    const videoId = extractYouTubeId(item.postUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  // 3. Instagram — try direct media URL (browser follows 302 → CDN)
  if (platformKey === "instagram") {
    return getInstagramMediaUrl(item.postUrl);
  }

  // 4. No thumbnail available
  return null;
}

/**
 * Attempt to fetch oEmbed thumbnail for Instagram/TikTok posts.
 * NOTE: This is a client-side fetch and may fail due to CORS.
 * The caller should handle failures gracefully.
 */
export async function fetchOembedThumbnail(postUrl, platformKey) {
  if (!postUrl) return null;

  try {
    let apiUrl;
    if (platformKey === "instagram") {
      apiUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(postUrl)}`;
    } else if (platformKey === "tiktok") {
      apiUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl)}`;
    } else {
      return null;
    }

    const res = await fetch(apiUrl);
    if (!res.ok) return null;

    const data = await res.json();
    return data?.thumbnail_url || data?.thumbnail || null;
  } catch {
    // CORS or network error — silently fail
    return null;
  }
}