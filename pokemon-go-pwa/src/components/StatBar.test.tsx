import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatBar from './StatBar'

describe('StatBar', () => {
  it('renders label and value', () => {
    render(<StatBar label="Ataque" value={150} max={300} />)
    expect(screen.getByText('Ataque')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders bar with correct width percentage', () => {
    render(<StatBar label="Defesa" value={100} max={200} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveStyle({ width: '50%' })
  })

  it('clamps width to 100% when value exceeds max', () => {
    render(<StatBar label="HP" value={300} max={200} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveStyle({ width: '100%' })
  })
})
