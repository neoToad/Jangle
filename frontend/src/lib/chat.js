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
  const response = await api.get(`/api/chat/rooms/${room}/messages/`)
  const raw = Array.isArray(response.data) ? response.data : response.data?.results || []
  return raw.map(normalizeMessage).filter(Boolean)
}

export async function postRoomMessage(room, body) {
  const response = await api.post(`/api/chat/rooms/${room}/messages/`, { body })
  return normalizeMessage(response.data)
}

export function connectRoomWebSocket({
  room,
  accessToken = '',
  onMessage,
  socketFactory = (url) => new WebSocket(url),
  locationOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL,
}) {
  const base = apiBaseUrl ? new URL(apiBaseUrl) : new URL(locationOrigin)
  const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:'
  const tokenQuery = accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''
  const socket = socketFactory(`${protocol}//${base.host}/ws/chat/${room}/${tokenQuery}`)

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

  return socket
}
