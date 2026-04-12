import { Link } from 'react-router-dom'
import type { PokedexEntry } from '../types/api'
import { getDisplayName } from '../utils/pokemon'
import TypeBadge from './TypeBadge'

interface Props {
  pokemon: PokedexEntry
}

export default function PokemonCard({ pokemon }: Props) {
  const num = String(pokemon.dexNr).padStart(3, '0')

  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-gray-800"
    >
      {pokemon.assets ? (
        <img
          src={pokemon.assets.image}
          alt={getDisplayName(pokemon.names)}
          className="h-16 w-16 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700" />
      )}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">#{num}</span>
        <span className="font-semibold">{getDisplayName(pokemon.names)}</span>
        <div className="flex gap-1">
          <TypeBadge type={pokemon.primaryType} />
          {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
        </div>
      </div>
    </Link>
  )
}
