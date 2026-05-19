import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function ProfilePage() {
  const { username } = useParams()
  const currentUser = useAuthStore((state) => state.currentUser)
  const accessToken = useAuthStore((state) => state.accessToken)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [activeTab, setActiveTab] = useState('posts')
  const [isEditing, setIsEditing] = useState(false)
  const [draftBio, setDraftBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isFollowPending, setIsFollowPending] = useState(false)

  useEffect(() => {
    let isActive = true
    setStatus('loading')

    api
      .get(`/api/profiles/${username}/`)
      .then((response) => {
        if (!isActive) return
        setProfile(response.data)
        setDraftBio(response.data.bio || '')
        setIsEditing(false)
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

  const isOwnProfile = Boolean(currentUser?.username && currentUser.username === profile.username)
  const canFollow = Boolean(accessToken) && !isOwnProfile

  const saveProfile = async () => {
    if (!isOwnProfile || isSaving) return
    setIsSaving(true)
    try {
      const response = await api.patch('/api/users/me/update/', { bio: draftBio })
      setProfile((prev) => ({ ...prev, bio: response.data?.bio ?? draftBio }))
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleFollow = async () => {
    if (!canFollow || isFollowPending) return
    setIsFollowPending(true)
    try {
      if (profile.is_following) {
        await api.delete(`/api/profiles/${profile.username}/follow/`)
        setProfile((prev) => ({ ...prev, is_following: false, follower_count: Math.max((prev.follower_count ?? 1) - 1, 0) }))
      } else {
        await api.post(`/api/profiles/${profile.username}/follow/`)
        setProfile((prev) => ({ ...prev, is_following: true, follower_count: (prev.follower_count ?? 0) + 1 }))
      }
    } finally {
      setIsFollowPending(false)
    }
  }

  return (
    <article className="space-y-4 rounded-3xl border border-jangle-border bg-jangle-surface p-5">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
        <img
          src={profile.avatar || 'https://placehold.co/96x96?text=J'}
          alt={`${profile.username} avatar`}
          className="h-24 w-24 rounded-full border border-jangle-border object-cover"
        />
        <div>
          <h1 className="font-display text-2xl font-semibold text-jangle-textPrimary">{profile.display_name || profile.username}</h1>
          <p className="text-sm text-jangle-textMuted">@{profile.username}</p>
        </div>
        </div>
        <div className="flex gap-2">
          {isOwnProfile ? (
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="min-h-11 rounded-full border border-jangle-border px-3 text-sm text-jangle-textPrimary"
            >
              Edit profile
            </button>
          ) : canFollow ? (
            <button
              type="button"
              onClick={toggleFollow}
              className="min-h-11 rounded-full border border-jangle-accent/40 bg-jangle-accent px-3 text-sm font-semibold text-jangle-bg"
            >
              {profile.is_following ? 'Unfollow' : 'Follow'}
            </button>
          ) : null}
        </div>
      </header>
      {isEditing ? (
        <div className="space-y-2 rounded-2xl border border-jangle-border bg-jangle-bg p-3">
          <label htmlFor="profile-bio" className="block text-sm text-jangle-textMuted">
            Bio
          </label>
          <textarea
            id="profile-bio"
            className="min-h-24 w-full rounded-xl border border-jangle-border bg-jangle-surface p-2 text-sm text-jangle-textPrimary"
            value={draftBio}
            onChange={(event) => setDraftBio(event.target.value)}
          />
          <button
            type="button"
            onClick={saveProfile}
            disabled={isSaving}
            className="min-h-11 rounded-full border border-jangle-accent/40 bg-jangle-accent px-3 text-sm font-semibold text-jangle-bg disabled:opacity-60"
          >
            Save profile
          </button>
        </div>
      ) : (
        <p className="text-jangle-textPrimary">{profile.bio || 'No bio yet.'}</p>
      )}
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
      <section className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`min-h-11 rounded-full px-3 text-sm ${activeTab === 'posts' ? 'bg-jangle-accent/15 text-jangle-accent' : 'text-jangle-textMuted'}`}
          >
            Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('likes')}
            className={`min-h-11 rounded-full px-3 text-sm ${activeTab === 'likes' ? 'bg-jangle-accent/15 text-jangle-accent' : 'text-jangle-textMuted'}`}
          >
            Likes
          </button>
        </div>
        {activeTab === 'posts' ? (
          <p className="rounded-2xl border border-jangle-border bg-jangle-bg p-3 text-jangle-textMuted">Recent posts will appear here.</p>
        ) : (
          <p className="rounded-2xl border border-jangle-border bg-jangle-bg p-3 text-jangle-textMuted">Liked posts will appear here.</p>
        )}
      </section>
    </article>
  )
}
