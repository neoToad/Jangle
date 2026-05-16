import { Link } from 'react-router-dom'
import { useState } from 'react'

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

const REACTION_OPTIONS = ['👍', '🔥', '😂', '😮', '❤️']

export default function PostCard({ post, onVote, onReact, isAuthed }) {
  const [hovered, setHovered] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [reactions, setReactions] = useState(post.reactions || {})
  const [voteValue, setVoteValue] = useState(0)
  const reactionEntries = Object.entries(reactions).filter(([, count]) => count > 0)
  const displayedScore = (post.votes ?? 0) + voteValue

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

  return (
    <article
      data-testid={`post-card-${post.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`motion-card-enter motion-card-hover rounded-[20px] border bg-jangle-surface p-5 ${
        hovered
          ? 'shadow-[0_0_28px_var(--post-color-glow),0_6px_22px_rgba(0,0,0,0.35)]'
          : 'border-jangle-border shadow-[0_2px_12px_rgba(0,0,0,0.2)]'
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
            {post.avatar || '•'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-jangle-textPrimary">{post.author || 'unknown'}</span>
              <span className="rounded-md border border-jangle-border bg-jangle-bg px-2 py-0.5 text-[10px] font-bold tracking-wide text-jangle-textMuted">
                {TYPE_ICONS[post.type] || '•'} {TYPE_LABELS[post.type] || 'POST'}
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
                  <span data-testid={`live-dot-${post.id}`} className="motion-pulse-dot h-1.5 w-1.5 rounded-full bg-red-300" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-jangle-textMuted">{post.playCount ?? 0} people played</p>
          </div>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-jangle-bg"
            style={{ backgroundColor: post.color || '#8faa8b' }}
          >
            Play Now
          </button>
        </div>
      )}

      {post.type === 'youtube' && (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{
            backgroundColor: `${post.color || '#a87c9e'}1a`,
            borderColor: `${post.color || '#a87c9e'}66`,
          }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm"
            style={{ backgroundColor: `${post.color || '#a87c9e'}33`, color: post.color || '#a87c9e' }}
          >
            ▶
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: post.color || '#a87c9e' }}>
              YouTube embed
            </p>
            <p className="text-xs text-jangle-textMuted">Click to watch inline</p>
          </div>
        </div>
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
                {REACTION_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addReaction(emoji)}
                    className="rounded-md border border-jangle-border bg-jangle-bg px-2 py-1 text-sm"
                  >
                    {emoji}
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
    </article>
  )
}
