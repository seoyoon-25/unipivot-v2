import { render, screen } from '@testing-library/react'
import BookRatingDisplay from '@/components/club/rating/BookRatingDisplay'

describe('BookRatingDisplay', () => {
  it('shows "평점 없음" when avgRating is null', () => {
    render(<BookRatingDisplay avgRating={null} ratingCount={0} />)
    expect(screen.getByText('평점 없음')).toBeInTheDocument()
  })

  it('shows "평점 없음" when ratingCount is 0', () => {
    render(<BookRatingDisplay avgRating={4.5} ratingCount={0} />)
    expect(screen.getByText('평점 없음')).toBeInTheDocument()
  })

  it('displays rating value', () => {
    render(<BookRatingDisplay avgRating={4.2} ratingCount={15} />)
    expect(screen.getByText('4.2')).toBeInTheDocument()
  })

  it('displays rating count by default', () => {
    render(<BookRatingDisplay avgRating={4.2} ratingCount={15} />)
    expect(screen.getByText('(15명)')).toBeInTheDocument()
  })

  it('hides count when showCount is false', () => {
    render(<BookRatingDisplay avgRating={4.2} ratingCount={15} showCount={false} />)
    expect(screen.queryByText('(15명)')).not.toBeInTheDocument()
  })
})
