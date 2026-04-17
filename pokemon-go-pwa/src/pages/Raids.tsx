import { Link } from 'react-router-dom'
import TypeBadge from '../components/TypeBadge'
import { RAID_LEVEL_LABELS } from '../constants/types'
import { useRaids } from '../hooks/useRaids'
import { getDisplayName } from '../utils/pokemon'
import type { RaidLevel } from '../types/api'

const LEVEL_ORDER: RaidLevel[] = [
  'legendary_mega',
  'mega',
  'ultra_beast',
  'lvl5',
  'lvl3',
  'lvl1',
  'shadow_lvl5',
  'shadow_lvl3',
  'shadow_lvl1',
  'ex',
]

export default function Raids() {
  const { data, isLoading, isError } = useRaids()

  if (isLoading) return <p className="py-20 text-center text-slate-400">Carregando raids...</p>
  if (isError || !data) return <p className="py-20 text-center text-red-300">Erro ao carregar raids.</p>

  const levels = LEVEL_ORDER.filter((level) => data.currentList[level]?.length > 0)

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Conteúdo ao vivo</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Chefes de raid</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Agrupamento por tier, leitura rápida de tipos e CP base, com cards conectando diretamente ao detalhe do Pokémon.
        </p>
      </header>

      {levels.map((level) => (
        <section key={level} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">{RAID_LEVEL_LABELS[level] ?? level}</h2>
            <p className="text-sm text-slate-400">{data.currentList[level].length} chefes</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.currentList[level].map((boss) => (
              <Link
                key={`${boss.id}-${boss.form}-${boss.costume ?? ''}`}
                to={`/pokemon/${boss.id}`}
                className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-0.5 hover:border-red-400/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{RAID_LEVEL_LABELS[level] ?? level}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{getDisplayName(boss.names)}</h3>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {boss.types.map((type) => (
                        <TypeBadge key={type} type={type} />
                      ))}
                    </div>
                  </div>

                  <img src={boss.assets.image} alt={getDisplayName(boss.names)} className="h-24 w-24 object-contain" loading="lazy" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-white/5 p-3 text-sm">
                  <div>
                    <p className="text-slate-500">CP</p>
                    <p className="mt-1 font-medium text-white">{boss.cpRange.min}–{boss.cpRange.max}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Clima</p>
                    <p className="mt-1 font-medium text-white">{boss.cpRangeBoost.min}–{boss.cpRangeBoost.max}</p>
                  </div>
                </div>

                {boss.shiny && (
                  <p className="mt-4 inline-flex rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                    Shiny disponível
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
