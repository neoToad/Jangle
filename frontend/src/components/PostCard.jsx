import { Link } from 'react-router-dom'
import { useState } from 'react'
import PostCardFrame from './PostCardFrame'
import { getSafeGameMedia, getSafeYouTubeEmbed } from '../utils/media'

const TYPE_LABELS = {
  game: 'GAME',
  writing: 'WRITING',
  youtube: 'VIDEO',
}

const TYPE_ICONS = {
  game: '▶',
  writing: '✦',
  youtube: '◈',
}

const REACTION_OPTIONS = [
  { id: 'thumbs-up', symbol: '👍' },
  { id: 'fire', symbol: '🔥' },
  { id: 'laugh', symbol: '😂' },
  { id: 'wow', symbol: '😮' },
  { id: 'heart', symbol: '❤️' },
]
const EMBED_SANDBOX = 'allow-scripts allow-same-origin allow-presentation allow-popups'
const EMBED_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'

export default function PostCard({ post, onVote, onReact, isAuthed }) {
  const [hovered, setHovered] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [reactions, setReactions] = useState(post.reactions || {})
  const [voteValue, setVoteValue] = useState(0)
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false)
  const [isGameOpen, setIsGameOpen] = useState(false)
  const [isYouTubeLoading, setIsYouTubeLoading] = useState(false)
  const [isYouTubeError, setIsYouTubeError] = useState(false)
  const [isGameLoading, setIsGameLoading] = useState(false)
  const [isGameError, setIsGameError] = useState(false)

  const reactionEntries = Object.entries(reactions).filter(([, count]) => count > 0)
  const displayedScore = (post.votes ?? 0) + voteValue
  const safeYouTube =
    post.type === 'youtube' ? getSafeYouTubeEmbed(post.youtubeUrl || post.mediaUrl) : null
  const safeGame = post.type === 'game' ? getSafeGameMedia(post.gameFileUrl || post.mediaUrl) : null

  const toggleVote = (value) => {
    if (!isAuthed) return
    const nextValue = voteValue === value ? 0 : value
    setVoteValue(nextValue)
    onVote(post.id, nextValue)
  }

  const addReaction = (emoji) => {
    if (!isAuthed) return
    setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }))
    setShowPicker(false)
    onReact(post.id, emoji)
  }

  const toggleYouTube = () => {
    if (isYouTubeOpen) {
      setIsYouTubeOpen(false)
      setIsYouTubeLoading(false)
      setIsYouTubeError(false)
      return
    }
    setIsYouTubeLoading(true)
    setIsYouTubeError(false)
    setIsYouTubeOpen(true)
  }

  const toggleGameInline = () => {
    if (!safeGame) return
    if (isGameOpen) {
      setIsGameOpen(false)
      setIsGameLoading(false)
      setIsGameError(false)
      return
    }
    setIsGameLoading(true)
    setIsGameError(false)
    setIsGameOpen(true)
  }

  return (
    <PostCardFrame
      data-testid={`post-card-${post.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`motion-card-enter motion-card-hover ${
        hovered ? 'shadow-[0_0_28px_var(--post-color-glow),0_6px_22px_rgba(0,0,0,0.35)]' : ''
      }`}
      style={{
        '--post-color': post.color || '#c9a87c',
        '--post-color-glow': `${post.color || '#c9a87c'}33`,
        borderColor: hovered ? `${post.color || '#c9a87c'}88` : undefined,
      }}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-jangle-border bg-jangle-bg text-sm">
            {post.avatar || '.'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-jangle-textPrimary">{post.author || 'unknown'}</span>
              <span className="rounded-md border border-jangle-border bg-jangle-bg px-2 py-0.5 text-[10px] font-bold tracking-wide text-jangle-textMuted">
                {TYPE_ICONS[post.type] || '.'} {TYPE_LABELS[post.type] || 'POST'}
              </span>
            </div>
            <p className="text-xs font-medium text-jangle-textMuted">{post.time || 'recently'}</p>
          </div>
        </div>
      </header>

      <div className="mb-4 space-y-2.5">
        <h2 className="font-display text-xl font-semibold text-jangle-textPrimary">
          <Link to={`/post/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        <p className="text-sm leading-relaxed text-jangle-textMuted/95">{post.description}</p>
      </div>

      {post.type === 'game' && (
        <>
          <div
            className="mb-4 flex items-center justify-between rounded-xl border px-4 py-3"
            style={{
              backgroundColor: `${post.color || '#8faa8b'}1a`,
              borderColor: `${post.color || '#8faa8b'}66`,
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold" style={{ color: post.color || '#8faa8b' }}>
                  Playable in browser
                </p>
                {post.playing && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-400/50 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-300">
                    <span
                      data-testid={`live-dot-${post.id}`}
                      className="motion-pulse-dot h-1.5 w-1.5 rounded-full bg-red-300"
                    />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-jangle-textMuted">{post.playCount ?? 0} people played</p>
              {!safeGame && <p className="text-xs text-jangle-textMuted">Game file unavailable.</p>}
              {safeGame?.mode === 'new-tab' && (
                <p className="text-xs text-jangle-textMuted">Launches in a new tab.</p>
              )}
            </div>
            {safeGame?.mode === 'new-tab' ? (
              <a
                href={safeGame.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-jangle-bg"
                style={{ backgroundColor: post.color || '#8faa8b' }}
              >
                Play Now
              </a>
            ) : (
              <button
                type="button"
                onClick={toggleGameInline}
                disabled={!safeGame}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-jangle-bg disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: post.color || '#8faa8b' }}
              >
                Play Now
              </button>
            )}
          </div>
          {safeGame?.mode === 'inline' && isGameOpen && (
            <div className="mb-4 overflow-hidden rounded-xl border border-jangle-border">
              {isGameLoading && (
                <p className="border-b border-jangle-border bg-jangle-bg px-3 py-2 text-xs text-jangle-textMuted">
                  Opening game...
                </p>
              )}
              {isGameError && (
                <div className="border-b border-jangle-border bg-jangle-bg px-3 py-2 text-xs text-jangle-textMuted">
                  <span>Game failed to load. Try opening in a new tab. </span>
                  <a
                    href={safeGame.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-jangle-textPrimary underline"
                  >
                    Open game in new tab
                  </a>
                </div>
              )}
              <div className="border-b border-jangle-border bg-jangle-bg px-3 py-2 text-xs text-jangle-textMuted">
                <span>If it fails, open in a new tab. </span>
                <a
                  href={safeGame.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-jangle-textPrimary underline"
                >
                  Open game in new tab
                </a>
              </div>
              <iframe
                title="Game player"
                src={safeGame.url}
                className="h-72 w-full"
                sandbox={EMBED_SANDBOX}
                allow={EMBED_ALLOW}
                onLoad={() => setIsGameLoading(false)}
                onError={() => {
                  setIsGameLoading(false)
                  setIsGameError(true)
                }}
              />
            </div>
          )}
        </>
      )}

      {post.type === 'youtube' && (
        <>
          <div
            className="mb-4 rounded-xl border px-4 py-3"
            style={{
              backgroundColor: `${post.color || '#a87c9e'}1a`,
              borderColor: `${post.color || '#a87c9e'}66`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm"
                style={{
                  backgroundColor: `${post.color || '#a87c9e'}33`,
                  color: post.color || '#a87c9e',
                }}
              >
                ?
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: post.color || '#a87c9e' }}>
                  YouTube embed
                </p>
                {safeYouTube ? (
                  <button
                    type="button"
                    onClick={toggleYouTube}
                    aria-expanded={isYouTubeOpen}
                    className="text-xs text-jangle-textMuted underline"
                    aria-label="Toggle YouTube player"
                  >
                    Click to watch inline
                  </button>
                ) : (
                  <p className="text-xs text-jangle-textMuted">Unable to embed this YouTube link.</p>
                )}
                {safeYouTube && <p className="text-xs text-jangle-textMuted">Inline playback in card.</p>}
              </div>
            </div>
            {!safeYouTube && (
              <div className="mt-2">
                <a
                  href={post.youtubeUrl || post.mediaUrl || 'https://www.youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-jangle-textPrimary underline"
                >
                  Open on YouTube
                </a>
              </div>
            )}
          </div>
          {safeYouTube && isYouTubeOpen && (
            <div className="mb-4 overflow-hidden rounded-xl border border-jangle-border">
              {isYouTubeLoading && (
                <p className="border-b border-jangle-border bg-jangle-bg px-3 py-2 text-xs text-jangle-textMuted">
                  Loading video...
                </p>
              )}
              {isYouTubeError && (
                <div className="border-b border-jangle-border bg-jangle-bg px-3 py-2 text-xs text-jangle-textMuted">
                  <span>Video failed to load. Open on YouTube. </span>
                  <a
                    href={post.youtubeUrl || post.mediaUrl || 'https://www.youtube.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-jangle-textPrimary underline"
                  >
                    Open on YouTube
                  </a>
                </div>
              )}
              <div className="border-b border-jangle-border bg-jangle-bg px-3 py-2 text-xs text-jangle-textMuted">
                <span>If it fails, open on YouTube. </span>
                <a
                  href={post.youtubeUrl || post.mediaUrl || 'https://www.youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-jangle-textPrimary underline"
                >
                  Open on YouTube
                </a>
              </div>
              <iframe
                title="YouTube player"
                src={safeYouTube.embedUrl}
                className="h-72 w-full"
                sandbox={EMBED_SANDBOX}
                allow={EMBED_ALLOW}
                allowFullScreen
                onLoad={() => setIsYouTubeLoading(false)}
                onError={() => {
                  setIsYouTubeLoading(false)
                  setIsYouTubeError(true)
                }}
              />
            </div>
          )}
        </>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-jangle-border pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {reactionEntries.map(([emoji, count]) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addReaction(emoji)}
              disabled={!isAuthed}
              className="rounded-full border border-jangle-border bg-jangle-bg px-2.5 py-1 text-xs text-jangle-textPrimary disabled:opacity-50"
            >
              {emoji} {count}
            </button>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPicker((prev) => !prev)}
              disabled={!isAuthed}
              className="rounded-full border border-jangle-border bg-jangle-bg px-2.5 py-1 text-xs text-jangle-textPrimary disabled:opacity-50"
            >
              + React
            </button>
            {showPicker && (
              <div
                role="menu"
                aria-label="Emoji picker"
                className="absolute bottom-10 left-0 z-10 flex gap-1 rounded-lg border border-jangle-border bg-jangle-surface p-2 shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
              >
                {REACTION_OPTIONS.map((reaction) => (
                  <button
                    key={reaction.id}
                    type="button"
                    onClick={() => addReaction(reaction.symbol)}
                    className="rounded-md border border-jangle-border bg-jangle-bg px-2 py-1 text-sm"
                  >
                    {reaction.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-jangle-border px-2.5 py-1 text-xs text-jangle-textMuted"
          >
            Comments {post.comments ?? 0}
          </button>
          <button
            type="button"
            onClick={() => toggleVote(1)}
            disabled={!isAuthed}
            className="rounded-full border border-jangle-border px-2.5 py-1 text-xs text-jangle-textMuted disabled:opacity-50"
          >
            Upvote
          </button>
          <span className="text-sm text-jangle-textPrimary">{displayedScore}</span>
          <button
            type="button"
            onClick={() => toggleVote(-1)}
            disabled={!isAuthed}
            className="rounded-full border border-jangle-border px-2.5 py-1 text-xs text-jangle-textMuted disabled:opacity-50"
          >
            Downvote
          </button>
        </div>
      </footer>
    </PostCardFrame>
  )
}
