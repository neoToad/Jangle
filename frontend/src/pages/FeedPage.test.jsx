import { render, screen } from '@testing-library/react'
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
})
