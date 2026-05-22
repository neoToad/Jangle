import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { connectRoomWebSocket, fetchRoomHistory, mergeChronologicalMessages, postRoomMessage } from '../lib/chat'

function ChatPanel({ messages, draft, onDraftChange, onSend, isAuthed, onLogout, isLoading, error, notice, nextHistoryUrl, onLoadOlder }) {
  const hasMessages = messages.length > 0
  return (
    <div className="flex h-full flex-col rounded-[20px] border border-jangle-border bg-jangle-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-jangle-textPrimary">The Jangle</h2>
        <div className="flex items-center gap-2 text-xs text-jangle-textMuted">
          <span className="h-2 w-2 rounded-full bg-jangle-sage motion-safe:animate-pulse" />
          <span>Live chat</span>
        </div>
      </div>

      <div className="mb-3 flex-1 space-y-3 overflow-y-auto pr-1" aria-label="Chat messages">
        {isLoading && <p className="text-sm text-jangle-textMuted">Loading chat history...</p>}
        {!isLoading && error && <p className="text-sm text-jangle-textMuted">{error}</p>}
        {!isLoading && !error && !hasMessages && <p className="text-sm text-jangle-textMuted">No messages yet.</p>}
        {messages.map((message) => (
          <article key={message.id} className="rounded-2xl border border-jangle-border/70 bg-jangle-bg/70 p-2.5">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-jangle-textPrimary">{message.authorEmail || 'jangler'}</span>
              <time className="text-jangle-textMuted">{message.createdAt ? String(message.createdAt).slice(0, 16).replace('T', ' ') : 'now'}</time>
            </div>
            <p className="text-sm text-jangle-textPrimary">{message.text}</p>
          </article>
        ))}
        {!isLoading && nextHistoryUrl ? (
          <button
            type="button"
            onClick={onLoadOlder}
            className="min-h-11 rounded-full border border-jangle-border px-3 py-2 text-xs text-jangle-textMuted transition hover:text-jangle-textPrimary"
          >
            Load older messages
          </button>
        ) : null}
      </div>

      <form onSubmit={onSend} className="mt-auto space-y-2">
        <div className="flex items-center gap-2">
          <input
            aria-label="Chat message"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSend()
              }
            }}
            placeholder="Say something..."
            className="min-h-11 w-full rounded-full border border-jangle-border bg-jangle-bg px-3 py-2 text-sm text-jangle-textPrimary placeholder:text-jangle-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80"
          />
          <button
            type="submit"
            className="min-h-11 rounded-full border border-jangle-accent/40 bg-jangle-accent px-4 py-2 text-xs font-semibold text-jangle-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80"
            aria-label="Send chat message"
          >
            Send
          </button>
        </div>
        {isAuthed ? (
          <button
            type="button"
            onClick={onLogout}
            className="min-h-11 rounded-full px-3 text-xs text-jangle-textMuted transition hover:text-jangle-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80"
          >
            Log out
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-jangle-textMuted">Log in to send messages.</p>
            <div className="flex gap-2 text-xs">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-jangle-textMuted transition hover:text-jangle-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80"
            >
              Login
            </Link>
            <span className="text-jangle-textMuted" aria-hidden>
              .
            </span>
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-jangle-textMuted transition hover:text-jangle-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80"
            >
              Register
            </Link>
            </div>
          </div>
        )}
        {notice ? <p className="text-xs text-jangle-textMuted">{notice}</p> : null}
      </form>
    </div>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const accessToken = useAuthStore((state) => state.accessToken)
  const currentUser = useAuthStore((state) => state.currentUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const isAuthed = Boolean(accessToken)
  const [messages, setMessages] = useState([])
  const [draftMessage, setDraftMessage] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(true)
  const [nextHistoryUrl, setNextHistoryUrl] = useState(null)
  const [chatError, setChatError] = useState('')
  const [chatNotice, setChatNotice] = useState('')
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    let active = true
    const loadHistory = async () => {
      try {
        setChatError('')
        setIsChatLoading(true)
        const history = await fetchRoomHistory('the-jangle')
        if (active) {
          setMessages(mergeChronologicalMessages([], history))
          setNextHistoryUrl(history.next || null)
        }
      } catch {
        if (active) setChatError('Could not load chat history.')
      } finally {
        if (active) setIsChatLoading(false)
      }
    }
    loadHistory()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const socket = connectRoomWebSocket({
      room: 'the-jangle',
      accessToken: accessToken || '',
      onMessage: (incoming) => {
        setMessages((prev) => mergeChronologicalMessages(prev, [incoming]))
      },
    })
    return () => socket?.close?.()
  }, [accessToken])

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined

    const handlePointerDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isProfileMenuOpen])

  const onLogout = () => {
    clearAuth()
    setIsProfileMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const onSendMessage = (event) => {
    event?.preventDefault?.()
    const trimmed = draftMessage.trim()
    if (!trimmed) return
    if (!isAuthed) {
      setChatNotice('Log in to send messages.')
      return
    }
    setChatNotice('')
    postRoomMessage('the-jangle', trimmed)
      .then((saved) => {
        setMessages((prev) => mergeChronologicalMessages(prev, [saved]))
        setDraftMessage('')
      })
      .catch(() => {
        setChatNotice('Could not send message.')
      })
  }

  const onLoadOlderMessages = async () => {
    if (!nextHistoryUrl) return
    try {
      const older = await fetchRoomHistory('the-jangle', nextHistoryUrl)
      setMessages((prev) => mergeChronologicalMessages(prev, older))
      setNextHistoryUrl(older.next || null)
    } catch {
      setChatNotice('Could not load older messages.')
    }
  }

  return (
    <div
      data-testid="app-shell"
      className="min-h-screen bg-jangle-bg text-jangle-textPrimary"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(201,168,124,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(143,170,139,0.06) 0%, transparent 60%)',
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
        }}
      />
      <header className="sticky top-0 z-20 border-b border-jangle-border bg-jangle-bg/90 backdrop-blur">
        <nav aria-label="Primary" className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:flex-nowrap sm:gap-4">
          <Link
            to="/"
            className="rounded-md font-display text-2xl font-bold tracking-tight text-jangle-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80"
          >
            jangle
          </Link>
          <label htmlFor="global-search" className="order-3 flex w-full items-center gap-2 rounded-full border border-jangle-border bg-jangle-surface px-4 py-2 sm:order-none sm:max-w-xs">
            <span aria-hidden>o</span>
            <input
              id="global-search"
              type="search"
              aria-label="Search drops"
              placeholder="search drops..."
              className="min-h-11 w-full bg-transparent text-sm text-jangle-textPrimary outline-none placeholder:text-jangle-textMuted focus-visible:outline-none"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="motion-shake-hover min-h-11 rounded-full border border-jangle-accent/30 bg-jangle-accent/15 px-4 py-2 text-sm font-semibold text-jangle-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80"
            >
              Shake it
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setIsProfileMenuOpen((prev) => !prev)
                  }
                }}
                className="min-h-11 min-w-11 rounded-full border border-jangle-sage/40 bg-jangle-sage/15 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80"
              >
                o
              </button>
              {isProfileMenuOpen && (
                <div
                  role="menu"
                  aria-label="Profile menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-44 rounded-2xl border border-jangle-border bg-jangle-surface p-1.5 shadow-xl"
                >
                  {isAuthed ? (
                    <>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          const username = currentUser?.username || 'me'
                          setIsProfileMenuOpen(false)
                          navigate(`/profile/${username}`)
                        }}
                        className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-jangle-textPrimary transition hover:bg-jangle-bg"
                      >
                        View profile
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-jangle-textPrimary transition hover:bg-jangle-bg"
                      >
                        Settings
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={onLogout}
                        className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-jangle-textPrimary transition hover:bg-jangle-bg"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        role="menuitem"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex min-h-11 w-full items-center rounded-xl px-3 text-sm text-jangle-textPrimary transition hover:bg-jangle-bg"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        role="menuitem"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex min-h-11 w-full items-center rounded-xl px-3 text-sm text-jangle-textPrimary transition hover:bg-jangle-bg"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="relative mx-auto flex w-full max-w-6xl gap-5 px-4 py-6">
        <section data-testid="feed-region" className="min-w-0 flex-1">
          <Outlet />
        </section>
        <aside data-testid="sidebar-region" className="sticky top-20 hidden h-[calc(100vh-7rem)] w-80 self-start lg:block">
          <ChatPanel
            messages={messages}
            draft={draftMessage}
            onDraftChange={setDraftMessage}
            onSend={onSendMessage}
            isAuthed={isAuthed}
            onLogout={onLogout}
            isLoading={isChatLoading}
            error={chatError}
            notice={chatNotice}
            nextHistoryUrl={nextHistoryUrl}
            onLoadOlder={onLoadOlderMessages}
          />
        </aside>
      </main>

      <button
        type="button"
        aria-label="Open The Jangle chat"
        aria-expanded={isMobileChatOpen}
        aria-controls="mobile-chat-drawer"
        onClick={() => setIsMobileChatOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setIsMobileChatOpen((prev) => !prev)
          }
        }}
        className="fixed bottom-4 right-4 z-30 min-h-11 rounded-full border border-jangle-accent/40 bg-jangle-accent px-4 py-2 text-sm font-semibold text-jangle-bg shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jangle-accent/80 lg:hidden"
      >
        The Jangle
      </button>

      <div
        id="mobile-chat-drawer"
        data-testid="mobile-chat-drawer"
        role="dialog"
        aria-label="The Jangle mobile chat"
        aria-modal="false"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsMobileChatOpen(false)
          }
        }}
        className={`fixed inset-x-3 bottom-3 z-30 max-h-[70vh] rounded-[20px] bg-jangle-surface transition duration-300 lg:hidden ${
          isMobileChatOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        {isMobileChatOpen && (
          <div className="h-[65vh]">
            <ChatPanel
              messages={messages}
              draft={draftMessage}
              onDraftChange={setDraftMessage}
              onSend={onSendMessage}
              isAuthed={isAuthed}
              onLogout={onLogout}
              isLoading={isChatLoading}
              error={chatError}
              notice={chatNotice}
              nextHistoryUrl={nextHistoryUrl}
              onLoadOlder={onLoadOlderMessages}
            />
          </div>
        )}
      </div>
    </div>
  )
}
