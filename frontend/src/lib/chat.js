import { api } from './api'

function normalizeMessage(message) {
  if (!message || typeof message !== 'object') return null
  return {
    id: message.id,
    room: message.room,
    authorId: message.author,
    authorEmail: message.author_email || '',
    text: message.body || '',
    createdAt: message.created_at || '',
  }
}

export async function fetchRoomHistory(room) {
  const cursorUrl = arguments.length > 1 ? arguments[1] : null
  const response = cursorUrl ? await api.get(cursorUrl) : await api.get(`/api/chat/rooms/${room}/messages/`)
  const raw = Array.isArray(response.data) ? response.data : response.data?.results || []
  const normalized = raw.map(normalizeMessage).filter(Boolean)
  normalized.next = Array.isArray(response.data) ? null : response.data?.next || null
  return normalized
}

export async function postRoomMessage(room, body) {
  const response = await api.post(`/api/chat/rooms/${room}/messages/`, { body })
  return normalizeMessage(response.data)
}

export function mergeChronologicalMessages(existing, incoming) {
  const index = new Map()
  const ordered = []
  ;[...(existing || []), ...(incoming || [])].forEach((item) => {
    if (!item || item.id == null) return
    if (index.has(item.id)) {
      const i = index.get(item.id)
      ordered[i] = item
      return
    }
    index.set(item.id, ordered.length)
    ordered.push(item)
  })
  return ordered.sort((a, b) => {
    const aTime = Date.parse(a.createdAt || 0) || 0
    const bTime = Date.parse(b.createdAt || 0) || 0
    if (aTime !== bTime) return aTime - bTime
    return (a.id || 0) - (b.id || 0)
  })
}

export function connectRoomWebSocket({
  room,
  accessToken = '',
  onMessage,
  socketFactory = (url) => new WebSocket(url),
  locationOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL,
  reconnectDelaysMs = [500, 1000, 2000],
}) {
  const base = apiBaseUrl ? new URL(apiBaseUrl) : new URL(locationOrigin)
  const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:'
  const tokenQuery = accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''
  const url = `${protocol}//${base.host}/ws/chat/${room}/${tokenQuery}`
  let socket = null
  let manualClose = false
  let reconnectAttempt = 0

  const connect = () => {
    socket = socketFactory(url)
    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        const normalized = normalizeMessage(parsed)
        if (normalized && normalized.text && onMessage) {
          onMessage(normalized)
        }
      } catch {
        // Ignore malformed payloads from socket.
      }
    }
    socket.onclose = (event) => {
      if (manualClose || event?.code === 1000) return
      const delay = reconnectDelaysMs[Math.min(reconnectAttempt, reconnectDelaysMs.length - 1)]
      reconnectAttempt += 1
      setTimeout(connect, delay)
    }
  }
  connect()

  if (socket) {
    const baseClose = socket.close?.bind(socket)
    socket.close = (...args) => {
      manualClose = true
      if (baseClose) baseClose(...args)
    }
  }

  return socket
}
