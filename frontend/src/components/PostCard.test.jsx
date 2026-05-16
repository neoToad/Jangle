import { fireEvent, render, screen } from '@testing-library/react'
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
  reactions: { seed: 14, heart: 9 },
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
    expect(screen.getByText(/7/)).toBeInTheDocument()
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

    fireEvent.mouseEnter(card)

    expect(card).toHaveClass('border-jangle-tint')
    expect(card).toHaveClass('shadow-[0_0_28px_var(--post-color-glow),0_6px_22px_rgba(0,0,0,0.35)]')
  })
})
