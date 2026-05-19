import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isActive = true
    setStatus('loading')

    api
      .get(`/api/profiles/${username}/`)
      .then((response) => {
        if (!isActive) return
        setProfile(response.data)
        setStatus('success')
      })
      .catch((error) => {
        if (!isActive) return
        const statusCode = error?.response?.status
        setStatus(statusCode === 404 ? 'not_found' : 'error')
      })

    return () => {
      isActive = false
    }
  }, [username])

  if (status === 'loading') {
    return <p className="text-jangle-textMuted">Loading profile...</p>
  }

  if (status === 'not_found') {
    return <p className="text-jangle-textMuted">Profile not found.</p>
  }

  if (status === 'error') {
    return <p className="text-jangle-textMuted">Could not load profile.</p>
  }

  return (
    <article className="space-y-4 rounded-3xl border border-jangle-border bg-jangle-surface p-5">
      <header className="flex items-center gap-4">
        <img
          src={profile.avatar || 'https://placehold.co/96x96?text=J'}
          alt={`${profile.username} avatar`}
          className="h-24 w-24 rounded-full border border-jangle-border object-cover"
        />
        <div>
          <h1 className="font-display text-2xl font-semibold text-jangle-textPrimary">{profile.display_name || profile.username}</h1>
          <p className="text-sm text-jangle-textMuted">@{profile.username}</p>
        </div>
      </header>
      <p className="text-jangle-textPrimary">{profile.bio || 'No bio yet.'}</p>
      <dl className="grid grid-cols-3 gap-2 rounded-2xl border border-jangle-border bg-jangle-bg p-3">
        <div>
          <dt className="text-xs text-jangle-textMuted">Posts</dt>
          <dd className="text-lg font-semibold text-jangle-textPrimary">{profile.post_count ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs text-jangle-textMuted">Followers</dt>
          <dd className="text-lg font-semibold text-jangle-textPrimary">{profile.follower_count ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs text-jangle-textMuted">Following</dt>
          <dd className="text-lg font-semibold text-jangle-textPrimary">{profile.following_count ?? 0}</dd>
        </div>
      </dl>
    </article>
  )
}
