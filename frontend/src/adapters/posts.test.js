import { describe, expect, it } from 'vitest'
import { mapFeedPostType, mapFeedPost, mapDetailPost } from './posts'

describe('posts adapter', () => {
  it('maps backend post_type and file_type to UI variants', () => {
    expect(mapFeedPostType({ post_type: 'text' })).toBe('writing')
    expect(mapFeedPostType({ post_type: 'youtube' })).toBe('youtube')
    expect(mapFeedPostType({ post_type: 'file', file_type: 'game' })).toBe('game')
    expect(mapFeedPostType({ post_type: 'file', file_type: 'image' })).toBe('writing')
  })

  it('maps backend post shape to stable PostCard UI contract', () => {
    const mapped = mapFeedPost({
      id: 99,
      post_type: 'youtube',
      title: 'Clip',
      youtube_url: 'https://www.youtube.com/watch?v=abc123',
      reaction_counts: { '+1': 2 },
      vote_score: 7,
      author_name: 'streamer',
    })

    expect(mapped).toMatchObject({
      id: 99,
      type: 'youtube',
      author: 'streamer',
      avatar: '.',
      title: 'Clip',
      description: 'https://www.youtube.com/watch?v=abc123',
      reactions: { '+1': 2 },
      votes: 7,
      comments: 0,
      color: '#a87c9e',
    })
  })

  it('maps backend detail shape to feed-consistent detail view model fields', () => {
    const mapped = mapDetailPost({
      id: 42,
      post_type: 'file',
      file_type: 'game',
      title: 'Dungeon Sprint',
      body: 'Fast loop dungeon crawler',
      reaction_counts: { '🔥': 4 },
      vote_score: 11,
      comment_count: 3,
      created_at: '2026-05-01T12:34:56Z',
      author: {
        username: 'mosswood',
        avatar_emoji: 'A',
      },
    })

    expect(mapped).toMatchObject({
      id: 42,
      type: 'game',
      author: 'mosswood',
      avatar: 'A',
      time: '2026-05-01',
      title: 'Dungeon Sprint',
      description: 'Fast loop dungeon crawler',
      reactions: { '🔥': 4 },
      votes: 11,
      comments: 3,
      color: '#8faa8b',
    })
  })

  it('falls back to safe default detail values when optional fields are absent', () => {
    const mapped = mapDetailPost({
      id: 7,
      post_type: 'text',
      title: 'Untitled',
    })

    expect(mapped).toMatchObject({
      id: 7,
      type: 'writing',
      author: 'jangler',
      avatar: '.',
      time: 'recently',
      title: 'Untitled',
      description: 'Shared a new drop.',
      reactions: {},
      votes: 0,
      comments: 0,
      color: '#c9a87c',
    })
  })
})
