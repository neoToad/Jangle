import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import { useAuthStore } from '../store/authStore'
import { mapFeedPost, selectFeedItems, selectFeedNext } from '../adapters/posts'

const FEED_TABS = [
  { label: 'Following', key: 'following', feed: 'following' },
  { label: 'Explore', key: 'explore', feed: 'explore' },
  { label: 'Games', key: 'games', feed: 'games' },
]
const VALID_TAB_KEYS = new Set(FEED_TABS.map((tab) => tab.key))
const EMPTY_STATE_BY_TAB = {
  following: 'No posts from followed creators yet.',
  explore: 'No explore posts yet. Check back soon.',
  games: 'No game drops yet.',
}

const emptyForm = {
  post_type: 'text',
  title: '',
  body: '',
  youtube_url: '',
  file_type: 'image',
  file: null,
}

function CreatePostForm({ onCreated, onCancel, isAuthed }) {
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
    <form onSubmit={submit} className="space-y-3 rounded-[20px] border border-jangle-border bg-jangle-surface p-4 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
      <h2 className="font-display text-lg font-semibold text-jangle-textPrimary">Create Drop</h2>
      <select
        name="post_type"
        value={form.post_type}
        onChange={onChange}
        disabled={!isAuthed}
        className="w-full rounded-lg border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary"
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
        className="w-full rounded-lg border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary"
      />

      {form.post_type === 'text' && (
        <textarea
          name="body"
          value={form.body}
          onChange={onChange}
          placeholder="Write your post"
          rows={4}
          disabled={!isAuthed}
          className="w-full rounded-lg border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary"
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
          className="w-full rounded-lg border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary"
        />
      )}

      {form.post_type === 'file' && (
        <div className="space-y-3">
          <select
            name="file_type"
            value={form.file_type}
            onChange={onChange}
            disabled={!isAuthed}
            className="w-full rounded-lg border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary"
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
            className="w-full rounded-lg border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!isAuthed || submitting}
        className="rounded-full border border-jangle-accent/40 bg-jangle-accent px-4 py-2 text-sm font-semibold text-jangle-bg disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Create Drop'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="ml-2 rounded-full border border-jangle-border px-4 py-2 text-sm font-semibold text-jangle-textMuted hover:text-jangle-textPrimary"
      >
        Cancel
      </button>
    </form>
  )
}

export default function FeedPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthed = useMemo(() => Boolean(accessToken), [accessToken])
  const [searchParams, setSearchParams] = useSearchParams()
  const readTabFromQuery = () => {
    const tabParam = (searchParams.get('tab') || '').toLowerCase()
    return VALID_TAB_KEYS.has(tabParam) ? tabParam : 'following'
  }
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nextUrl, setNextUrl] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState(readTabFromQuery)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(false)
  const [canShowLoadMore, setCanShowLoadMore] = useState(false)
  const latestRequestRef = useRef(0)
  const effectiveTabKey = !isAuthed && activeTab === 'following' ? 'explore' : activeTab

  const loadPosts = async ({ reset, tabKey } = { reset: false, tabKey: 'following' }) => {
    const requestId = latestRequestRef.current + 1
    latestRequestRef.current = requestId
    if (reset) {
      setLoading(true)
      setError('')
      setPosts([])
      setNextUrl(null)
      setCanShowLoadMore(false)
    }
    try {
      const requestedTabKey = !isAuthed && tabKey === 'following' ? 'explore' : tabKey
      const selectedTab = FEED_TABS.find((tab) => tab.key === requestedTabKey) || FEED_TABS[0]
      const url = reset || !nextUrl ? `/api/posts/?feed=${selectedTab.feed}` : nextUrl
      const response = await api.get(url)
      if (latestRequestRef.current !== requestId) return
      const data = response.data
      const items = selectFeedItems(data)
      const next = selectFeedNext(data)
      setNextUrl(next)
      const normalizedItems = items.map(mapFeedPost)
      setPosts((prev) => (reset ? normalizedItems : [...prev, ...normalizedItems]))
    } catch {
      if (latestRequestRef.current !== requestId) return
      setError('Could not load posts.')
      if (reset) setPosts([])
    } finally {
      if (latestRequestRef.current !== requestId) return
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const queryTab = readTabFromQuery()
    if (queryTab !== activeTab) {
      setActiveTab(queryTab)
    }
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get('tab') !== activeTab) {
      setSearchParams({ tab: activeTab })
    }
    loadPosts({ reset: true, tabKey: activeTab })
  }, [activeTab])

  useEffect(() => {
    const updateBottomState = () => {
      if (!nextUrl) {
        setIsNearBottom(false)
        return
      }

      const threshold = 140
      const scrollingEl =
        document.scrollingElement || document.documentElement || document.body
      const scrollTop = Math.max(
        window.scrollY || 0,
        window.pageYOffset || 0,
        scrollingEl?.scrollTop || 0,
      )
      const viewportHeight = window.innerHeight || scrollingEl?.clientHeight || 0
      const pageBottom = scrollingEl?.scrollHeight || document.documentElement.scrollHeight || 0
      const viewportBottom = scrollTop + viewportHeight
      setIsNearBottom(viewportBottom >= pageBottom - threshold)
    }

    updateBottomState()
    window.addEventListener('scroll', updateBottomState)
    window.addEventListener('resize', updateBottomState)
    return () => {
      window.removeEventListener('scroll', updateBottomState)
      window.removeEventListener('resize', updateBottomState)
    }
  }, [nextUrl, posts.length, loading, loadingMore])

  useEffect(() => {
    if (!nextUrl) {
      setCanShowLoadMore(false)
      return
    }
    if (isNearBottom) {
      setCanShowLoadMore(true)
    }
  }, [nextUrl, isNearBottom])

  useEffect(() => {
    if (loadingMore) {
      setCanShowLoadMore(false)
    }
  }, [loadingMore])

  const onVote = async (postId, value) => {
    if (!isAuthed) return
    await api.post(`/api/interactions/posts/${postId}/votes/`, { value })
    await loadPosts({ reset: true, tabKey: activeTab })
  }

  const onReact = async (postId, emoji) => {
    if (!isAuthed) return
    await api.post(`/api/interactions/posts/${postId}/reactions/`, { emoji })
    await loadPosts({ reset: true, tabKey: activeTab })
  }

  const loadMore = async () => {
    if (!nextUrl || loadingMore) return
    setLoadingMore(true)
    await loadPosts()
  }

  return (
    <section className="space-y-4">
      <div className="mb-1 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-jangle-textMuted">Drops</p>
          <h1 className="font-display text-2xl font-semibold text-jangle-textPrimary">Latest from Janglers</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FEED_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  isActive
                    ? 'border-jangle-accent/40 bg-jangle-accent/15 text-jangle-accent'
                    : 'border-jangle-border bg-transparent text-jangle-textMuted hover:text-jangle-textPrimary'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full border border-jangle-accent/40 bg-jangle-accent px-4 py-2 text-sm font-semibold text-jangle-bg"
        >
          + Drop something
        </button>
      </div>

      {isCreateOpen && (
        <CreatePostForm
          onCreated={async () => {
            await loadPosts({ reset: true, tabKey: activeTab })
            setIsCreateOpen(false)
          }}
          onCancel={() => setIsCreateOpen(false)}
          isAuthed={isAuthed}
        />
      )}

      {!isAuthed && (
        <div className="space-y-2">
          <p className="rounded border border-jangle-accent/30 bg-jangle-accent/10 p-3 text-sm text-jangle-textMuted">
            Log in to create Drops, vote, and react.
          </p>
          {activeTab === 'following' && (
            <p className="text-xs text-jangle-textMuted">Showing Explore posts until you log in.</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-jangle-textMuted">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-jangle-textMuted">{EMPTY_STATE_BY_TAB[effectiveTabKey]}</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={onVote} onReact={onReact} isAuthed={isAuthed} />
          ))
        )}
      </div>

      {nextUrl && canShowLoadMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="rounded-full border border-jangle-border px-4 py-2 text-sm text-jangle-textMuted disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </section>
  )
}
