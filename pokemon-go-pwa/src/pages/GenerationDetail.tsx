import { Link, useParams } from 'react-router-dom'
import PokemonCard from '../components/PokemonCard'
import { usePokedex } from '../hooks/usePokedex'
import { getGenerationLabel } from '../utils/pokemon'

export default function GenerationDetail() {
  const { generation = '' } = useParams<{ generation: string }>()
  const generationNumber = Number(generation)
  const { data, isLoading, isError } = usePokedex()

  if (isLoading) return <p className="py-20 text-center text-slate-400">Carregando geração...</p>
  if (isError || Number.isNaN(generationNumber)) return <p className="py-20 text-center text-red-300">Geração não encontrada.</p>

  const filtered = data?.filter((pokemon) => pokemon.generation === generationNumber) ?? []

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
        <div className="space-y-3">
          <Link to="/generations" className="text-sm text-slate-400 transition hover:text-slate-200">← Voltar para gerações</Link>
          <h1 className="text-4xl font-semibold tracking-tight text-white">{getGenerationLabel(generationNumber)}</h1>
          <p className="max-w-3xl text-slate-300">
            Lista temática para navegação regional, com {filtered.length} entradas indexadas nesta geração.
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
