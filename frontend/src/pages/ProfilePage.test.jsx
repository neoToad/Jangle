import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from './ProfilePage'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
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
    useAuthStore.setState({ accessToken: null, refreshToken: null, currentUser: null })
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
        is_following: false,
      },
    })

    renderPage('/profile/mosswood')

    expect(await screen.findByRole('heading', { name: 'Moss Wood' })).toBeInTheDocument()
    expect(screen.getByText('@mosswood')).toBeInTheDocument()
    expect(screen.getByText('gardener and builder')).toBeInTheDocument()
    expect(screen.getAllByText('Posts').length).toBeGreaterThan(0)
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

  it('supports profile tabs between posts and likes panels', async () => {
    api.get.mockResolvedValue({
      data: {
        username: 'mosswood',
        display_name: 'Moss Wood',
        bio: 'gardener and builder',
        avatar: 'https://example.com/avatar.png',
        post_count: 12,
        follower_count: 30,
        following_count: 9,
        is_following: false,
      },
    })

    renderPage('/profile/mosswood')

    expect(await screen.findByRole('button', { name: 'Posts' })).toBeInTheDocument()
    expect(screen.getByText('Recent posts will appear here.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Likes' }))
    expect(screen.getByText('Liked posts will appear here.')).toBeInTheDocument()
  })

  it('allows editing own profile bio and saves via api', async () => {
    useAuthStore.setState({ accessToken: 'token', currentUser: { username: 'mosswood' } })
    api.get.mockResolvedValue({
      data: {
        username: 'mosswood',
        display_name: 'Moss Wood',
        bio: 'gardener and builder',
        avatar: 'https://example.com/avatar.png',
        post_count: 12,
        follower_count: 30,
        following_count: 9,
        is_following: false,
      },
    })
    api.patch.mockResolvedValue({ data: { bio: 'updated bio' } })

    renderPage('/profile/mosswood')

    expect(await screen.findByRole('button', { name: 'Edit profile' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))

    const bioInput = screen.getByLabelText('Bio')
    fireEvent.change(bioInput, { target: { value: 'updated bio' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/api/users/me/update/', { bio: 'updated bio' })
    })
    expect(await screen.findByText('updated bio')).toBeInTheDocument()
  })

  it('allows following and unfollowing another profile', async () => {
    useAuthStore.setState({ accessToken: 'token', currentUser: { username: 'viewer' } })
    api.get.mockResolvedValue({
      data: {
        username: 'mosswood',
        display_name: 'Moss Wood',
        bio: 'gardener and builder',
        avatar: 'https://example.com/avatar.png',
        post_count: 12,
        follower_count: 30,
        following_count: 9,
        is_following: false,
      },
    })
    api.post.mockResolvedValue({ data: { is_following: true } })
    api.delete.mockResolvedValue({ data: { is_following: false } })

    renderPage('/profile/mosswood')

    const followButton = await screen.findByRole('button', { name: 'Follow' })
    fireEvent.click(followButton)
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/profiles/mosswood/follow/')
    })

    const unfollowButton = await screen.findByRole('button', { name: 'Unfollow' })
    fireEvent.click(unfollowButton)
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/profiles/mosswood/follow/')
    })
  })
})
