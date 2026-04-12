import { useState, useMemo } from 'react'
import { usePokedex } from '../hooks/usePokedex'
import PokemonCard from '../components/PokemonCard'
import { getDisplayName } from '../utils/pokemon'
import { TYPE_LABELS_PT } from '../constants/types'

const TYPE_OPTIONS = Object.entries(TYPE_LABELS_PT).map(([key, label]) => ({ key, label }))

export default function Pokedex() {
  const { data, isLoading, isError } = usePokedex()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.toLowerCase()
    return data.filter((p) => {
      const nameMatch =
        !q ||
        getDisplayName(p.names).toLowerCase().includes(q) ||
        String(p.dexNr).includes(q)
      const typeMatch =
        !typeFilter ||
        p.primaryType.type === typeFilter ||
        p.secondaryType?.type === typeFilter
      return nameMatch && typeMatch
    })
  }, [data, search, typeFilter])

  if (isLoading) {
    return <p className="py-10 text-center text-gray-400">Carregando Pokédex...</p>
  }
  if (isError) {
    return <p className="py-10 text-center text-red-500">Erro ao carregar Pokédex.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="search"
          placeholder="Buscar por nome ou número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-800"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">Todos os tipos</option>
          {TYPE_OPTIONS.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} Pokémon</p>

      <div className="flex flex-col gap-2">
        {filtered.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </div>
  )
}
