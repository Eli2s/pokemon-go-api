import { Link } from 'react-router-dom'
import type { PokedexEntry } from '../types/api'
import { getBaseStatTotal, getDisplayName, getGenerationLabel, getTypeComboLabel } from '../utils/pokemon'
import TypeBadge from './TypeBadge'

interface Props {
  pokemon: PokedexEntry
}

export default function PokemonCard({ pokemon }: Props) {
  const num = String(pokemon.dexNr).padStart(3, '0')
  const baseStats = getBaseStatTotal(pokemon)

  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      className="group rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">#{num}</p>
          <h3 className="mt-2 text-lg font-semibold text-white transition group-hover:text-red-200">
            {getDisplayName(pokemon.names)}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{getGenerationLabel(pokemon.generation)}</p>
        </div>
        {pokemon.assets ? (
          <img
            src={pokemon.assets.image}
            alt={getDisplayName(pokemon.names)}
            className="h-20 w-20 object-contain drop-shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
            loading="lazy"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-slate-800" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        <TypeBadge type={pokemon.primaryType} />
        {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-white/5 p-3 text-sm">
        <div>
          <p className="text-slate-500">Combinação</p>
          <p className="mt-1 font-medium text-slate-200">{getTypeComboLabel(pokemon)}</p>
        </div>
        <div>
          <p className="text-slate-500">Base stats</p>
          <p className="mt-1 font-medium text-slate-200">{baseStats}</p>
        </div>
      </div>
    </Link>
  )
}
