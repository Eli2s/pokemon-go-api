import { Link } from 'react-router-dom'
import TypeBadge from '../components/TypeBadge'
import { TYPE_ORDER } from '../constants/types'
import { usePokedex } from '../hooks/usePokedex'
import { getTypeLabel } from '../utils/pokemon'

export default function TypeIndex() {
  const { data } = usePokedex()

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Índice de tipos</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Pokémon por tipo</h1>
        <p className="max-w-3xl text-slate-300">
          Cada página de tipo virou uma porta de entrada da database: contagem, ranking e acesso rápido aos detalhes.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TYPE_ORDER.map((type) => {
          const count = data?.filter((pokemon) => pokemon.primaryType.type === type || pokemon.secondaryType?.type === type).length ?? 0

          return (
            <Link
              key={type}
              to={`/types/${type}`}
              className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 transition hover:-translate-y-0.5 hover:border-red-400/30"
            >
              <TypeBadge type={type} />
              <h2 className="mt-4 text-2xl font-semibold text-white">{getTypeLabel(type)}</h2>
              <p className="mt-2 text-sm text-slate-400">{count} Pokémon com esse tipo na combinação principal ou secundária.</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
