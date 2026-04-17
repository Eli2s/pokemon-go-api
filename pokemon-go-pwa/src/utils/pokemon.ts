import { CATEGORY_LABELS, CLASS_LABELS_PT, GENERATION_LABELS, TYPE_LABELS_PT, TYPE_ORDER, TYPE_PLAIN_TO_KEY } from '../constants/types'
import { TYPE_CHART } from '../constants/typeChart'
import type { Names, Pokemon, PokemonMove, PokedexEntry } from '../types/api'

export function getDisplayName(names: Names): string {
  return names.BrazilianPortuguese || names.English
}

export function calcDps(
  move: PokemonMove,
  primaryType: string,
  secondaryType: string | null,
): number {
  const stab =
    move.type.type === primaryType || move.type.type === secondaryType
      ? 1.2
      : 1.0
  const durationSec = move.durationMs / 1000
  return durationSec > 0 ? (move.power * stab) / durationSec : 0
}

export function getGenerationLabel(generation: number): string {
  return GENERATION_LABELS[generation] ?? `Geração ${generation}`
}

export function getTypeLabel(type: string): string {
  return TYPE_LABELS_PT[type] ?? type
}

export function getTypeKey(value: string): string {
  return TYPE_PLAIN_TO_KEY[value] ?? value
}

export function getPokemonCategory(pokemon: Pokemon | PokedexEntry): keyof typeof CATEGORY_LABELS {
  if (pokemon.hasGigantamaxEvolution) return 'gigantamax'
  if (pokemon.hasMegaEvolution) return 'mega'
  if (pokemon.pokemonClass === 'POKEMON_CLASS_LEGENDARY') return 'legendary'
  if (pokemon.pokemonClass === 'POKEMON_CLASS_MYTHIC') return 'mythic'
  if (pokemon.pokemonClass === 'POKEMON_CLASS_ULTRA_BEAST') return 'ultra_beast'
  return 'regular'
}

export function getCategoryLabel(category: keyof typeof CATEGORY_LABELS): string {
  return CATEGORY_LABELS[category]
}

export function getPokemonClassLabel(pokemonClass: Pokemon['pokemonClass']): string | null {
  if (!pokemonClass) return null
  return CLASS_LABELS_PT[pokemonClass] ?? pokemonClass
}

export function getBaseStatTotal(pokemon: Pokemon | PokedexEntry): number {
  if (!pokemon.stats) return 0
  return pokemon.stats.attack + pokemon.stats.defense + pokemon.stats.stamina
}

export function getPrimaryTypeKey(pokemon: Pokemon | PokedexEntry): string {
  return pokemon.primaryType.type
}

export function getTypeComboLabel(pokemon: Pokemon | PokedexEntry): string {
  const primary = getTypeLabel(pokemon.primaryType.type)
  const secondary = pokemon.secondaryType ? getTypeLabel(pokemon.secondaryType.type) : null
  return secondary ? `${primary} / ${secondary}` : primary
}

export function getBestMoveset(pokemon: Pokemon): { quick: PokemonMove | null; charged: PokemonMove | null; score: number } {
  const quickMoves = Object.values(pokemon.quickMoves)
  const chargedMoves = Object.values(pokemon.cinematicMoves)
  let bestQuick: PokemonMove | null = null
  let bestCharged: PokemonMove | null = null
  let bestScore = 0

  for (const quick of quickMoves) {
    const quickDps = calcDps(quick, pokemon.primaryType.type, pokemon.secondaryType?.type ?? null)
    for (const charged of chargedMoves) {
      const chargedDps = calcDps(charged, pokemon.primaryType.type, pokemon.secondaryType?.type ?? null)
      const score = quickDps * 0.45 + chargedDps * 0.55
      if (score > bestScore) {
        bestScore = score
        bestQuick = quick
        bestCharged = charged
      }
    }
  }

  return { quick: bestQuick, charged: bestCharged, score: bestScore }
}

export function getTypeMatchups(pokemon: Pokemon | PokedexEntry) {
  const defendingTypes = [pokemon.primaryType.type, pokemon.secondaryType?.type].filter(Boolean) as string[]

  const matchups = TYPE_ORDER.map((attackType) => {
    const multiplier = defendingTypes.reduce((total, defendingType) => {
      const effectiveness = TYPE_CHART[attackType]?.[defendingType] ?? 1
      return total * effectiveness
    }, 1)

    return {
      type: attackType,
      multiplier,
      label: getTypeLabel(attackType),
    }
  })

  return {
    weaknesses: matchups.filter((entry) => entry.multiplier > 1).sort((a, b) => b.multiplier - a.multiplier),
    resistances: matchups.filter((entry) => entry.multiplier < 1).sort((a, b) => a.multiplier - b.multiplier),
    neutrals: matchups.filter((entry) => entry.multiplier === 1),
  }
}

export function formatMultiplier(multiplier: number): string {
  if (multiplier === 1) return '1×'
  return `${Number(multiplier.toFixed(2)).toString().replace('.', ',')}×`
}

export function formatMoveEnergy(move: PokemonMove): string {
  if (move.combat) {
    return `${move.energy} PvE / ${move.combat.energy} PvP`
  }
  return `${move.energy} PvE`
}

export function getTopPokemonByStat(entries: PokedexEntry[], limit = 6): PokedexEntry[] {
  return [...entries].sort((a, b) => getBaseStatTotal(b) - getBaseStatTotal(a)).slice(0, limit)
}
