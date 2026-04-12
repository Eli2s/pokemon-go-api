import { useRaids } from '../hooks/useRaids'
import TypeBadge from '../components/TypeBadge'
import { getDisplayName } from '../utils/pokemon'
import { RAID_LEVEL_LABELS } from '../constants/types'
import type { RaidLevel } from '../types/api'

const LEVEL_ORDER: RaidLevel[] = [
  'legendary_mega', 'mega', 'ultra_beast', 'lvl5', 'lvl3', 'lvl1',
  'shadow_lvl5', 'shadow_lvl3', 'shadow_lvl1', 'ex',
]

export default function Raids() {
  const { data, isLoading, isError } = useRaids()

  if (isLoading) {
    return <p className="py-10 text-center text-gray-400">Carregando raids...</p>
  }
  if (isError || !data) {
    return <p className="py-10 text-center text-red-500">Erro ao carregar raids.</p>
  }

  const levels = LEVEL_ORDER.filter((lvl) => data.currentList[lvl]?.length > 0)

  return (
    <div className="flex flex-col gap-6">
      {levels.map((level) => (
        <section key={level}>
          <h2 className="mb-3 text-base font-bold text-gray-700 dark:text-gray-200">
            {RAID_LEVEL_LABELS[level] ?? level}
          </h2>
          <div className="flex flex-col gap-2">
            {data.currentList[level].map((boss) => (
              <div
                key={`${boss.id}-${boss.form}-${boss.costume ?? ''}`}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800"
              >
                <img
                  src={boss.assets.image}
                  alt={getDisplayName(boss.names)}
                  className="h-16 w-16 object-contain"
                  loading="lazy"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">
                    {getDisplayName(boss.names)}
                    {boss.shiny && <span className="ml-1 text-yellow-400" title="Shiny disponível">✨</span>}
                  </span>
                  <div className="flex gap-1">
                    {boss.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    CP: {boss.cpRange.min}–{boss.cpRange.max}
                    {' · '}
                    Com clima: {boss.cpRangeBoost.min}–{boss.cpRangeBoost.max}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {levels.length === 0 && (
        <p className="py-10 text-center text-gray-400">Nenhum raid disponível no momento.</p>
      )}
    </div>
  )
}
