import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import PokemonCard from './PokemonCard'
import type { PokedexEntry } from '../types/api'

const basePokemon: PokedexEntry = {
  id: 'BULBASAUR',
  formId: 'BULBASAUR',
  dexNr: 1,
  generation: 1,
  names: { English: 'Bulbasaur', German: 'Bisasam', BrazilianPortuguese: 'Bulbasaur' },
  stats: { stamina: 128, attack: 118, defense: 111 },
  primaryType: { type: 'pokemon_type_grass', names: { English: 'Grass', German: 'Pflanze' } },
  secondaryType: { type: 'pokemon_type_poison', names: { English: 'Poison', German: 'Gift' } },
  pokemonClass: null,
  quickMoves: {},
  cinematicMoves: {},
  eliteQuickMoves: {},
  eliteCinematicMoves: {},
  assets: { image: 'https://example.com/1.png', shinyImage: 'https://example.com/1s.png' },
  evolutions: [],
  hasMegaEvolution: false,
  hasGigantamaxEvolution: false,
  megaEvolutions: {},
  regionForms: {},
  assetForms: [],
}

function renderCard(pokemon = basePokemon) {
  return render(
    <MemoryRouter>
      <PokemonCard pokemon={pokemon} />
    </MemoryRouter>,
  )
}

describe('PokemonCard', () => {
  it('displays the Pokémon number and name', () => {
    renderCard()
    expect(screen.getByText('#001')).toBeInTheDocument()
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
  })

  it('renders both type badges', () => {
    renderCard()
    expect(screen.getByText('Grama')).toBeInTheDocument()
    expect(screen.getByText('Venenoso')).toBeInTheDocument()
  })

  it('links to the Pokémon detail page', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/pokemon/BULBASAUR')
  })
})
