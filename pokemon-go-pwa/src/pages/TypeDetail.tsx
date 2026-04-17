import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PokemonCard from '../components/PokemonCard'
import TypeBadge from '../components/TypeBadge'
import { usePokedex } from '../hooks/usePokedex'
import { getBaseStatTotal, getTypeLabel } from '../utils/pokemon'

export default function TypeDetail() {
  const { typeKey = '' } = useParams<{ typeKey: string }>()
  const { data, isLoading, isError } = usePokedex()
  const [sort, setSort] = useState<'dex' | 'bst'>('bst')

  const filtered = useMemo(() => {
    if (!data) return []
    const list = data.filter((pokemon) => pokemon.primaryType.type === typeKey || pokemon.secondaryType?.type === typeKey)
    return [...list].sort((a, b) => {
      if (sort === 'dex') return a.dexNr - b.dexNr
      return getBaseStatTotal(b) - getBaseStatTotal(a)
    })
  }, [data, sort, typeKey])

  if (isLoading) return <p className="py-20 text-center text-slate-400">Carregando página de tipo...</p>
  if (isError) return <p className="py-20 text-center text-red-300">Erro ao carregar esta taxonomia.</p>

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <Link to="/types" className="text-sm text-slate-400 transition hover:text-slate-200">← Voltar para tipos</Link>
            <TypeBadge type={typeKey} />
            <h1 className="text-4xl font-semibold tracking-tight text-white">{getTypeLabel(typeKey)}</h1>
            <p className="max-w-3xl text-slate-300">
              Página de entrada para Pokémon desse tipo, ordenável por força base ou número da Pokédex.
            </p>
          </div>

          <label className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Ordenar por{' '}
            <select value={sort} onChange={(event) => setSort(event.target.value as 'dex' | 'bst')} className="bg-transparent text-white outline-none">
              <option value="bst" className="bg-slate-900">Base stats</option>
              <option value="dex" className="bg-slate-900">Número</option>
            </select>
          </label>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </div>
  )
}
