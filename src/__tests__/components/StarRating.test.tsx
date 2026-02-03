import { render, screen, fireEvent } from '@testing-library/react'
import StarRating from '@/components/club/rating/StarRating'

describe('StarRating', () => {
  it('renders 5 star buttons', () => {
    render(<StarRating value={null} onChange={jest.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
  })

  it('displays score text when value is set', () => {
    render(<StarRating value={3} onChange={jest.fn()} />)
    expect(screen.getByText('3점')).toBeInTheDocument()
  })

  it('does not display score text when value is null', () => {
    render(<StarRating value={null} onChange={jest.fn()} />)
    expect(screen.queryByText(/점$/)).not.toBeInTheDocument()
  })

  it('calls onChange with star number on click', () => {
    const onChange = jest.fn()
    render(<StarRating value={null} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('3점'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('calls onChange with null when clicking same star (toggle off)', () => {
    const onChange = jest.fn()
    render(<StarRating value={3} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('3점'))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('does not call onChange in readonly mode', () => {
    const onChange = jest.fn()
    render(<StarRating value={3} onChange={onChange} readonly />)
    fireEvent.click(screen.getByLabelText('3점'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables buttons in readonly mode', () => {
    render(<StarRating value={3} onChange={jest.fn()} readonly />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('has correct aria-labels', () => {
    render(<StarRating value={null} onChange={jest.fn()} />)
    expect(screen.getByLabelText('1점')).toBeInTheDocument()
    expect(screen.getByLabelText('5점')).toBeInTheDocument()
  })
})
