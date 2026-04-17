import { Link } from 'react-router-dom'
import { usePokedex } from '../hooks/usePokedex'
import { getGenerationLabel } from '../utils/pokemon'

export default function GenerationIndex() {
  const { data } = usePokedex()

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Índice de gerações</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Pokémon por geração</h1>
        <p className="max-w-3xl text-slate-300">
          Navegação temática para replicar a sensação de banco de dados organizado por regiões.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => index + 1).map((generation) => (
          <Link
            key={generation}
            to={`/generations/${generation}`}
            className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 transition hover:-translate-y-0.5 hover:border-red-400/30"
          >
            <p className="text-sm text-slate-400">Linha temporal</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{getGenerationLabel(generation)}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {data?.filter((pokemon) => pokemon.generation === generation).length ?? 0} entradas indexadas.
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
