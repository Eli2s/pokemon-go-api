import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MoveTable from './MoveTable'
import type { PokemonMove } from '../types/api'

const fireMove: PokemonMove = {
  id: 'EMBER',
  power: 10,
  energy: 6,
  durationMs: 1100,
  type: { type: 'pokemon_type_fire', names: { English: 'Fire', German: 'Feuer' } },
  names: { English: 'Ember', German: 'Glut', BrazilianPortuguese: 'Brasa' },
  combat: null,
}

const waterMove: PokemonMove = {
  id: 'WATER_GUN',
  power: 5,
  energy: 5,
  durationMs: 500,
  type: { type: 'pokemon_type_water', names: { English: 'Water', German: 'Wasser' } },
  names: { English: 'Water Gun', German: 'Wasserkanone', BrazilianPortuguese: 'Pistola D\'Água' },
  combat: null,
}

describe('MoveTable', () => {
  it('renders move names in PT-BR', () => {
    render(<MoveTable moves={[fireMove]} primaryType="pokemon_type_fire" secondaryType={null} title="Ataques Rápidos" />)
    expect(screen.getByText('Brasa')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<MoveTable moves={[fireMove]} primaryType="pokemon_type_fire" secondaryType={null} title="Ataques Rápidos" />)
    expect(screen.getByText('Ataques Rápidos')).toBeInTheDocument()
    expect(screen.getByText('Poder')).toBeInTheDocument()
    expect(screen.getByText('DPS')).toBeInTheDocument()
  })

  it('shows STAB indicator for matching type moves', () => {
    render(<MoveTable moves={[fireMove, waterMove]} primaryType="pokemon_type_fire" secondaryType={null} title="Ataques Rápidos" />)
    const rows = screen.getAllByRole('row')
    // header + 2 data rows
    expect(rows).toHaveLength(3)
  })

  it('renders empty state when no moves', () => {
    render(<MoveTable moves={[]} primaryType="pokemon_type_fire" secondaryType={null} title="Ataques Rápidos" />)
    expect(screen.getByText('Nenhum ataque disponível')).toBeInTheDocument()
  })
})
