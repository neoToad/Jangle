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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl gap-4 p-4 text-sm font-medium">
          <Link to="/">Feed</Link>
          {!isAuthed && <Link to="/login">Login</Link>}
          {!isAuthed && <Link to="/register">Register</Link>}
          {isAuthed && (
            <button type="button" onClick={onLogout} className="rounded border border-slate-300 px-2 py-1">
              Log out
            </button>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  )
}
