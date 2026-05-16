import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
    expect(screen.getByText(/✦ WRITING/)).toBeInTheDocument()
    expect(screen.getByText(/◈ VIDEO/)).toBeInTheDocument()
    expect(screen.getByText(/▶ GAME/)).toBeInTheDocument()
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
})
