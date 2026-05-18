import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import PostDetailPage from './PostDetailPage'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

class MockWebSocket {
  static instances = []

  constructor(url) {
    this.url = url
    this.readyState = 1
    this.sent = []
    this.onopen = null
    this.onclose = null
    this.onmessage = null
    MockWebSocket.instances.push(this)
  }

  send(payload) {
    this.sent.push(payload)
  }

  close() {
    this.readyState = 3
    if (this.onclose) this.onclose()
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/post/42']}>
      <Routes>
        <Route path="/post/:id" element={<PostDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockWebSocket.instances = []
    vi.stubGlobal('WebSocket', MockWebSocket)
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
    })

    api.get.mockImplementation((url) => {
      if (url === '/api/posts/42/') {
        return Promise.resolve({
          data: {
            id: 42,
            post_type: 'text',
            title: 'Post title',
            body: 'Full post body',
            created_at: '2026-05-01T12:34:56Z',
            author: {
              username: 'mosswood',
              avatar_emoji: 'A',
            },
            reaction_counts: {},
            vote_score: 0,
          },
        })
      }

      if (url === '/api/interactions/posts/42/comments/') {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 1,
                body: 'Parent comment',
                author: 2,
                replies: [{ id: 2, body: 'Nested reply', author: 3, replies: [] }],
              },
            ],
          },
        })
      }

      return Promise.reject(new Error(`Unhandled GET ${url}`))
    })
  })

  it('renders full post content and nested comment replies', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Post title' })).toBeInTheDocument()
    expect(screen.getByText('Full post body')).toBeInTheDocument()
    expect(screen.getByText(/A/)).toBeInTheDocument()
    expect(screen.getByText(/mosswood/)).toBeInTheDocument()
    expect(screen.getByText(/WRITING/)).toBeInTheDocument()
    expect(screen.getByText('2026-05-01')).toBeInTheDocument()
    expect(await screen.findByText('Parent comment')).toBeInTheDocument()
    expect(await screen.findByText('Nested reply')).toBeInTheDocument()
  })

  it('allows authenticated user to submit a comment and refresh list', async () => {
    useAuthStore.setState({ accessToken: 'abc123' })
    api.post.mockResolvedValue({ data: { id: 7, body: 'My new comment' } })

    renderPage()

    const input = await screen.findByPlaceholderText('Write a comment...')
    fireEvent.change(input, { target: { value: 'My new comment' } })
    fireEvent.click(screen.getByRole('button', { name: 'Post Comment' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/interactions/posts/42/comments/', {
        body: 'My new comment',
      })
    })
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/interactions/posts/42/comments/')
    })
  })

  it('opens websocket for authenticated users and sends messages', async () => {
    useAuthStore.setState({ accessToken: 'token-1' })
    renderPage()

    await screen.findByRole('heading', { name: 'Post title' })

    expect(MockWebSocket.instances).toHaveLength(1)
    const ws = MockWebSocket.instances[0]
    expect(ws.url).toContain('/ws/chat/post-42/?token=token-1')

    fireEvent.change(screen.getByPlaceholderText('Type a chat message...'), {
      target: { value: 'Hello room' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(ws.sent).toContain(JSON.stringify({ message: 'Hello room' }))

    ws.onmessage({ data: JSON.stringify({ message: 'Incoming', author_id: 99, room: 'post-42' }) })
    expect(await screen.findByText(/Incoming/)).toBeInTheDocument()
  })

  it('uses Jangle token classes for the primary post card shell', async () => {
    renderPage()

    const heading = await screen.findByRole('heading', { name: 'Post title' })
    const postContainer = heading.closest('article')

    expect(postContainer).toHaveClass('bg-jangle-surface')
    expect(postContainer).toHaveClass('border-jangle-border')
    expect(postContainer.className).toMatch(/\brounded/)
  })

  it('uses Jangle theme classes on comments and chat sections', async () => {
    renderPage()

    const commentsHeading = await screen.findByRole('heading', { name: 'Comments' })
    const chatHeading = await screen.findByRole('heading', { name: 'Live Chat' })
    const commentsSection = commentsHeading.closest('section')
    const chatSection = chatHeading.closest('section')

    expect(commentsSection).toHaveClass('bg-jangle-surface')
    expect(commentsSection).toHaveClass('border-jangle-border')
    expect(chatSection).toHaveClass('bg-jangle-surface')
    expect(chatSection).toHaveClass('border-jangle-border')
  })

  it('uses Jangle token classes for comment cards and nested reply wrappers', async () => {
    renderPage()

    const parentComment = await screen.findByText('Parent comment')
    const nestedReply = await screen.findByText('Nested reply')
    const parentCard = parentComment.closest('div')
    const nestedCard = nestedReply.closest('div')
    const nestedRepliesList = nestedCard.closest('li')?.parentElement

    expect(parentCard).toHaveClass('bg-jangle-surface')
    expect(parentCard).toHaveClass('border-jangle-border')
    expect(parentCard).toHaveClass('text-jangle-textPrimary')
    expect(nestedCard).toHaveClass('bg-jangle-surface')
    expect(nestedCard).toHaveClass('border-jangle-border')
    expect(nestedCard).toHaveClass('text-jangle-textPrimary')
    expect(nestedRepliesList).toHaveClass('bg-jangle-bg')
    expect(nestedRepliesList).toHaveClass('border-jangle-border')
    expect(nestedRepliesList).toHaveClass('text-jangle-textMuted')
  })

  it('uses sidebar-consistent Jangle token classes for live chat card and controls', async () => {
    useAuthStore.setState({ accessToken: 'token-1' })
    renderPage()

    const chatHeading = await screen.findByRole('heading', { name: 'Live Chat' })
    const chatSection = chatHeading.closest('section')
    const chatInput = screen.getByPlaceholderText('Type a chat message...')
    const sendButton = screen.getByRole('button', { name: 'Send' })
    const chatList = screen.getByText('No chat messages yet.').closest('div')

    expect(chatSection).toHaveClass('bg-jangle-surface')
    expect(chatSection).toHaveClass('border-jangle-border')
    expect(chatList).toHaveClass('bg-jangle-bg')
    expect(chatList).toHaveClass('border-jangle-border')
    expect(chatList).toHaveClass('text-jangle-textMuted')
    expect(chatInput).toHaveClass('border-jangle-border')
    expect(chatInput).toHaveClass('bg-jangle-bg')
    expect(chatInput).toHaveClass('text-jangle-textPrimary')
    expect(sendButton).toHaveClass('border-jangle-accent/40')
    expect(sendButton).toHaveClass('bg-jangle-accent')
    expect(sendButton).toHaveClass('text-jangle-bg')
  })

  it('matches feed typography direction for key post content', async () => {
    renderPage()

    const title = await screen.findByRole('heading', { name: 'Post title' })
    const body = screen.getByText('Full post body')

    expect(title).toHaveClass('font-display')
    expect(title).toHaveClass('text-jangle-textPrimary')
    expect(body).toHaveClass('text-jangle-textMuted')
  })

  it('does not regress to legacy white and slate container classes', async () => {
    renderPage()

    const topHeading = await screen.findByRole('heading', { name: 'Post title' })
    const commentsHeading = await screen.findByRole('heading', { name: 'Comments' })
    const chatHeading = await screen.findByRole('heading', { name: 'Live Chat' })
    const containers = [
      topHeading.closest('article'),
      commentsHeading.closest('section'),
      chatHeading.closest('section'),
    ]

    containers.forEach((container) => {
      expect(container).not.toHaveClass('bg-white')
      expect(container.className).not.toMatch(/\bborder-slate-\S+/)
    })
  })

  it('uses token-consistent loading and error states', async () => {
    let resolvePost
    let resolveComments
    api.get.mockImplementation((url) => {
      if (url === '/api/posts/42/') {
        return new Promise((resolve) => {
          resolvePost = resolve
        })
      }
      if (url === '/api/interactions/posts/42/comments/') {
        return new Promise((resolve) => {
          resolveComments = resolve
        })
      }
      return Promise.reject(new Error(`Unhandled GET ${url}`))
    })

    renderPage()
    const loading = await screen.findByText('Loading post details...')
    expect(loading).toHaveClass('text-jangle-textMuted')

    resolvePost({
      data: {
        id: 42,
        post_type: 'text',
        title: 'Post title',
        body: 'Full post body',
        created_at: '2026-05-01T12:34:56Z',
        author: { username: 'mosswood', avatar_emoji: 'A' },
        reaction_counts: {},
        vote_score: 0,
      },
    })
    resolveComments({ data: { results: [] } })
    await screen.findByRole('heading', { name: 'Post title' })

    api.get.mockRejectedValueOnce(new Error('boom'))
    renderPage()
    const error = await screen.findByText('Could not load post details.')
    expect(error).toHaveClass('border-jangle-accent/30')
    expect(error).toHaveClass('bg-jangle-accent/10')
    expect(error).toHaveClass('text-jangle-textMuted')
  })

  it('uses token styling for empty states and mobile-safe sizing on controls', async () => {
    useAuthStore.setState({ accessToken: 'token-1' })
    api.get.mockImplementation((url) => {
      if (url === '/api/posts/42/') {
        return Promise.resolve({
          data: {
            id: 42,
            post_type: 'text',
            title: 'Post title',
            body: 'Full post body',
            created_at: '2026-05-01T12:34:56Z',
            author: { username: 'mosswood', avatar_emoji: 'A' },
            reaction_counts: {},
            vote_score: 0,
          },
        })
      }
      if (url === '/api/interactions/posts/42/comments/') {
        return Promise.resolve({ data: { results: [] } })
      }
      return Promise.reject(new Error(`Unhandled GET ${url}`))
    })

    renderPage()

    const emptyComments = await screen.findByText('No comments yet.')
    const emptyChat = await screen.findByText('No chat messages yet.')
    const commentInput = screen.getByPlaceholderText('Write a comment...')
    const commentButton = screen.getByRole('button', { name: 'Post Comment' })
    const chatInput = screen.getByPlaceholderText('Type a chat message...')
    const chatButton = screen.getByRole('button', { name: 'Send' })

    expect(emptyComments).toHaveClass('text-jangle-textMuted')
    expect(emptyChat).toHaveClass('text-jangle-textMuted')
    expect(commentInput).toHaveClass('min-h-11')
    expect(commentButton).toHaveClass('min-h-11')
    expect(chatInput).toHaveClass('min-h-11')
    expect(chatButton).toHaveClass('min-h-11')
  })
})
