import type { Names, PokemonMove } from '../types/api'

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
  return (move.power * stab) / durationSec
}
