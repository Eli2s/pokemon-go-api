import { Link } from 'react-router-dom'
import type { Evolution } from '../types/api'

interface Props {
  evolutions: Evolution[]
}

export default function EvolutionChain({ evolutions }: Props) {
  if (evolutions.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {evolutions.map((evo) => (
        <div key={evo.id} className="flex items-center gap-2">
          <div className="flex flex-col items-center text-xs text-gray-400">
            <span>→</span>
            <span>{evo.candies} balas</span>
            {evo.item && (
              <span className="text-yellow-500">{evo.item.names.English}</span>
            )}
          </div>
          <Link
            to={`/pokemon/${evo.id}`}
            className="rounded-lg bg-white p-2 text-center text-sm font-medium shadow-sm hover:shadow-md dark:bg-gray-800"
          >
            {evo.id}
          </Link>
        </div>
      ))}
    </div>
  )
}
