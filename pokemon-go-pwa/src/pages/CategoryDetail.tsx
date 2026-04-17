import { Link, useParams } from 'react-router-dom'
import PokemonCard from '../components/PokemonCard'
import { CATEGORY_LABELS } from '../constants/types'
import { usePokedex } from '../hooks/usePokedex'
import { getPokemonCategory } from '../utils/pokemon'

export default function CategoryDetail() {
  const { category = '' } = useParams<{ category: string }>()
  const { data, isLoading, isError } = usePokedex()

  if (isLoading) return <p className="py-20 text-center text-slate-400">Carregando categoria...</p>
  if (isError || !CATEGORY_LABELS[category]) return <p className="py-20 text-center text-red-300">Categoria não encontrada.</p>

  const filtered = data?.filter((pokemon) => getPokemonCategory(pokemon) === category) ?? []

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
        <div className="space-y-3">
          <Link to="/categories" className="text-sm text-slate-400 transition hover:text-slate-200">← Voltar para categorias</Link>
          <h1 className="text-4xl font-semibold tracking-tight text-white">{CATEGORY_LABELS[category]}</h1>
          <p className="max-w-3xl text-slate-300">
            Página temática com {filtered.length} entradas agrupadas nesta categoria.
          </p>
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
