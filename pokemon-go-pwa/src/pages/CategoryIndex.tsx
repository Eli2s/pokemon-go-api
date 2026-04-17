import { Link } from 'react-router-dom'
import { usePokedex } from '../hooks/usePokedex'
import { CATEGORY_LABELS } from '../constants/types'
import { getPokemonCategory } from '../utils/pokemon'

export default function CategoryIndex() {
  const { data } = usePokedex()
  const categories = Object.entries(CATEGORY_LABELS).filter(([key]) => key !== 'regular')

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Categorias editoriais</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Listas especiais</h1>
        <p className="max-w-3xl text-slate-300">
          Estruturei entradas temáticas para aproximar o produto de um hub: lendários, míticos, mega evoluções e mais.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map(([key, label]) => (
          <Link
            key={key}
            to={`/categories/${key}`}
            className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 transition hover:-translate-y-0.5 hover:border-red-400/30"
          >
            <p className="text-sm text-slate-400">Curadoria</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{label}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {data?.filter((pokemon) => getPokemonCategory(pokemon) === key).length ?? 0} entradas agrupadas.
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
