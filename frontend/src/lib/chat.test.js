import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'
import { connectRoomWebSocket, fetchRoomHistory, mergeChronologicalMessages, postRoomMessage } from './chat'

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('chat service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches room history and normalizes paginated results', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        count: 1,
        results: [{ id: 1, room: 'the-jangle', author: 2, author_email: 'a@b.c', body: 'hello', created_at: '2026-01-01T00:00:00Z' }],
      },
    })

    const history = await fetchRoomHistory('the-jangle')

    expect(api.get).toHaveBeenCalledWith('/api/chat/rooms/the-jangle/messages/')
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      id: 1,
      room: 'the-jangle',
      authorEmail: 'a@b.c',
      text: 'hello',
    })
    expect(history.next).toBeNull()
  })

  it('posts room message and normalizes payload', async () => {
    api.post.mockResolvedValueOnce({
      data: { id: 3, room: 'the-jangle', author: 10, author_email: 'me@site.test', body: 'new msg', created_at: '2026-01-01T01:00:00Z' },
    })

    const saved = await postRoomMessage('the-jangle', 'new msg')

    expect(api.post).toHaveBeenCalledWith('/api/chat/rooms/the-jangle/messages/', { body: 'new msg' })
    expect(saved).toMatchObject({
      id: 3,
      text: 'new msg',
      authorEmail: 'me@site.test',
    })
  })

  it('builds room websocket URL with token and forwards message events', () => {
    const events = []
    const socket = connectRoomWebSocket({
      room: 'the-jangle',
      accessToken: 'abc',
      onMessage: (message) => events.push(message),
      socketFactory: (url) => {
        const ws = {
          url,
          onmessage: null,
        }
        return ws
      },
      locationOrigin: 'https://example.com',
      apiBaseUrl: 'https://api.example.com',
    })

    expect(socket.url).toBe('wss://api.example.com/ws/chat/the-jangle/?token=abc')
    socket.onmessage({ data: JSON.stringify({ id: 8, body: 'ws body', author_email: 'x@y.z', room: 'the-jangle' }) })
    expect(events[0]).toMatchObject({ id: 8, text: 'ws body', authorEmail: 'x@y.z' })
  })

  it('includes next cursor from paginated history response', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        next: '/api/chat/rooms/the-jangle/messages/?page=2',
        results: [{ id: 1, room: 'the-jangle', author: 2, author_email: 'a@b.c', body: 'hello', created_at: '2026-01-01T00:00:00Z' }],
      },
    })

    const history = await fetchRoomHistory('the-jangle')
    expect(history.next).toBe('/api/chat/rooms/the-jangle/messages/?page=2')
  })

  it('deduplicates and sorts chronologically while merging messages', () => {
    const merged = mergeChronologicalMessages(
      [
        { id: 10, createdAt: '2026-05-22T00:02:00Z', text: 'later' },
        { id: 12, createdAt: '2026-05-22T00:03:00Z', text: 'latest' },
      ],
      [
        { id: 9, createdAt: '2026-05-22T00:01:00Z', text: 'early' },
        { id: 10, createdAt: '2026-05-22T00:02:00Z', text: 'duplicate' },
      ],
    )

    expect(merged.map((item) => item.id)).toEqual([9, 10, 12])
  })

  it('reconnects websocket with backoff when closed unexpectedly', () => {
    vi.useFakeTimers()
    const sockets = []
    connectRoomWebSocket({
      room: 'the-jangle',
      accessToken: 'abc',
      onMessage: () => {},
      socketFactory: (url) => {
        const ws = { url, onmessage: null, onclose: null, close: vi.fn() }
        sockets.push(ws)
        return ws
      },
      locationOrigin: 'https://example.com',
      apiBaseUrl: 'https://api.example.com',
      reconnectDelaysMs: [100, 200],
    })

    expect(sockets).toHaveLength(1)
    sockets[0].onclose?.({ code: 1006 })
    vi.advanceTimersByTime(100)
    expect(sockets).toHaveLength(2)
    vi.useRealTimers()
  })
})
