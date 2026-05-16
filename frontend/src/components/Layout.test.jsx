import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Layout from './Layout'

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Feed Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout shell', () => {
  it('renders jangle nav with search and primary actions', () => {
    renderLayout()

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByText('jangle')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('search drops...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /shake it/i })).toHaveClass('motion-shake-hover')
    expect(screen.getByRole('button', { name: /open profile menu/i })).toBeInTheDocument()
  })

  it('renders centered feed and sidebar shell regions', () => {
    renderLayout()

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByTestId('feed-region')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-region')).toBeInTheDocument()
    expect(screen.getByText('Feed Content')).toBeInTheDocument()
  })

  it('applies dark theme shell token classes', () => {
    renderLayout()

    const appShell = screen.getByTestId('app-shell')
    expect(appShell).toHaveClass('bg-jangle-bg')
    expect(appShell).toHaveClass('text-jangle-textPrimary')
  })

  it('renders initial chat messages', () => {
    renderLayout()

    expect(screen.getByText('mosswood')).toBeInTheDocument()
    expect(screen.getByText('yo the garden build is up')).toBeInTheDocument()
    expect(screen.getByText('hazel.ink')).toBeInTheDocument()
  })

  it('sends a chat message with send button and clears input', () => {
    renderLayout()

    const input = screen.getByRole('textbox', { name: /^chat message$/i })
    fireEvent.change(input, { target: { value: 'hello jangle' } })
    fireEvent.click(screen.getByRole('button', { name: /send chat message/i }))

    expect(screen.getByText('hello jangle')).toBeInTheDocument()
    expect(screen.getByText('you')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('sends a chat message with Enter key', () => {
    renderLayout()

    const input = screen.getByRole('textbox', { name: /^chat message$/i })
    fireEvent.change(input, { target: { value: 'enter send' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(screen.getByText('enter send')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('toggles mobile chat drawer from trigger button', () => {
    renderLayout()

    const trigger = screen.getByRole('button', { name: /open the jangle chat/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('mobile-chat-drawer')).toHaveClass('translate-y-0')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('exposes labels for interactive controls and keeps minimum touch target classes', () => {
    renderLayout()

    expect(screen.getByRole('searchbox', { name: /search drops/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /shake it/i })).toHaveClass('min-h-11')
    expect(screen.getByRole('button', { name: /open profile menu/i })).toHaveClass('min-h-11')
    expect(screen.getByRole('button', { name: /open the jangle chat/i })).toHaveClass('min-h-11')
  })

  it('supports keyboard actions for mobile chat trigger and escape close', () => {
    renderLayout()

    const trigger = screen.getByRole('button', { name: /open the jangle chat/i })
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: /the jangle mobile chat/i })).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('dialog', { name: /the jangle mobile chat/i }), { key: 'Escape', code: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps mobile drawer structural classes for responsive behavior', () => {
    renderLayout()

    const drawer = screen.getByTestId('mobile-chat-drawer')
    expect(drawer).toHaveClass('fixed')
    expect(drawer).toHaveClass('inset-x-3')
    expect(drawer).toHaveClass('lg:hidden')
  })
})
