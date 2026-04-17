import type { PokeType } from '../types/api'
import { TYPE_COLORS, TYPE_COLORS_PLAIN, TYPE_LABELS_PT } from '../constants/types'

interface Props {
  type: PokeType | string
}

export default function TypeBadge({ type }: Props) {
  let label: string
  let color: string

  if (typeof type === 'string') {
    const isApiKey = type.startsWith('pokemon_type_')
    label = isApiKey ? (TYPE_LABELS_PT[type] ?? type) : type
    color = isApiKey ? (TYPE_COLORS[type] ?? '#A8A878') : (TYPE_COLORS_PLAIN[type] ?? '#A8A878')
  } else {
    label = TYPE_LABELS_PT[type.type] ?? type.names.English
    color = TYPE_COLORS[type.type] ?? '#A8A878'
  }

  return (
    <span
      style={{ backgroundColor: color }}
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
    >
      {label}
    </span>
  )
}
