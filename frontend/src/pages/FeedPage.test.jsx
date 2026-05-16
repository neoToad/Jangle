import { fireEvent, render, screen } from '@testing-library/react'
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

    expect(screen.getByRole('button', { name: 'Following' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explore' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Games' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Drop something' })).toBeInTheDocument()
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
})
