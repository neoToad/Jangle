import { describe, expect, it } from 'vitest'
import { getSafeGameMedia, getSafeYouTubeEmbed } from './media'

describe('media helpers', () => {
  it('parses youtube watch links', () => {
    const media = getSafeYouTubeEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(media).toEqual({
      videoId: 'dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    })
  })

  it('parses youtu.be links', () => {
    const media = getSafeYouTubeEmbed('https://youtu.be/dQw4w9WgXcQ')
    expect(media?.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })

  it('parses existing embed links', () => {
    const media = getSafeYouTubeEmbed('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(media?.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })

  it('rejects malformed/non-youtube/non-http links', () => {
    expect(getSafeYouTubeEmbed('notaurl')).toBeNull()
    expect(getSafeYouTubeEmbed('https://evil.example.com/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(getSafeYouTubeEmbed('javascript:alert(1)')).toBeNull()
  })

  it('returns inline mode for safe same-origin game urls', () => {
    const gameMedia = getSafeGameMedia('/games/play.html')
    expect(gameMedia).toEqual({ mode: 'inline', url: '/games/play.html' })
  })

  it('returns new-tab mode for remote http(s) game urls', () => {
    const gameMedia = getSafeGameMedia('https://cdn.example.com/games/play.html')
    expect(gameMedia).toEqual({ mode: 'new-tab', url: 'https://cdn.example.com/games/play.html' })
  })

  it('rejects non-http game links', () => {
    expect(getSafeGameMedia('javascript:alert(1)')).toBeNull()
    expect(getSafeGameMedia('file:///C:/games/play.html')).toBeNull()
  })
})
