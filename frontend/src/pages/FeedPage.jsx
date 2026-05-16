import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'

const EMOJIS = ['👍', '🔥', '😂', '😮', '❤️']

const FEED_TABS = ['Following', 'Explore', 'Games']

const emptyForm = {
  post_type: 'text',
  title: '',
  body: '',
  youtube_url: '',
  file_type: 'image',
  file: null,
}

function buildMediaUrl(filePath) {
  if (!filePath) return null
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin
  return new URL(filePath, base).toString()
}

function youtubeEmbedUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`
    }
    if (parsed.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}`
    }
  } catch {
    return null
  }
  return null
}

function PostCard({ post, onVote, onReact, isAuthed }) {
  const fileUrl = buildMediaUrl(post.file)
  const embedUrl = youtubeEmbedUrl(post.youtube_url)
  const reactionCounts = post.reaction_counts || {}

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          <Link className="hover:underline" to={`/post/${post.id}`}>
            {post.title}
          </Link>
        </h2>
        <span className="text-xs uppercase tracking-wide text-slate-500">{post.post_type}</span>
      </header>

      {post.post_type === 'text' && (
        <p className="max-h-24 overflow-hidden whitespace-pre-wrap text-sm text-slate-700">{post.body || ''}</p>
      )}

      {post.post_type === 'youtube' && (
        <div className="space-y-2">
          {embedUrl ? (
            <iframe
              title={`youtube-${post.id}`}
              src={embedUrl}
              className="h-64 w-full rounded"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <a className="text-sm text-blue-600 underline" href={post.youtube_url} target="_blank" rel="noreferrer">
              Open YouTube link
            </a>
          )}
        </div>
      )}

      {post.post_type === 'file' && (
        <div className="space-y-2">
          {post.file_type === 'image' && fileUrl ? (
            <img src={fileUrl} alt={post.title} className="max-h-96 w-full rounded object-contain" />
          ) : null}
          {post.file_type === 'game' && fileUrl ? (
            <div className="flex gap-3 text-sm">
              <a className="text-blue-600 underline" href={fileUrl} target="_blank" rel="noreferrer">
                Play / Open
              </a>
              <a className="text-blue-600 underline" href={fileUrl} download>
                Download
              </a>
            </div>
          ) : null}
          {post.file_type !== 'image' && post.file_type !== 'game' && fileUrl ? (
            <a className="text-blue-600 underline" href={fileUrl} target="_blank" rel="noreferrer">
              Download file
            </a>
          ) : null}
        </div>
      )}

      <footer className="mt-4 space-y-3 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onVote(post.id, 1)}
            disabled={!isAuthed}
            className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
          >
            Upvote
          </button>
          <button
            type="button"
            onClick={() => onVote(post.id, -1)}
            disabled={!isAuthed}
            className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
          >
            Downvote
          </button>
          <span className="text-sm text-slate-700">Score: {post.vote_score ?? 0}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(post.id, emoji)}
              disabled={!isAuthed}
              className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
            >
              {emoji} {reactionCounts[emoji] || 0}
            </button>
          ))}
        </div>
      </footer>
    </article>
  )
}

function CreatePostForm({ onCreated, isAuthed }) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (event) => {
    const { name, value, files } = event.target
    if (name === 'file') {
      setForm((prev) => ({ ...prev, file: files?.[0] || null }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!isAuthed || submitting) return
    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('post_type', form.post_type)
      payload.append('title', form.title)
      if (form.post_type === 'text') payload.append('body', form.body)
      if (form.post_type === 'youtube') payload.append('youtube_url', form.youtube_url)
      if (form.post_type === 'file') {
        payload.append('file_type', form.file_type)
        if (form.file) payload.append('file', form.file)
      }

      await api.post('/api/posts/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm(emptyForm)
      onCreated()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Create Post</h2>
      <select
        name="post_type"
        value={form.post_type}
        onChange={onChange}
        disabled={!isAuthed}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="text">Text</option>
        <option value="youtube">YouTube</option>
        <option value="file">File</option>
      </select>

      <input
        name="title"
        value={form.title}
        onChange={onChange}
        placeholder="Title"
        required
        disabled={!isAuthed}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />

      {form.post_type === 'text' && (
        <textarea
          name="body"
          value={form.body}
          onChange={onChange}
          placeholder="Write your post"
          rows={4}
          disabled={!isAuthed}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      )}

      {form.post_type === 'youtube' && (
        <input
          name="youtube_url"
          value={form.youtube_url}
          onChange={onChange}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          disabled={!isAuthed}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      )}

      {form.post_type === 'file' && (
        <div className="space-y-3">
          <select
            name="file_type"
            value={form.file_type}
            onChange={onChange}
            disabled={!isAuthed}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="image">Image</option>
            <option value="game">Game</option>
            <option value="other">Other</option>
          </select>
          <input
            name="file"
            type="file"
            onChange={onChange}
            required
            disabled={!isAuthed}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!isAuthed || submitting}
        className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Create Post'}
      </button>
    </form>
  )
}

export default function FeedPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthed = useMemo(() => Boolean(accessToken), [accessToken])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nextUrl, setNextUrl] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState('Following')

  const loadPosts = async ({ reset } = { reset: false }) => {
    if (reset) {
      setLoading(true)
      setError('')
    }
    try {
      const url = reset || !nextUrl ? '/api/posts/' : nextUrl
      const response = await api.get(url)
      const data = response.data
      const items = Array.isArray(data) ? data : data.results || []
      const next = Array.isArray(data) ? null : data.next
      setNextUrl(next)
      setPosts((prev) => (reset ? items : [...prev, ...items]))
    } catch {
      setError('Could not load posts.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadPosts({ reset: true })
  }, [])

  const onVote = async (postId, value) => {
    if (!isAuthed) return
    await api.post(`/api/interactions/posts/${postId}/votes/`, { value })
    await loadPosts({ reset: true })
  }

  const onReact = async (postId, emoji) => {
    if (!isAuthed) return
    await api.post(`/api/interactions/posts/${postId}/reactions/`, { emoji })
    await loadPosts({ reset: true })
  }

  const loadMore = async () => {
    if (!nextUrl || loadingMore) return
    setLoadingMore(true)
    await loadPosts()
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FEED_TABS.map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  isActive
                    ? 'border-jangle-accent/40 bg-jangle-accent/15 text-jangle-accent'
                    : 'border-jangle-border bg-transparent text-jangle-textMuted hover:text-jangle-textPrimary'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="rounded-full border border-jangle-accent/40 bg-jangle-accent px-4 py-2 text-sm font-semibold text-jangle-bg"
        >
          + Drop something
        </button>
      </div>

      <CreatePostForm onCreated={() => loadPosts({ reset: true })} isAuthed={isAuthed} />

      {!isAuthed && (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Log in to create posts, vote, and react.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-sm text-slate-600">Loading posts...</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={onVote} onReact={onReact} isAuthed={isAuthed} />
          ))
        )}
      </div>

      {nextUrl && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </section>
  )
}
