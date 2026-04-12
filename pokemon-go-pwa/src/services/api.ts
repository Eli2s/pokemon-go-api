import type { PokedexEntry, Pokemon, RaidBossResponse } from '../types/api'

const BASE = 'https://pokemon-go-api.github.io/pokemon-go-api/api'

export async function fetchPokedex(): Promise<PokedexEntry[]> {
  const res = await fetch(`${BASE}/pokedex.json`)
  if (!res.ok) throw new Error('Failed to fetch Pokédex')
  return res.json()
}

export async function fetchPokemon(id: string): Promise<Pokemon> {
  const res = await fetch(`${BASE}/pokedex/id/${id}.json`)
  if (!res.ok) throw new Error(`Failed to fetch Pokémon ${id}`)
  return res.json()
}

export async function fetchRaids(): Promise<RaidBossResponse> {
  const res = await fetch(`${BASE}/raidboss.json`)
  if (!res.ok) throw new Error('Failed to fetch raids')
  return res.json()
}
