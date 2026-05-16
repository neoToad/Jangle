import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RegisterPage from './RegisterPage'
import { registerUser } from '../lib/auth'

vi.mock('../lib/auth', () => ({
  registerUser: vi.fn(),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates required fields and password confirmation before submit', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/username is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/^password is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/confirm password is required/i)).toBeInTheDocument()
    expect(registerUser).not.toHaveBeenCalled()
  })

  it('blocks submit when password and confirm password do not match', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/^username$/i), {
      target: { value: 'colin' },
    })
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'colin@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'pass1234' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
    expect(registerUser).not.toHaveBeenCalled()
  })

  it('shows loading state and submits registration payload', async () => {
    let resolveRequest
    registerUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/^username$/i), {
      target: { value: 'colin' },
    })
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'colin@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'pass1234' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'pass1234' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(registerUser).toHaveBeenCalledWith({
      username: 'colin',
      email: 'colin@example.com',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    })

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()

    resolveRequest({
      data: {
        username: 'colin',
        email: 'colin@example.com',
      },
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeEnabled()
    })
  })

  it('redirects to feed on successful registration', async () => {
    registerUser.mockResolvedValue({
      data: {
        username: 'colin',
        email: 'colin@example.com',
      },
    })

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<h1>Feed</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/^username$/i), {
      target: { value: 'colin' },
    })
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'colin@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'pass1234' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'pass1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByRole('heading', { name: 'Feed' })).toBeInTheDocument()
  })

  it('renders field and non-field API errors', async () => {
    registerUser.mockRejectedValue({
      response: {
        data: {
          email: ['A user with that email already exists.'],
          non_field_errors: ['Registration failed.'],
        },
      },
    })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/^username$/i), {
      target: { value: 'colin' },
    })
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'colin@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'pass1234' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'pass1234' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/a user with that email already exists/i)).toBeInTheDocument()
    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument()
  })
})
