import { render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('button', { name: /shake it/i })).toBeInTheDocument()
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
})
