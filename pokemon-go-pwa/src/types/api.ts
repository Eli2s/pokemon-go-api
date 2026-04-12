export interface Names {
  English: string
  German: string
  French?: string
  Italian?: string
  Japanese?: string
  Korean?: string
  Spanish?: string
  BrazilianPortuguese?: string
}

export interface Assets {
  image: string
  shinyImage: string
}

export interface PokeType {
  type: string
  names: Names
}

export interface MoveCombat {
  energy: number
  power: number
  turns: number
  buffs: {
    activationChance: number
    attackerAttackStatsChange: number | null
    attackerDefenseStatsChange: number | null
    targetAttackStatsChange: number | null
    targetDefenseStatsChange: number | null
  } | null
}

export interface PokemonMove {
  id: string
  power: number
  energy: number
  durationMs: number
  type: PokeType
  names: Names
  combat: MoveCombat | null
}

export interface PokemonStats {
  stamina: number
  attack: number
  defense: number
}

export interface Evolution {
  id: string
  formId: string
  candies: number
  item: { id: string; names: Names } | null
  quests: Array<{ id: string; type: string; names: Names }>
}

export interface Pokemon {
  id: string
  formId: string
  dexNr: number
  generation: number
  names: Names
  stats: PokemonStats | null
  primaryType: PokeType
  secondaryType: PokeType | null
  pokemonClass: 'POKEMON_CLASS_LEGENDARY' | 'POKEMON_CLASS_MYTHIC' | 'POKEMON_CLASS_ULTRA_BEAST' | null
  quickMoves: Record<string, PokemonMove>
  cinematicMoves: Record<string, PokemonMove>
  eliteQuickMoves: Record<string, PokemonMove>
  eliteCinematicMoves: Record<string, PokemonMove>
  assets: Assets | null
  evolutions: Evolution[]
  hasMegaEvolution: boolean
  hasGigantamaxEvolution: boolean
  megaEvolutions: Record<string, unknown>
  regionForms: Record<string, unknown>
  assetForms: unknown[]
}

export type PokedexEntry = Pokemon

export type RaidLevel =
  | 'ex' | 'mega' | 'legendary_mega' | 'ultra_beast'
  | 'lvl5' | 'lvl3' | 'lvl1'
  | 'shadow_lvl1' | 'shadow_lvl3' | 'shadow_lvl5'

export interface RaidBoss {
  id: string
  form: string
  costume: string | null
  assets: Assets
  level: RaidLevel
  shiny: boolean
  types: string[]
  names: Names
  cpRange: { min: number; max: number }
  cpRangeBoost: { min: number; max: number }
}

export interface RaidBossResponse {
  currentList: Record<RaidLevel, RaidBoss[]>
  graphics: unknown
}
