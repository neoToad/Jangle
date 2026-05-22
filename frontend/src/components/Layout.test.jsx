import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Layout from './Layout'
import { useAuthStore } from '../store/authStore'
import { connectRoomWebSocket, fetchRoomHistory, postRoomMessage } from '../lib/chat'

vi.mock('../lib/chat', () => ({
  fetchRoomHistory: vi.fn(),
  postRoomMessage: vi.fn(),
  connectRoomWebSocket: vi.fn(),
  mergeChronologicalMessages: vi.fn((existing, incoming) => {
    const all = [...(existing || []), ...(incoming || [])]
    const uniqueById = []
    const seen = new Set()
    all.forEach((item) => {
      if (!item || seen.has(item.id)) return
      seen.add(item.id)
      uniqueById.push(item)
    })
    return uniqueById.sort((a, b) => Date.parse(a.createdAt || 0) - Date.parse(b.createdAt || 0))
  }),
}))

function renderLayout(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Feed Content</div>} />
          <Route path="/profile/:username" element={<div>Profile Route</div>} />
          <Route path="/login" element={<div>Login Route</div>} />
          <Route path="/register" element={<div>Register Route</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout shell', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, refreshToken: null, currentUser: null })
    vi.clearAllMocks()
    fetchRoomHistory.mockResolvedValue([])
    connectRoomWebSocket.mockReturnValue({ close: vi.fn() })
  })

  it('renders jangle nav with search and primary actions', () => {
    renderLayout()

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByText('jangle')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('search drops...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /shake it/i })).toHaveClass('motion-shake-hover')
    expect(screen.getByRole('button', { name: /open profile menu/i })).toBeInTheDocument()
    expect(screen.queryByText('12 Janglers online')).not.toBeInTheDocument()
  })

  it('renders centered feed and sidebar shell regions', () => {
    renderLayout()

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByTestId('feed-region')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-region')).toBeInTheDocument()
    expect(screen.getByText('Feed Content')).toBeInTheDocument()
  })

  it('applies dark theme shell token classes', () => {
    renderLayout()

    const appShell = screen.getByTestId('app-shell')
    expect(appShell).toHaveClass('bg-jangle-bg')
    expect(appShell).toHaveClass('text-jangle-textPrimary')
  })

  it('loads chat history on mount', async () => {
    fetchRoomHistory.mockResolvedValueOnce([
      { id: 1, authorEmail: 'mosswood@test.dev', text: 'loaded message', createdAt: '2026-05-22T00:00:00Z' },
    ])

    renderLayout()

    expect(await screen.findByText('loaded message')).toBeInTheDocument()
    expect(fetchRoomHistory).toHaveBeenCalledWith('the-jangle')
  })

  it('shows loading and then empty state when no history', async () => {
    renderLayout()

    expect(screen.getByText('Loading chat history...')).toBeInTheDocument()
    expect(await screen.findByText('No messages yet.')).toBeInTheDocument()
  })

  it('shows history load error state', async () => {
    fetchRoomHistory.mockRejectedValueOnce(new Error('nope'))
    renderLayout()

    expect(await screen.findByText('Could not load chat history.')).toBeInTheDocument()
  })

  it('sends a chat message with send button and clears input', async () => {
    useAuthStore.setState({
      accessToken: 'token-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })
    postRoomMessage.mockResolvedValueOnce({
      id: 2,
      authorEmail: 'you@test.dev',
      text: 'hello jangle',
      createdAt: '2026-05-22T00:00:00Z',
    })
    renderLayout()

    await screen.findByText('No messages yet.')
    const input = screen.getByRole('textbox', { name: /^chat message$/i })
    fireEvent.change(input, { target: { value: 'hello jangle' } })
    fireEvent.click(screen.getByRole('button', { name: /send chat message/i }))

    expect(await screen.findByText('hello jangle')).toBeInTheDocument()
    expect(postRoomMessage).toHaveBeenCalledWith('the-jangle', 'hello jangle')
    await waitFor(() => expect(input).toHaveValue(''))
  })

  it('sends a chat message with Enter key', async () => {
    useAuthStore.setState({
      accessToken: 'token-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })
    postRoomMessage.mockResolvedValueOnce({
      id: 3,
      authorEmail: 'you@test.dev',
      text: 'enter send',
      createdAt: '2026-05-22T00:00:00Z',
    })
    renderLayout()
    await screen.findByText('No messages yet.')

    const input = screen.getByRole('textbox', { name: /^chat message$/i })
    fireEvent.change(input, { target: { value: 'enter send' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(await screen.findByText('enter send')).toBeInTheDocument()
    await waitFor(() => expect(input).toHaveValue(''))
  })

  it('blocks guest send behavior', async () => {
    renderLayout()
    await screen.findByText('No messages yet.')

    const input = screen.getByRole('textbox', { name: /^chat message$/i })
    fireEvent.change(input, { target: { value: 'guest attempt' } })
    fireEvent.click(screen.getByRole('button', { name: /send chat message/i }))

    expect(postRoomMessage).not.toHaveBeenCalled()
    expect(screen.getAllByText('Log in to send messages.').length).toBeGreaterThan(0)
  })

  it('renders incoming websocket messages in shared chat state', async () => {
    useAuthStore.setState({
      accessToken: 'token-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })
    let onMessageHandler = null
    connectRoomWebSocket.mockImplementation(({ onMessage }) => {
      onMessageHandler = onMessage
      return { close: vi.fn() }
    })

    renderLayout()
    await screen.findByText('No messages yet.')

    onMessageHandler({
      id: 4,
      authorEmail: 'remote@test.dev',
      text: 'from websocket',
      createdAt: '2026-05-22T00:00:00Z',
    })
    expect(await screen.findAllByText('from websocket')).toHaveLength(1)
  })

  it('keeps chronological order and deduplicates optimistic plus websocket echo', async () => {
    useAuthStore.setState({
      accessToken: 'token-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })
    let onMessageHandler = null
    connectRoomWebSocket.mockImplementation(({ onMessage }) => {
      onMessageHandler = onMessage
      return { close: vi.fn() }
    })
    postRoomMessage.mockResolvedValueOnce({
      id: 20,
      authorEmail: 'you@test.dev',
      text: 'dupe me',
      createdAt: '2026-05-22T00:03:00Z',
    })

    renderLayout()
    await screen.findByText('No messages yet.')
    const input = screen.getByRole('textbox', { name: /^chat message$/i })
    fireEvent.change(input, { target: { value: 'dupe me' } })
    fireEvent.click(screen.getByRole('button', { name: /send chat message/i }))
    await screen.findByText('dupe me')

    onMessageHandler({
      id: 20,
      authorEmail: 'you@test.dev',
      text: 'dupe me',
      createdAt: '2026-05-22T00:03:00Z',
    })
    expect(screen.getAllByText('dupe me')).toHaveLength(1)
  })

  it('loads older paginated messages', async () => {
    fetchRoomHistory
      .mockResolvedValueOnce(
        Object.assign([{ id: 2, authorEmail: 'a@test.dev', text: 'newer', createdAt: '2026-05-22T00:02:00Z' }], {
          next: '/api/chat/rooms/the-jangle/messages/?page=2',
        }),
      )
      .mockResolvedValueOnce(
        Object.assign([{ id: 1, authorEmail: 'b@test.dev', text: 'older', createdAt: '2026-05-22T00:01:00Z' }], { next: null }),
      )

    renderLayout()
    expect(await screen.findByText('newer')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /load older messages/i }))
    expect(await screen.findByText('older')).toBeInTheDocument()
    expect(fetchRoomHistory).toHaveBeenNthCalledWith(2, 'the-jangle', '/api/chat/rooms/the-jangle/messages/?page=2')
  })

  it('toggles mobile chat drawer from trigger button', () => {
    renderLayout()

    const trigger = screen.getByRole('button', { name: /open the jangle chat/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('mobile-chat-drawer')).toHaveClass('translate-y-0')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('exposes labels for interactive controls and keeps minimum touch target classes', () => {
    renderLayout()

    expect(screen.getByRole('searchbox', { name: /search drops/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /shake it/i })).toHaveClass('min-h-11')
    expect(screen.getByRole('button', { name: /open profile menu/i })).toHaveClass('min-h-11')
    expect(screen.getByRole('button', { name: /open the jangle chat/i })).toHaveClass('min-h-11')
  })

  it('supports keyboard actions for mobile chat trigger and escape close', () => {
    renderLayout()

    const trigger = screen.getByRole('button', { name: /open the jangle chat/i })
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: /the jangle mobile chat/i })).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('dialog', { name: /the jangle mobile chat/i }), { key: 'Escape', code: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps mobile drawer structural classes for responsive behavior', () => {
    renderLayout()

    const drawer = screen.getByTestId('mobile-chat-drawer')
    expect(drawer).toHaveClass('fixed')
    expect(drawer).toHaveClass('inset-x-3')
    expect(drawer).toHaveClass('lg:hidden')
  })

  it('opens profile menu on click and keyboard and exposes aria semantics', async () => {
    renderLayout()

    const trigger = screen.getByRole('button', { name: /open profile menu/i })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })

    expect(await screen.findByRole('menu', { name: /profile menu/i })).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.queryByRole('menu', { name: /profile menu/i })).not.toBeInTheDocument()
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes profile menu on outside click and escape', async () => {
    renderLayout()

    const trigger = screen.getByRole('button', { name: /open profile menu/i })
    fireEvent.click(trigger)
    expect(await screen.findByRole('menu', { name: /profile menu/i })).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    await waitFor(() => {
      expect(screen.queryByRole('menu', { name: /profile menu/i })).not.toBeInTheDocument()
    })

    fireEvent.click(trigger)
    expect(await screen.findByRole('menu', { name: /profile menu/i })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('menu', { name: /profile menu/i })).not.toBeInTheDocument()
    })
  })

  it('renders guest profile menu items', async () => {
    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: /open profile menu/i }))

    expect(await screen.findByRole('menuitem', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /register/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /view profile/i })).not.toBeInTheDocument()
  })

  it('renders authenticated profile menu items and navigates to profile route', async () => {
    useAuthStore.setState({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      currentUser: { username: 'colin' },
    })

    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: /open profile menu/i }))

    expect(await screen.findByRole('menuitem', { name: /view profile/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitem', { name: /view profile/i }))

    expect(await screen.findByText('Profile Route')).toBeInTheDocument()
  })
})
