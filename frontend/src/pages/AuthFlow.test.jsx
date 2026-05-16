import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { useAuthStore } from '../store/authStore'

vi.mock('../pages/FeedPage', () => ({
  default: () => <h1>Feed</h1>,
}))

vi.mock('../pages/ProfilePage', () => ({
  default: () => <h1>Profile</h1>,
}))

vi.mock('../pages/PostDetailPage', () => ({
  default: () => <h1>Post Detail</h1>,
}))

describe('auth state and route guards', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useAuthStore.setState({ currentUser: null, accessToken: null, refreshToken: null })
  })

  it('persists tokens and user data to localStorage', () => {
    useAuthStore.getState().setAuth({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })

    const stored = JSON.parse(window.localStorage.getItem('jangle_auth'))
    expect(stored).toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })
  })

  it('hydrates auth state from localStorage on refresh', async () => {
    window.localStorage.setItem(
      'jangle_auth',
      JSON.stringify({
        accessToken: 'persisted-access',
        refreshToken: 'persisted-refresh',
        currentUser: { username: 'persisted-user' },
      }),
    )

    vi.resetModules()
    const { useAuthStore: refreshedStore } = await import('../store/authStore')

    expect(refreshedStore.getState().accessToken).toBe('persisted-access')
    expect(refreshedStore.getState().refreshToken).toBe('persisted-refresh')
    expect(refreshedStore.getState().currentUser).toEqual({ username: 'persisted-user' })
  })

  it('blocks protected profile route for guests and redirects to login', async () => {
    render(
      <MemoryRouter initialEntries={['/profile/colin']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('redirects authenticated users away from guest-only login/register routes', async () => {
    useAuthStore.setState({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Feed' })).toBeInTheDocument()
  })

  it('clears auth state and redirects to login when logout is clicked', async () => {
    useAuthStore.setState({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })
    window.localStorage.setItem(
      'jangle_auth',
      JSON.stringify({
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        currentUser: { username: 'colin' },
      }),
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /log out/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    })

    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
    expect(useAuthStore.getState().currentUser).toBeNull()
    expect(window.localStorage.getItem('jangle_auth')).toBeNull()
  })
})
