import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../lib/auth'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [nonFieldErrors, setNonFieldErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = {}
    if (!email.trim()) nextErrors.email = ['Email is required.']
    if (!password) nextErrors.password = ['Password is required.']
    setErrors(nextErrors)
    setNonFieldErrors([])
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const response = await loginUser({ email: email.trim(), password })
      setAuth({
        accessToken: response.data?.access ?? null,
        refreshToken: response.data?.refresh ?? null,
      })
      navigate('/', { replace: true })
    } catch (error) {
      const data = error?.response?.data || {}
      const nonFieldErrors = data.non_field_errors || (data.detail ? [data.detail] : [])
      setErrors({
        email: data.email || [],
        password: data.password || [],
      })
      setNonFieldErrors(nonFieldErrors.length ? nonFieldErrors : ['Login failed.'])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <label htmlFor="login-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.email?.map((err) => (
            <p key={err} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>

        <div className="space-y-1">
          <label htmlFor="login-password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.password?.map((err) => (
            <p key={err} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>

        {nonFieldErrors.map((err) => (
          <p key={err} className="text-sm text-red-600">
            {err}
          </p>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </section>
  )
}
