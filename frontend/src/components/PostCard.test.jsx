import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import PostCard from './PostCard'

const basePost = {
  id: 1,
  type: 'game',
  author: 'mosswood',
  avatar: 'A',
  time: '23 minutes ago',
  title: 'Tiny Garden Sim',
  description: 'A relaxing little game where you grow things and water them.',
  color: '#8faa8b',
  reactions: { thumbs: 14, heart: 9 },
  comments: 7,
  votes: 38,
}

describe('PostCard', () => {
  it('renders shared header/body/footer content from props', () => {
    render(
      <MemoryRouter>
        <PostCard post={basePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    expect(screen.getByText('mosswood')).toBeInTheDocument()
    expect(screen.getByText('23 minutes ago')).toBeInTheDocument()
    expect(screen.getByText(/GAME/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tiny Garden Sim' })).toHaveAttribute('href', '/post/1')
    expect(screen.getByText('A relaxing little game where you grow things and water them.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upvote/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /downvote/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comments 7/i })).toBeInTheDocument()
  })

  it('applies elevated hover styling when hovered', () => {
    render(
      <MemoryRouter>
        <PostCard post={basePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    const card = screen.getByTestId('post-card-1')
    expect(card).toHaveClass('border-jangle-border')
    expect(card).toHaveClass('shadow-[0_2px_12px_rgba(0,0,0,0.2)]')
    expect(card).toHaveClass('motion-card-enter')
    expect(card).toHaveClass('motion-card-hover')

    fireEvent.mouseEnter(card)

    expect(card).toHaveClass('shadow-[0_0_28px_var(--post-color-glow),0_6px_22px_rgba(0,0,0,0.35)]')
  })

  it('renders game preview strip with play count and Play Now CTA only for game posts', () => {
    render(
      <MemoryRouter>
        <PostCard
          post={{ ...basePost, type: 'game', playCount: 41 }}
          onVote={vi.fn()}
          onReact={vi.fn()}
          isAuthed={false}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Playable in browser')).toBeInTheDocument()
    expect(screen.getByText('41 people played')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Now' })).toBeInTheDocument()
    expect(screen.queryByText('YouTube embed')).not.toBeInTheDocument()
  })

  it('renders youtube preview strip only for youtube posts and no preview for writing posts', () => {
    const youtubePost = {
      ...basePost,
      id: 2,
      type: 'youtube',
      title: 'Video Drop',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }

    const writingPost = {
      ...basePost,
      id: 3,
      type: 'writing',
      title: 'Writing Drop',
    }

    const { rerender } = render(
      <MemoryRouter>
        <PostCard post={youtubePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    expect(screen.getByText('YouTube embed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle youtube player/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Play Now' })).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <PostCard post={writingPost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    expect(screen.queryByText('YouTube embed')).not.toBeInTheDocument()
    expect(screen.queryByText('Playable in browser')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Play Now' })).not.toBeInTheDocument()
  })

  it('toggles inline youtube player open and closed from the trigger control', () => {
    const youtubePost = {
      ...basePost,
      id: 11,
      type: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }

    render(
      <MemoryRouter>
        <PostCard post={youtubePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    const toggle = screen.getByRole('button', { name: /toggle youtube player/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTitle(/youtube player/i)).not.toBeInTheDocument()

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTitle('YouTube player')).toBeInTheDocument()

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTitle('YouTube player')).not.toBeInTheDocument()
  })

  it('renders invalid youtube fallback state with Open on YouTube action', () => {
    const youtubePost = {
      ...basePost,
      id: 12,
      type: 'youtube',
      youtubeUrl: 'https://evil.example.com/watch?v=dQw4w9WgXcQ',
    }

    render(
      <MemoryRouter>
        <PostCard post={youtubePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    expect(screen.getByText(/unable to embed this youtube link/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /open on youtube/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('button', { name: /toggle youtube player/i })).not.toBeInTheDocument()
  })

  it('opens game inline iframe for safe same-origin urls', () => {
    const gamePost = {
      ...basePost,
      id: 21,
      type: 'game',
      gameFileUrl: '/games/tiny-garden/index.html',
    }

    render(
      <MemoryRouter>
        <PostCard post={gamePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    const playNow = screen.getByRole('button', { name: 'Play Now' })
    expect(playNow).toBeEnabled()

    fireEvent.click(playNow)

    expect(screen.getByTitle('Game player')).toBeInTheDocument()
  })

  it('renders new-tab launch link for remote game urls and applies noopener noreferrer', () => {
    const gamePost = {
      ...basePost,
      id: 22,
      type: 'game',
      gameFileUrl: 'https://cdn.example.com/tiny-garden.html',
    }

    render(
      <MemoryRouter>
        <PostCard post={gamePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    const launchLink = screen.getByRole('link', { name: 'Play Now' })
    expect(launchLink).toHaveAttribute('href', gamePost.gameFileUrl)
    expect(launchLink).toHaveAttribute('target', '_blank')
    expect(launchLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('disables game action when game file url is missing', () => {
    const gamePost = {
      ...basePost,
      id: 23,
      type: 'game',
      gameFileUrl: null,
    }

    render(
      <MemoryRouter>
        <PostCard post={gamePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Play Now' })).toBeDisabled()
    expect(screen.getByText(/game file unavailable/i)).toBeInTheDocument()
  })

  it('applies iframe sandbox and allow attributes for youtube and game embeds', () => {
    const youtubePost = {
      ...basePost,
      id: 24,
      type: 'youtube',
      youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
    }

    const gamePost = {
      ...basePost,
      id: 25,
      type: 'game',
      gameFileUrl: '/games/same-origin.html',
    }

    const { rerender } = render(
      <MemoryRouter>
        <PostCard post={youtubePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /toggle youtube player/i }))
    const youtubeFrame = screen.getByTitle('YouTube player')
    expect(youtubeFrame).toHaveAttribute('sandbox')
    expect(youtubeFrame).toHaveAttribute('allow')

    rerender(
      <MemoryRouter>
        <PostCard post={gamePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Play Now' }))
    const gameFrame = screen.getByTitle('Game player')
    expect(gameFrame).toHaveAttribute('sandbox')
    expect(gameFrame).toHaveAttribute('allow')
  })

  it('opens + React picker, increments selected emoji, and closes picker', () => {
    const onReact = vi.fn()

    render(
      <MemoryRouter>
        <PostCard post={basePost} onVote={vi.fn()} onReact={onReact} isAuthed />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('menu', { name: /emoji picker/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '+ React' }))

    const picker = screen.getByRole('menu', { name: /emoji picker/i })
    expect(picker).toBeInTheDocument()

    const pickerButtons = within(picker).getAllByRole('button')
    fireEvent.click(pickerButtons[1])

    expect(screen.queryByRole('menu', { name: /emoji picker/i })).not.toBeInTheDocument()
    expect(onReact).toHaveBeenCalledWith(1, expect.any(String))
  })

  it('toggles vote score for upvote, downvote, and untoggle behavior', () => {
    render(
      <MemoryRouter>
        <PostCard post={basePost} onVote={vi.fn()} onReact={vi.fn()} isAuthed />
      </MemoryRouter>,
    )

    const upvote = screen.getByRole('button', { name: /upvote/i })
    const downvote = screen.getByRole('button', { name: /downvote/i })

    expect(screen.getByText('38')).toBeInTheDocument()

    fireEvent.click(upvote)
    expect(screen.getByText('39')).toBeInTheDocument()

    fireEvent.click(upvote)
    expect(screen.getByText('38')).toBeInTheDocument()

    fireEvent.click(downvote)
    expect(screen.getByText('37')).toBeInTheDocument()

    fireEvent.click(downvote)
    expect(screen.getByText('38')).toBeInTheDocument()
  })

  it('shows LIVE indicator only when playing=true', () => {
    const { rerender } = render(
      <MemoryRouter>
        <PostCard post={{ ...basePost, playing: true }} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    expect(screen.getByText('LIVE')).toBeInTheDocument()
    expect(screen.getByTestId('live-dot-1')).toHaveClass('motion-pulse-dot')

    rerender(
      <MemoryRouter>
        <PostCard post={{ ...basePost, playing: false }} onVote={vi.fn()} onReact={vi.fn()} isAuthed={false} />
      </MemoryRouter>,
    )

    expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
    expect(screen.queryByTestId('live-dot-1')).not.toBeInTheDocument()
  })
})
