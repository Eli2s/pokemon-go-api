import type { PokedexEntry, Pokemon, RaidBossResponse } from '../types/api'

const BASE = 'https://pokemon-go-api.github.io/pokemon-go-api/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchPokedex(): Promise<PokedexEntry[]> {
  const res = await fetch(`${BASE}/pokedex.json`)
  if (!res.ok) throw new ApiError('Failed to fetch Pokedex', res.status)
  return res.json()
}

export async function fetchPokemon(id: string): Promise<Pokemon> {
  const res = await fetch(`${BASE}/pokedex/id/${id}.json`)
  if (!res.ok) throw new ApiError(`Failed to fetch Pokemon ${id}`, res.status)
  return res.json()
}

export async function fetchRaids(): Promise<RaidBossResponse> {
  const res = await fetch(`${BASE}/raidboss.json`)
  if (!res.ok) throw new ApiError('Failed to fetch raids', res.status)
  return res.json()
}
