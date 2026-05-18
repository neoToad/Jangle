import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'

function CommentItem({ comment }) {
  return (
    <li className="space-y-2">
      <div className="rounded border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
      </div>
      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <ul className="space-y-2 pl-4">
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

  const roomName = `post-${id}`

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
        await Promise.all([loadPost(), loadComments()])
      } catch {
        if (active) setError('Could not load post details.')
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
    <section className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <article className="rounded-[20px] border border-jangle-border bg-jangle-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
        <h1 className="font-display text-2xl font-semibold text-jangle-textPrimary">{post?.title || `Post #${id}`}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-jangle-textMuted">{post?.body || ''}</p>
      </article>

      <section className="space-y-3 rounded border border-slate-300 bg-white p-4">
        <h2 className="text-lg font-semibold">Comments</h2>

        {!isAuthed && <p className="text-sm text-slate-600">Log in to comment.</p>}

        <form onSubmit={submitComment} className="space-y-2">
          <textarea
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Write a comment..."
            rows={3}
            disabled={!isAuthed}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!isAuthed}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Post Comment
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-sm text-slate-600">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded border border-slate-300 bg-white p-4">
        <h2 className="text-lg font-semibold">Live Chat</h2>
        {!isAuthed && <p className="text-sm text-slate-600">Log in to join chat.</p>}

        <div className="max-h-72 space-y-2 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-3">
          {chatMessages.length === 0 ? (
            <p className="text-sm text-slate-600">No chat messages yet.</p>
          ) : (
            chatMessages.map((message, index) => (
              <p key={`${message.author_id}-${index}`} className="text-sm text-slate-800">
                <span className="font-semibold">User {message.author_id}:</span> {message.message}
              </p>
            ))
          )}
        </div>

        <form onSubmit={sendChat} className="flex gap-2">
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Type a chat message..."
            disabled={!isAuthed}
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!isAuthed}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </section>
    </section>
  )
}
