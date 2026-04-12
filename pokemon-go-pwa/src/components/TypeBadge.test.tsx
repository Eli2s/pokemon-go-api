import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TypeBadge from './TypeBadge'
import type { PokeType } from '../types/api'

describe('TypeBadge', () => {
  it('renders PT-BR label for PokeType object', () => {
    const type: PokeType = { type: 'pokemon_type_fire', names: { English: 'Fire', German: 'Feuer' } }
    render(<TypeBadge type={type} />)
    expect(screen.getByText('Fogo')).toBeInTheDocument()
  })

  it('renders plain string type for RaidBoss', () => {
    render(<TypeBadge type="Rock" />)
    expect(screen.getByText('Rock')).toBeInTheDocument()
  })

  it('applies correct background color for PokeType', () => {
    const type: PokeType = { type: 'pokemon_type_water', names: { English: 'Water', German: 'Wasser' } }
    render(<TypeBadge type={type} />)
    const badge = screen.getByText('Água')
    expect(badge).toHaveStyle({ backgroundColor: '#6890F0' })
  })

  it('applies correct background color for plain string type', () => {
    render(<TypeBadge type="Dragon" />)
    const badge = screen.getByText('Dragon')
    expect(badge).toHaveStyle({ backgroundColor: '#7038F8' })
  })
})
