const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'])

function parseHttpUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null

  let parsed
  try {
    parsed = new URL(rawUrl, window.location.origin)
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
  return parsed
}

function normalizeYouTubeVideoId(pathname, searchParams, hostname) {
  if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
    return pathname.split('/').filter(Boolean)[0] || null
  }

  if (pathname === '/watch') {
    return searchParams.get('v') || null
  }

  if (pathname.startsWith('/embed/')) {
    return pathname.split('/').filter(Boolean)[1] || null
  }

  return null
}

export function getSafeYouTubeEmbed(rawUrl) {
  const parsed = parseHttpUrl(rawUrl)
  if (!parsed) return null

  const hostname = parsed.hostname.toLowerCase()
  if (!YOUTUBE_HOSTS.has(hostname)) return null

  const videoId = normalizeYouTubeVideoId(parsed.pathname, parsed.searchParams, hostname)
  if (!videoId || !/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return null

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  }
}

export function getSafeGameMedia(rawUrl) {
  const parsed = parseHttpUrl(rawUrl)
  if (!parsed) return null

  const isSameOrigin = parsed.origin === window.location.origin
  const normalizedUrl = parsed.origin === window.location.origin ? `${parsed.pathname}${parsed.search}${parsed.hash}` || '/' : parsed.toString()

  return {
    mode: isSameOrigin ? 'inline' : 'new-tab',
    url: normalizedUrl,
  }
}
