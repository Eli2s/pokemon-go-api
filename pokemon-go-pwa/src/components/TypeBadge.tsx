import type { PokeType } from '../types/api'
import { TYPE_COLORS, TYPE_COLORS_PLAIN, TYPE_LABELS_PT } from '../constants/types'

interface Props {
  type: PokeType | string
}

export default function TypeBadge({ type }: Props) {
  let label: string
  let color: string

  if (typeof type === 'string') {
    label = type
    color = TYPE_COLORS_PLAIN[type] ?? '#A8A878'
  } else {
    label = TYPE_LABELS_PT[type.type] ?? type.names.English
    color = TYPE_COLORS[type.type] ?? '#A8A878'
  }

  return (
    <span
      style={{ backgroundColor: color }}
      className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-white"
    >
      {label}
    </span>
  )
}
