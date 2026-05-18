const POST_VARIANT_COLORS = {
  game: '#8faa8b',
  writing: '#c9a87c',
  youtube: '#a87c9e',
}

function mapPostBase(post) {
  const type = mapFeedPostType(post)
  return {
    id: post.id,
    type,
    author: post.author?.username || post.author_name || 'jangler',
    avatar: post.author?.avatar_emoji || '.',
    time: post.created_at ? String(post.created_at).slice(0, 10) : 'recently',
    title: post.title,
    description: post.body || post.youtube_url || 'Shared a new drop.',
    reactions: post.reaction_counts || {},
    votes: post.vote_score ?? 0,
    comments: post.comment_count ?? 0,
    color: POST_VARIANT_COLORS[type],
  }
}

export function mapFeedPostType(post) {
  if (post.post_type === 'youtube') return 'youtube'
  if (post.post_type === 'file' && post.file_type === 'game') return 'game'
  return 'writing'
}

export function mapFeedPost(post) {
  const isYouTube = post.post_type === 'youtube'
  const isGameFile = post.post_type === 'file' && post.file_type === 'game'
  const youtubeUrl = isYouTube ? post.youtube_url || null : null
  const gameFileUrl = isGameFile ? post.file || null : null

  return {
    ...mapPostBase(post),
    time: 'recently',
    mediaKind: isYouTube ? 'youtube' : isGameFile ? 'game' : null,
    mediaUrl: youtubeUrl || gameFileUrl,
    youtubeUrl,
    gameFileUrl,
    gameFileName: isGameFile ? post.file_name || null : null,
    gameFileSize: isGameFile ? post.file_size ?? null : null,
  }
}

export function mapDetailPost(post) {
  return mapPostBase(post)
}

export function selectFeedItems(data) {
  return Array.isArray(data) ? data : data?.results || []
}

export function selectFeedNext(data) {
  return Array.isArray(data) ? null : data?.next || null
}
