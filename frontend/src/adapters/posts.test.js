import { describe, expect, it } from 'vitest'
import { mapFeedPostType, mapFeedPost } from './posts'

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
})
