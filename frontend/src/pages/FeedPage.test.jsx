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
  })

  it('renders post title as link to post detail page', async () => {
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    const postLink = await screen.findByRole('link', { name: 'Clickable Post' })
    expect(postLink).toHaveAttribute('href', '/post/42')
  })

  it('renders feed header tabs and drop call-to-action', async () => {
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
})
