import { describe, it, expect } from 'vitest'
import { getDisplayName, calcDps } from './pokemon'
import type { Names, PokemonMove } from '../types/api'

const makeNames = (overrides: Partial<Names> = {}): Names => ({
  English: 'Bulbasaur',
  German: 'Bisasam',
  ...overrides,
})

describe('getDisplayName', () => {
  it('returns BrazilianPortuguese when available', () => {
    const names = makeNames({ BrazilianPortuguese: 'Bulbassauro' })
    expect(getDisplayName(names)).toBe('Bulbassauro')
  })

  it('falls back to English when BrazilianPortuguese is missing', () => {
    const names = makeNames()
    expect(getDisplayName(names)).toBe('Bulbasaur')
  })

  it('falls back to English when BrazilianPortuguese is empty string', () => {
    const names = makeNames({ BrazilianPortuguese: '' })
    expect(getDisplayName(names)).toBe('Bulbasaur')
  })
})

describe('calcDps', () => {
  const baseMove: PokemonMove = {
    id: 'TACKLE',
    power: 5,
    energy: 5,
    durationMs: 500,
    type: { type: 'pokemon_type_normal', names: makeNames() },
    names: makeNames(),
    combat: null,
  }

  it('calculates DPS without STAB', () => {
    const dps = calcDps(baseMove, 'pokemon_type_fire', null)
    expect(dps).toBeCloseTo(10)
  })

  it('applies STAB from primary type', () => {
    const dps = calcDps(baseMove, 'pokemon_type_normal', null)
    expect(dps).toBeCloseTo(12)
  })

  it('applies STAB from secondary type', () => {
    const dps = calcDps(baseMove, 'pokemon_type_fire', 'pokemon_type_normal')
    expect(dps).toBeCloseTo(12)
  })

  it('returns 0 for move with 0 power', () => {
    const move = { ...baseMove, power: 0 }
    expect(calcDps(move, 'pokemon_type_fire', null)).toBe(0)
  })
})
