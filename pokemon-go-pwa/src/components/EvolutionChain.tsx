import { Link } from 'react-router-dom'
import type { Evolution, PokedexEntry } from '../types/api'
import { getDisplayName } from '../utils/pokemon'

interface Props {
  evolutions: Evolution[]
  pokedex?: PokedexEntry[]
}

export default function EvolutionChain({ evolutions, pokedex = [] }: Props) {
  if (evolutions.length === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {evolutions.map((evolution) => {
        const target = pokedex.find((pokemon) => pokemon.id === evolution.id)

        return (
          <Link
            key={`${evolution.id}-${evolution.formId}`}
            to={`/pokemon/${evolution.id}`}
            className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4 transition hover:border-red-400/30 hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              {target?.assets ? (
                <img src={target.assets.image} alt={getDisplayName(target.names)} className="h-16 w-16 object-contain" loading="lazy" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-slate-800" />
              )}
              <div>
                <p className="font-semibold text-white">{target ? getDisplayName(target.names) : evolution.id}</p>
                <p className="text-sm text-slate-400">Forma {evolution.formId}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>{evolution.candies} balas</p>
              {evolution.item && <p>Item: {getDisplayName(evolution.item.names)}</p>}
              {evolution.quests.length > 0 && (
                <p>Condição: {evolution.quests.map((quest) => getDisplayName(quest.names)).join(', ')}</p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
