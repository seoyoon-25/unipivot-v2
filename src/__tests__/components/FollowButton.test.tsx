import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FollowButton from '@/components/club/social/FollowButton'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('FollowButton', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('renders 팔로우 when not following', () => {
    render(<FollowButton userId="user-1" initialFollowing={false} />)
    expect(screen.getByText('팔로우')).toBeInTheDocument()
  })

  it('renders 팔로잉 when following', () => {
    render(<FollowButton userId="user-1" initialFollowing={true} />)
    expect(screen.getByText('팔로잉')).toBeInTheDocument()
  })

  it('sends follow request on click', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    render(<FollowButton userId="user-1" initialFollowing={false} />)

    fireEvent.click(screen.getByText('팔로우'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/club/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1', action: 'follow' }),
      })
    })
  })

  it('sends unfollow request when already following', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    render(<FollowButton userId="user-1" initialFollowing={true} />)

    fireEvent.click(screen.getByText('팔로잉'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/club/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1', action: 'unfollow' }),
      })
    })
  })

  it('toggles text after successful follow', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    render(<FollowButton userId="user-1" initialFollowing={false} />)

    fireEvent.click(screen.getByText('팔로우'))

    await waitFor(() => {
      expect(screen.getByText('팔로잉')).toBeInTheDocument()
    })
  })

  it('does not toggle on failed request', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    render(<FollowButton userId="user-1" initialFollowing={false} />)

    fireEvent.click(screen.getByText('팔로우'))

    await waitFor(() => {
      expect(screen.getByText('팔로우')).toBeInTheDocument()
    })
  })

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    render(<FollowButton userId="user-1" initialFollowing={false} />)

    fireEvent.click(screen.getByText('팔로우'))

    await waitFor(() => {
      expect(screen.getByText('팔로우')).toBeInTheDocument()
    })
  })
})
