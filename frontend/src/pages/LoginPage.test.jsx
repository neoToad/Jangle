import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'
import { loginUser } from '../lib/auth'
import { useAuthStore } from '../store/authStore'

vi.mock('../lib/auth', () => ({
  loginUser: vi.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ currentUser: null, accessToken: null, refreshToken: null })
  })

  it('validates required fields before submit', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/email or username is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('shows loading state and submits credentials', async () => {
    let resolveRequest
    loginUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/email or username/i), {
      target: { value: 'colin' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'pass1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(loginUser).toHaveBeenCalledWith({
      username: 'colin',
      password: 'pass1234',
    })

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()

    resolveRequest({
      data: {
        access: 'access-token',
        refresh: 'refresh-token',
      },
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).toBeEnabled()
    })
  })

  it('redirects to feed on successful login', async () => {
    loginUser.mockResolvedValue({
      data: {
        access: 'access-token',
        refresh: 'refresh-token',
      },
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Feed</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/email or username/i), {
      target: { value: 'colin' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'pass1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByRole('heading', { name: 'Feed' })).toBeInTheDocument()
  })

  it('renders API error messages for failed login', async () => {
    loginUser.mockRejectedValue({
      response: {
        data: {
          username: ['No account found for this username.'],
          non_field_errors: ['Unable to log in with provided credentials.'],
        },
      },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/email or username/i), {
      target: { value: 'missing' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/no account found for this username/i)).toBeInTheDocument()
    expect(await screen.findByText(/unable to log in with provided credentials/i)).toBeInTheDocument()
  })
})
