import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePokemon } from '../hooks/usePokemon'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import MoveTable from '../components/MoveTable'
import EvolutionChain from '../components/EvolutionChain'
import { getDisplayName } from '../utils/pokemon'
import { CLASS_LABELS_PT } from '../constants/types'

const STAT_MAX = { stamina: 500, attack: 400, defense: 400 }

type Tab = 'stats' | 'moves' | 'evolutions'

export default function PokemonDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: pokemon, isLoading, isError } = usePokemon(id ?? '')
  const [tab, setTab] = useState<Tab>('stats')

  if (isLoading) {
    return <p className="py-10 text-center text-gray-400">Carregando...</p>
  }
  if (isError || !pokemon) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-500">Pokémon não encontrado.</p>
        <Link to="/pokedex" className="mt-2 inline-block text-sm text-red-400 underline">
          Voltar ao Pokédex
        </Link>
      </div>
    )
  }

  const num = String(pokemon.dexNr).padStart(3, '0')
  const primaryType = pokemon.primaryType.type
  const secondaryType = pokemon.secondaryType?.type ?? null

  const quickMoves = Object.values(pokemon.quickMoves)
  const cinematicMoves = Object.values(pokemon.cinematicMoves)
  const eliteQuick = Object.values(pokemon.eliteQuickMoves)
  const eliteCinematic = Object.values(pokemon.eliteCinematicMoves)

  const tabClass = (t: Tab) =>
    `flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? 'border-red-500 text-red-500'
        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
    }`

  return (
    <div className="flex flex-col gap-4">
      {/* Back */}
      <Link to="/pokedex" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        ← Pokédex
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        {pokemon.assets ? (
          <img
            src={pokemon.assets.image}
            alt={getDisplayName(pokemon.names)}
            className="h-24 w-24 object-contain"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700" />
        )}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">#{num}</span>
          <h1 className="text-xl font-bold">{getDisplayName(pokemon.names)}</h1>
          <div className="flex gap-1">
            <TypeBadge type={pokemon.primaryType} />
            {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
          </div>
          {pokemon.pokemonClass && (
            <span className="text-xs text-yellow-500">
              {CLASS_LABELS_PT[pokemon.pokemonClass] ?? pokemon.pokemonClass}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button className={tabClass('stats')} onClick={() => setTab('stats')}>Stats</button>
        <button className={tabClass('moves')} onClick={() => setTab('moves')}>Ataques</button>
        <button className={tabClass('evolutions')} onClick={() => setTab('evolutions')}>Evoluções</button>
      </div>

      {/* Tab content */}
      {tab === 'stats' && pokemon.stats && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <StatBar label="HP" value={pokemon.stats.stamina} max={STAT_MAX.stamina} />
          <StatBar label="Ataque" value={pokemon.stats.attack} max={STAT_MAX.attack} />
          <StatBar label="Defesa" value={pokemon.stats.defense} max={STAT_MAX.defense} />
        </div>
      )}

      {tab === 'moves' && (
        <div className="flex flex-col gap-6 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <MoveTable moves={quickMoves} primaryType={primaryType} secondaryType={secondaryType} title="Ataques Rápidos" />
          <MoveTable moves={cinematicMoves} primaryType={primaryType} secondaryType={secondaryType} title="Ataques Cinematográficos" />
          {eliteQuick.length > 0 && (
            <MoveTable moves={eliteQuick} primaryType={primaryType} secondaryType={secondaryType} title="Ataques Rápidos Elite" />
          )}
          {eliteCinematic.length > 0 && (
            <MoveTable moves={eliteCinematic} primaryType={primaryType} secondaryType={secondaryType} title="Ataques Cinematográficos Elite" />
          )}
        </div>
      )}

      {tab === 'evolutions' && (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          {pokemon.evolutions.length > 0 ? (
            <EvolutionChain evolutions={pokemon.evolutions} />
          ) : (
            <p className="text-sm text-gray-400">Sem evoluções.</p>
          )}
        </div>
      )}
    </div>
  )
}
