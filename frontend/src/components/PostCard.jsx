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

const REACTION_FALLBACK = ['👍', '🔥', '😂', '😮', '❤️']

export default function PostCard({ post, onVote, onReact, isAuthed }) {
  const [hovered, setHovered] = useState(false)
  const reactions = post.reactions || {}
  const reactionEntries = Object.keys(reactions).length > 0 ? Object.entries(reactions) : REACTION_FALLBACK.map((emoji) => [emoji, 0])

  return (
    <article
      data-testid={`post-card-${post.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`rounded-[20px] border bg-jangle-surface p-5 transition-all ${
        hovered
          ? 'border-jangle-tint shadow-[0_0_28px_var(--post-color-glow),0_6px_22px_rgba(0,0,0,0.35)]'
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
            <p className="text-xs text-jangle-textMuted">{post.time || 'recently'}</p>
          </div>
        </div>
      </header>

      <div className="mb-4 space-y-2">
        <h2 className="font-display text-xl font-semibold text-jangle-textPrimary">
          <Link to={`/post/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        <p className="text-sm leading-relaxed text-jangle-textMuted">{post.description}</p>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-jangle-border pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {reactionEntries.map(([emoji, count]) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(post.id, emoji)}
              disabled={!isAuthed}
              className="rounded-full border border-jangle-border bg-jangle-bg px-2.5 py-1 text-xs text-jangle-textPrimary disabled:opacity-50"
            >
              {emoji} {count}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-jangle-textMuted">💬 {post.comments ?? 0}</span>
          <button
            type="button"
            onClick={() => onVote(post.id, 1)}
            disabled={!isAuthed}
            className="rounded-full border border-jangle-border px-2.5 py-1 text-xs text-jangle-textMuted disabled:opacity-50"
          >
            Upvote
          </button>
          <span className="text-sm text-jangle-textPrimary">{post.votes ?? 0}</span>
          <button
            type="button"
            onClick={() => onVote(post.id, -1)}
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
