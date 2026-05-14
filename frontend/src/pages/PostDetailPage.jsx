import { useParams } from 'react-router-dom'

export default function PostDetailPage() {
  const { id } = useParams()

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Post #{id}</h1>
      <div className="rounded border border-slate-300 bg-white p-4">Post detail placeholder</div>
      <div className="rounded border border-slate-300 bg-white p-4">Comments placeholder</div>
      <div className="rounded border border-slate-300 bg-white p-4">Chat placeholder</div>
    </section>
  )
}
