import { useParams } from 'react-router-dom'

export default function ProfilePage() {
  const { username } = useParams()
  return <h1 className="text-2xl font-semibold">Profile: {username}</h1>
}
