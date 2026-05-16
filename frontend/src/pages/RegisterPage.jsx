import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../lib/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [nonFieldErrors, setNonFieldErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = {}
    if (!username.trim()) nextErrors.username = ['Username is required.']
    if (!email.trim()) nextErrors.email = ['Email is required.']
    if (!password) nextErrors.password = ['Password is required.']
    if (!confirmPassword) nextErrors.confirmPassword = ['Confirm password is required.']
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = ['Passwords do not match.']
    }

    setErrors(nextErrors)
    setNonFieldErrors([])
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      await registerUser({ username: username.trim(), email: email.trim(), password, confirmPassword })
      navigate('/', { replace: true })
    } catch (error) {
      const data = error?.response?.data || {}
      setErrors({
        username: data.username || [],
        email: data.email || [],
        password: data.password || [],
        confirmPassword: data.confirm_password || [],
      })
      setNonFieldErrors(data.non_field_errors || ['Registration failed.'])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Register</h1>
      <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <label htmlFor="register-username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="register-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.username?.map((err) => (
            <p key={err} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>

        <div className="space-y-1">
          <label htmlFor="register-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="register-password"
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

        <div className="space-y-1">
          <label htmlFor="register-confirm-password" className="block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.confirmPassword?.map((err) => (
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
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </section>
  )
}
