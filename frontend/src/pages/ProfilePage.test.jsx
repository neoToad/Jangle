import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from './ProfilePage'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

function renderPage(path = '/profile/mosswood') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state before profile request resolves', async () => {
    api.get.mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(await screen.findByText('Loading profile...')).toBeInTheDocument()
  })

  it('renders profile data on success', async () => {
    api.get.mockResolvedValue({
      data: {
        username: 'mosswood',
        display_name: 'Moss Wood',
        bio: 'gardener and builder',
        avatar: 'https://example.com/avatar.png',
        post_count: 12,
        follower_count: 30,
        following_count: 9,
      },
    })

    renderPage('/profile/mosswood')

    expect(await screen.findByRole('heading', { name: 'Moss Wood' })).toBeInTheDocument()
    expect(screen.getByText('@mosswood')).toBeInTheDocument()
    expect(screen.getByText('gardener and builder')).toBeInTheDocument()
    expect(screen.getByText('Posts')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Followers')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('Following')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByAltText('mosswood avatar')).toHaveAttribute('src', 'https://example.com/avatar.png')
  })

  it('shows not-found state for 404 response', async () => {
    api.get.mockRejectedValue({ response: { status: 404 } })

    renderPage('/profile/missing-user')

    expect(await screen.findByText('Profile not found.')).toBeInTheDocument()
  })

  it('shows generic error state for non-404 failures', async () => {
    api.get.mockRejectedValue(new Error('network error'))

    renderPage('/profile/mosswood')

    expect(await screen.findByText('Could not load profile.')).toBeInTheDocument()
  })
})
