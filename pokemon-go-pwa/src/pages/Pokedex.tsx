import { useMemo, useState } from 'react'
import PokemonCard from '../components/PokemonCard'
import { GENERATION_LABELS, TYPE_LABELS_PT, TYPE_ORDER } from '../constants/types'
import { usePokedex } from '../hooks/usePokedex'
import { getBaseStatTotal, getDisplayName } from '../utils/pokemon'

type SortMode = 'dex' | 'name' | 'bst'

export default function Pokedex() {
  const { data, isLoading, isError } = usePokedex()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [generationFilter, setGenerationFilter] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('dex')

  const filtered = useMemo(() => {
    if (!data) return []

    const query = search.trim().toLowerCase()
    const list = data.filter((pokemon) => {
      const matchesQuery =
        !query ||
        getDisplayName(pokemon.names).toLowerCase().includes(query) ||
        String(pokemon.dexNr).includes(query)

      const matchesType =
        !typeFilter ||
        pokemon.primaryType.type === typeFilter ||
        pokemon.secondaryType?.type === typeFilter

      const matchesGeneration =
        !generationFilter ||
        String(pokemon.generation) === generationFilter

      return matchesQuery && matchesType && matchesGeneration
    })

    return [...list].sort((a, b) => {
      if (sortMode === 'name') return getDisplayName(a.names).localeCompare(getDisplayName(b.names))
      if (sortMode === 'bst') return getBaseStatTotal(b) - getBaseStatTotal(a)
      return a.dexNr - b.dexNr
    })
  }, [data, generationFilter, search, sortMode, typeFilter])

  if (isLoading) return <p className="py-20 text-center text-slate-400">Carregando Pokédex...</p>
  if (isError) return <p className="py-20 text-center text-red-300">Erro ao carregar a Pokédex.</p>

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Índice principal</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Pokédex</h1>
          <p className="max-w-3xl text-slate-300">
            Busca combinada com filtros por tipo e geração, ordenação por força base e cards mais informativos.
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <input
            type="search"
            placeholder="Buscar por nome ou número"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-red-400/40"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-red-400/40"
          >
            <option value="">Todos os tipos</option>
            {TYPE_ORDER.map((type) => (
              <option key={type} value={type}>{TYPE_LABELS_PT[type]}</option>
            ))}
          </select>

          <select
            value={generationFilter}
            onChange={(event) => setGenerationFilter(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-red-400/40"
          >
            <option value="">Todas as gerações</option>
            {Object.entries(GENERATION_LABELS).map(([generation, label]) => (
              <option key={generation} value={generation}>{label}</option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-red-400/40"
          >
            <option value="dex">Ordenar por número</option>
            <option value="name">Ordenar por nome</option>
            <option value="bst">Ordenar por base stats</option>
          </select>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
        <p>{filtered.length} resultados</p>
        <p>{data?.length ?? 0} Pokémon indexados na base</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </div>
  )
}
