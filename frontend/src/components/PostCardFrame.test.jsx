import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PostCardFrame, { postCardFrameClassName } from './PostCardFrame'

describe('PostCardFrame', () => {
  it('applies the shared card-shell class contract', () => {
    render(<PostCardFrame data-testid="frame">Content</PostCardFrame>)

    const frame = screen.getByTestId('frame')
    postCardFrameClassName.split(' ').forEach((klass) => {
      expect(frame).toHaveClass(klass)
    })
  })

  it('supports changing the element tag while preserving shared classes', () => {
    render(
      <PostCardFrame as="section" data-testid="frame-section">
        Content
      </PostCardFrame>,
    )

    const frame = screen.getByTestId('frame-section')
    expect(frame.tagName).toBe('SECTION')
    expect(frame).toHaveClass('bg-jangle-surface')
    expect(frame).toHaveClass('border-jangle-border')
  })
})
