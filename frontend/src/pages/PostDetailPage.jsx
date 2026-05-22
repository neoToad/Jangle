import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import PostCardFrame from '../components/PostCardFrame'
import { mapDetailPost } from '../adapters/posts'

const TYPE_LABELS = {
  game: 'GAME',
  writing: 'WRITING',
  youtube: 'VIDEO',
}

function CommentItem({ comment }) {
  const postedDate = comment?.created_at ? String(comment.created_at).slice(0, 10) : 'unknown date'
  const authorName = comment?.author_username || 'unknown'

  return (
    <li className="space-y-2">
      <div className="rounded border border-jangle-border bg-jangle-surface p-3 text-jangle-textPrimary">
        <p className="mb-1 text-xs font-medium text-jangle-textMuted">
          <span className="text-jangle-textPrimary">{authorName}</span>{' '}
          <span>posted {postedDate}</span>
        </p>
        <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
      </div>
      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <ul className="space-y-2 rounded border border-jangle-border bg-jangle-bg p-2 pl-4 text-jangle-textMuted">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </ul>
      )}
    </li>
  )
}

function websocketBaseUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL
  const base = apiBase ? new URL(apiBase) : new URL(window.location.origin)
  const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${base.host}`
}

export default function PostDetailPage() {
  const { id } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthed = useMemo(() => Boolean(accessToken), [accessToken])

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentBody, setCommentBody] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [socket, setSocket] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const roomName = `post-${id}`
  const detailPost = useMemo(() => (post ? mapDetailPost(post) : null), [post])

  const loadPost = async () => {
    const response = await api.get(`/api/posts/${id}/`)
    setPost(response.data)
  }

  const loadComments = async () => {
    const response = await api.get(`/api/interactions/posts/${id}/comments/`)
    const list = Array.isArray(response.data) ? response.data : response.data.results || []
    setComments(list)
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setError('')
        setIsLoading(true)
        await Promise.all([loadPost(), loadComments()])
      } catch {
        if (active) setError('Could not load post details.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!isAuthed || !accessToken) {
      if (socket) {
        socket.close()
        setSocket(null)
      }
      return
    }

    const ws = new WebSocket(`${websocketBaseUrl()}/ws/chat/${roomName}/?token=${accessToken}`)
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        setChatMessages((prev) => [...prev, parsed])
      } catch {
        // Ignore malformed chat payloads.
      }
    }
    setSocket(ws)

    return () => ws.close()
  }, [accessToken, isAuthed, roomName])

  const submitComment = async (event) => {
    event.preventDefault()
    const body = commentBody.trim()
    if (!body || !isAuthed) return

    await api.post(`/api/interactions/posts/${id}/comments/`, { body })
    setCommentBody('')
    await loadComments()
  }

  const sendChat = (event) => {
    event.preventDefault()
    const message = chatInput.trim()
    if (!message || !socket || socket.readyState !== 1) return

    socket.send(JSON.stringify({ message }))
    setChatInput('')
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      {isLoading && <p className="text-sm text-jangle-textMuted">Loading post details...</p>}
      {error && (
        <p className="rounded border border-jangle-accent/30 bg-jangle-accent/10 p-3 text-sm text-jangle-textMuted">
          {error}
        </p>
      )}

      <PostCardFrame>
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-jangle-border bg-jangle-bg text-sm">
              {detailPost?.avatar || '.'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-jangle-textPrimary">{detailPost?.author || 'jangler'}</span>
                <span className="rounded-md border border-jangle-border bg-jangle-bg px-2 py-0.5 text-[10px] font-bold tracking-wide text-jangle-textMuted">
                  {TYPE_LABELS[detailPost?.type] || 'POST'}
                </span>
              </div>
              <p className="text-xs font-medium text-jangle-textMuted">{detailPost?.time || 'recently'}</p>
            </div>
          </div>
        </header>
        <h1 className="font-display text-2xl font-semibold text-jangle-textPrimary">{post?.title || `Post #${id}`}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-jangle-textMuted">{detailPost?.description || ''}</p>
      </PostCardFrame>

      <section className="space-y-3 rounded border border-jangle-border bg-jangle-surface p-3 sm:p-4">
        <h2 className="text-lg font-semibold text-jangle-textPrimary">Comments</h2>

        {!isAuthed && <p className="text-sm text-jangle-textMuted">Log in to comment.</p>}

        <form onSubmit={submitComment} className="space-y-2">
          <textarea
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Write a comment..."
            rows={3}
            disabled={!isAuthed}
            className="min-h-11 w-full rounded border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary placeholder:text-jangle-textMuted"
          />
          <button
            type="submit"
            disabled={!isAuthed}
            className="min-h-11 rounded border border-jangle-accent/40 bg-jangle-accent px-4 py-2 text-sm font-medium text-jangle-bg disabled:opacity-50"
          >
            Post Comment
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-sm text-jangle-textMuted">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded border border-jangle-border bg-jangle-surface p-3 sm:p-4">
        <h2 className="text-lg font-semibold text-jangle-textPrimary">Live Chat</h2>
        {!isAuthed && <p className="text-sm text-jangle-textMuted">Log in to join chat.</p>}

        <div className="max-h-72 space-y-2 overflow-y-auto rounded border border-jangle-border bg-jangle-bg p-3 text-jangle-textMuted">
          {chatMessages.length === 0 ? (
            <p className="text-sm text-jangle-textMuted">No chat messages yet.</p>
          ) : (
            chatMessages.map((message, index) => (
              <p key={`${message.author_id}-${index}`} className="text-sm text-jangle-textPrimary">
                <span className="font-semibold">User {message.author_id}:</span> {message.message}
              </p>
            ))
          )}
        </div>

        <form onSubmit={sendChat} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Type a chat message..."
            disabled={!isAuthed}
            className="min-h-11 flex-1 rounded border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary placeholder:text-jangle-textMuted"
          />
          <button
            type="submit"
            disabled={!isAuthed}
            className="min-h-11 rounded border border-jangle-accent/40 bg-jangle-accent px-4 py-2 text-sm font-medium text-jangle-bg disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </section>
    </section>
  )
}
