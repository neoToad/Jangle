import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeedPage from './FeedPage'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('FeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ accessToken: null, refreshToken: null, currentUser: null })
  })

  it('renders post title as link to post detail page', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 42,
            post_type: 'text',
            title: 'Clickable Post',
            body: 'Body',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: null,
      },
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    const postLink = await screen.findByRole('link', { name: 'Clickable Post' })
    expect(postLink).toHaveAttribute('href', '/post/42')
  })

  it('renders feed header tabs and drop call-to-action', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 42,
            post_type: 'text',
            title: 'Clickable Post',
            body: 'Body',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: null,
      },
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByRole('link', { name: 'Clickable Post' })

    expect(screen.getByText('Drops')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Latest from Janglers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Following' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explore' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Games' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Drop something' })).toBeInTheDocument()
  })

  it('keeps create drop form hidden by default', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 42,
            post_type: 'text',
            title: 'Clickable Post',
            body: 'Body',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: null,
      },
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByRole('link', { name: 'Clickable Post' })

    expect(screen.queryByRole('heading', { name: 'Create Drop' })).not.toBeInTheDocument()
  })

  it('opens and closes create drop form when drop button is clicked', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 42,
            post_type: 'text',
            title: 'Clickable Post',
            body: 'Body',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: null,
      },
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByRole('link', { name: 'Clickable Post' })

    const dropButton = screen.getByRole('button', { name: '+ Drop something' })
    fireEvent.click(dropButton)
    expect(screen.getByRole('heading', { name: 'Create Drop' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('heading', { name: 'Create Drop' })).not.toBeInTheDocument()
  })

  it('uses Following as default active tab and switches active style on click', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 42,
            post_type: 'text',
            title: 'Clickable Post',
            body: 'Body',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: null,
      },
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByRole('link', { name: 'Clickable Post' })

    const followingTab = screen.getByRole('button', { name: 'Following' })
    const exploreTab = screen.getByRole('button', { name: 'Explore' })

    expect(followingTab).toHaveClass('bg-jangle-accent/15')
    expect(exploreTab).not.toHaveClass('bg-jangle-accent/15')

    fireEvent.click(exploreTab)

    expect(exploreTab).toHaveClass('bg-jangle-accent/15')
    expect(followingTab).not.toHaveClass('bg-jangle-accent/15')
  })

  it('shows loading state before feed data resolves', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Loading posts...')).toBeInTheDocument()
  })

  it('renders backend posts mapped to existing UI variants', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            post_type: 'text',
            title: 'Writing Post',
            body: 'Words',
            reaction_counts: {},
            vote_score: 0,
          },
          {
            id: 2,
            post_type: 'youtube',
            title: 'Video Post',
            youtube_url: 'https://youtube.com/watch?v=abc',
            reaction_counts: {},
            vote_score: 0,
          },
          {
            id: 3,
            post_type: 'file',
            file_type: 'game',
            title: 'Game Post',
            body: '',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: null,
      },
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'Writing Post' })).toBeInTheDocument()
    expect(screen.getByText(/\bWRITING\b/)).toBeInTheDocument()
    expect(screen.getByText(/\bVIDEO\b/)).toBeInTheDocument()
    expect(screen.getByText(/\bGAME\b/)).toBeInTheDocument()
    expect(screen.getByText('YouTube embed')).toBeInTheDocument()
    expect(screen.getByText('Playable in browser')).toBeInTheDocument()
  })

  it('shows error state and does not fall back to seeded posts when feed request fails', async () => {
    api.get.mockRejectedValue(new Error('network down'))

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Could not load posts.')).toBeInTheDocument()
    expect(screen.queryByText('Tiny Garden Sim')).not.toBeInTheDocument()
  })

  it('does not use an internal feed scroll container', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 42,
            post_type: 'text',
            title: 'Scrollable Post',
            body: 'Body',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: null,
      },
    })

    const { container } = render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByRole('link', { name: 'Scrollable Post' })

    const internalScrollContainer = container.querySelector('.max-h-\\[65vh\\].overflow-y-auto')
    expect(internalScrollContainer).not.toBeInTheDocument()
  })

  it('shows load more only after user reaches page bottom', async () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 600,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
      writable: true,
    })

    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 42,
            post_type: 'text',
            title: 'Paginated Post',
            body: 'Body',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: '/api/posts/?page=2',
      },
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByRole('link', { name: 'Paginated Post' })
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()

    Object.defineProperty(window, 'scrollY', {
      value: 1410,
      configurable: true,
      writable: true,
    })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
    })
  })

  it('keeps load more visible after it appears even if page height increases', async () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 600,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
      writable: true,
    })

    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 42,
            post_type: 'text',
            title: 'Sticky Load More Post',
            body: 'Body',
            reaction_counts: {},
            vote_score: 0,
          },
        ],
        next: '/api/posts/?page=2',
      },
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByRole('link', { name: 'Sticky Load More Post' })

    Object.defineProperty(window, 'scrollY', {
      value: 1410,
      configurable: true,
      writable: true,
    })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
    })

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2140,
      configurable: true,
      writable: true,
    })
    fireEvent.scroll(window)

    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
  })

  it('maps media fields and keeps vote/react/comment controls functional', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 11,
            post_type: 'youtube',
            title: 'Guide Video',
            youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            reaction_counts: { '🔥': 1 },
            vote_score: 4,
            comment_count: 3,
          },
          {
            id: 12,
            post_type: 'file',
            file_type: 'game',
            title: 'Runner',
            file: '/games/runner/index.html',
            reaction_counts: {},
            vote_score: 0,
            comment_count: 2,
          },
        ],
        next: null,
      },
    })
    api.post.mockResolvedValue({ data: {} })

    useAuthStore.setState({ accessToken: 'token', refreshToken: 'refresh', currentUser: { id: 1 } })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'Guide Video' })).toBeInTheDocument()
    expect(screen.getByText('Click to watch inline')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Now' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Toggle YouTube player' }))
    expect(screen.getByTitle('YouTube player')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: '+ React' })[0])
    const emojiPicker = screen.getByRole('menu', { name: 'Emoji picker' })
    const emojiButtons = emojiPicker.querySelectorAll('button')
    fireEvent.click(emojiButtons[0])
    expect(api.post).toHaveBeenCalledWith(
      '/api/interactions/posts/11/reactions/',
      expect.objectContaining({ emoji: expect.any(String) }),
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Upvote' })[0])
    expect(api.post).toHaveBeenCalledWith('/api/interactions/posts/11/votes/', { value: 1 })

    expect(screen.getByRole('button', { name: 'Comments 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comments 2' })).toBeInTheDocument()
  })

  it('keeps media action states stable after load more rerender', async () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 600,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'scrollY', {
      value: 1410,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
      writable: true,
    })

    api.get
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              id: 21,
              post_type: 'youtube',
              title: 'First Video',
              youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              reaction_counts: {},
              vote_score: 0,
            },
          ],
          next: '/api/posts/?page=2',
        },
      })
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              id: 22,
              post_type: 'file',
              file_type: 'game',
              title: 'Second Game',
              file: '/games/second/index.html',
              reaction_counts: {},
              vote_score: 0,
            },
          ],
          next: null,
        },
      })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'First Video' })).toBeInTheDocument()
    fireEvent.scroll(window)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(await screen.findByRole('link', { name: 'Second Game' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Toggle YouTube player' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Now' })).toBeEnabled()
    expect(screen.getAllByRole('button', { name: 'Comments 0' })).toHaveLength(2)
  })

  it('fetches following feed by default for authenticated users and updates URL query when switching tabs', async () => {
    api.get.mockResolvedValue({
      data: { results: [], next: null },
    })
    useAuthStore.setState({ accessToken: 'token', refreshToken: 'refresh', currentUser: { id: 1 } })

    window.history.pushState({}, '', '/')

    render(
      <BrowserRouter>
        <FeedPage />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/posts/?feed=following')
    })
    expect(window.location.search).toBe('?tab=following')

    fireEvent.click(screen.getByRole('button', { name: 'Explore' }))

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/posts/?feed=explore')
    })
    expect(window.location.search).toBe('?tab=explore')
  })

  it('uses explore feed as guest fallback when following tab is active', async () => {
    api.get.mockResolvedValue({ data: { results: [], next: null } })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/posts/?feed=explore')
    })
    expect(screen.getByText('Showing Explore posts until you log in.')).toBeInTheDocument()
  })

  it('resets pagination and replaces list when switching tabs', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          results: [{ id: 101, post_type: 'text', title: 'Following one', body: 'body', reaction_counts: {}, vote_score: 0 }],
          next: '/api/posts/?feed=following&page=2',
        },
      })
      .mockResolvedValueOnce({
        data: {
          results: [{ id: 102, post_type: 'text', title: 'Following two', body: 'body', reaction_counts: {}, vote_score: 0 }],
          next: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          results: [{ id: 201, post_type: 'text', title: 'Explore one', body: 'body', reaction_counts: {}, vote_score: 0 }],
          next: null,
        },
      })

    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true, writable: true })
    Object.defineProperty(window, 'scrollY', { value: 1410, configurable: true, writable: true })
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true, writable: true })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'Following one' })).toBeInTheDocument()
    fireEvent.scroll(window)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(await screen.findByRole('link', { name: 'Following two' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Explore' }))
    expect(await screen.findByRole('link', { name: 'Explore one' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Following one' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Following two' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('syncs active tab from URL and responds to browser back/forward', async () => {
    api.get.mockResolvedValue({ data: { results: [], next: null } })
    window.history.pushState({}, '', '/?tab=games')

    render(
      <BrowserRouter>
        <FeedPage />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/posts/?feed=games')
    })
    expect(screen.getByRole('button', { name: 'Games' })).toHaveClass('bg-jangle-accent/15')

    fireEvent.click(screen.getByRole('button', { name: 'Following' }))
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/posts/?feed=following')
    })

    window.history.back()
    window.dispatchEvent(new PopStateEvent('popstate'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Games' })).toHaveClass('bg-jangle-accent/15')
    })
  })

  it('shows tab-specific empty-state copy', async () => {
    api.get.mockResolvedValue({ data: { results: [], next: null } })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('No posts from followed creators yet.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Explore' }))
    expect(await screen.findByText('No explore posts yet. Check back soon.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Games' }))
    expect(await screen.findByText('No game drops yet.')).toBeInTheDocument()
  })

  it('ignores stale response from previous tab after rapid tab switch', async () => {
    let resolveFollowing
    const followingPromise = new Promise((resolve) => {
      resolveFollowing = resolve
    })

    api.get
      .mockReturnValueOnce(followingPromise)
      .mockResolvedValueOnce({
        data: {
          results: [
            { id: 301, post_type: 'text', title: 'Explore fresh', body: 'body', reaction_counts: {}, vote_score: 0 },
          ],
          next: null,
        },
      })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Explore' }))
    expect(await screen.findByRole('link', { name: 'Explore fresh' })).toBeInTheDocument()

    resolveFollowing({
      data: {
        results: [
          { id: 302, post_type: 'text', title: 'Following stale', body: 'body', reaction_counts: {}, vote_score: 0 },
        ],
        next: null,
      },
    })

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Following stale' })).not.toBeInTheDocument()
    })
  })

  it('load more on games tab continues using games pagination parameters', async () => {
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true, writable: true })
    Object.defineProperty(window, 'scrollY', { value: 1410, configurable: true, writable: true })
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true, writable: true })

    api.get
      .mockResolvedValueOnce({ data: { results: [], next: null } })
      .mockResolvedValueOnce({
        data: {
          results: [{ id: 401, post_type: 'file', file_type: 'game', title: 'Game one', reaction_counts: {}, vote_score: 0 }],
          next: '/api/posts/?feed=games&page=2',
        },
      })
      .mockResolvedValueOnce({
        data: {
          results: [{ id: 402, post_type: 'file', file_type: 'game', title: 'Game two', reaction_counts: {}, vote_score: 0 }],
          next: null,
        },
      })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Games' }))
    expect(await screen.findByRole('link', { name: 'Game one' })).toBeInTheDocument()

    fireEvent.scroll(window)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))

    expect(await screen.findByRole('link', { name: 'Game two' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/api/posts/?feed=games&page=2')
  })
})
