import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const navigate = useNavigate()
  const accessToken = useAuthStore((state) => state.accessToken)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const isAuthed = Boolean(accessToken)

  const onLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
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
        <nav aria-label="Primary" className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-jangle-accent">
            jangle
          </Link>
          <label className="flex w-full max-w-xs items-center gap-2 rounded-full border border-jangle-border bg-jangle-surface px-4 py-2">
            <span aria-hidden>🔍</span>
            <input
              placeholder="search drops..."
              className="w-full bg-transparent text-sm text-jangle-textPrimary outline-none placeholder:text-jangle-textMuted"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="motion-shake-hover rounded-full border border-jangle-accent/30 bg-jangle-accent/15 px-4 py-2 text-sm font-semibold text-jangle-accent"
            >
              Shake it
            </button>
            <button
              type="button"
              aria-label="Open profile menu"
              className="h-9 w-9 rounded-full border border-jangle-sage/40 bg-jangle-sage/15 text-base"
            >
              🌿
            </button>
          </div>
        </nav>
      </header>
      <main className="relative mx-auto flex w-full max-w-6xl gap-5 px-4 py-6">
        <section data-testid="feed-region" className="min-w-0 flex-1">
          <Outlet />
        </section>
        <aside data-testid="sidebar-region" className="hidden w-72 rounded-3xl border border-jangle-border bg-jangle-surface p-4 lg:block">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-jangle-textPrimary">The Jangle</h2>
            <span className="text-xs text-jangle-textMuted">offline</span>
          </div>
          {!isAuthed && (
            <div className="space-y-2 text-sm">
              <Link to="/login" className="block rounded-lg border border-jangle-border px-3 py-2 text-jangle-textMuted hover:text-jangle-textPrimary">
                Login
              </Link>
              <Link to="/register" className="block rounded-lg border border-jangle-border px-3 py-2 text-jangle-textMuted hover:text-jangle-textPrimary">
                Register
              </Link>
            </div>
          )}
          {isAuthed && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-jangle-border px-3 py-2 text-sm text-jangle-textMuted hover:text-jangle-textPrimary"
            >
              Log out
            </button>
          )}
        </aside>
      </main>
    </div>
  )
}
