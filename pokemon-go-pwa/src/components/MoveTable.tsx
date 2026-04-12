import type { PokemonMove } from '../types/api'
import { getDisplayName, calcDps } from '../utils/pokemon'
import TypeBadge from './TypeBadge'

interface Props {
  moves: PokemonMove[]
  primaryType: string
  secondaryType: string | null
  title: string
}

export default function MoveTable({ moves, primaryType, secondaryType, title }: Props) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {moves.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum ataque disponível</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <th className="pb-1 font-medium">Nome</th>
              <th className="pb-1 font-medium">Tipo</th>
              <th className="pb-1 text-right font-medium">Poder</th>
              <th className="pb-1 text-right font-medium">DPS</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => {
              const isStab =
                move.type.type === primaryType || move.type.type === secondaryType
              const dps = calcDps(move, primaryType, secondaryType)
              return (
                <tr
                  key={move.id}
                  className={`border-b border-gray-100 dark:border-gray-800 ${isStab ? 'font-semibold' : ''}`}
                >
                  <td className="py-1.5">
                    {getDisplayName(move.names)}
                    {isStab && (
                      <span className="ml-1 text-xs text-yellow-500" title="STAB">★</span>
                    )}
                  </td>
                  <td className="py-1.5">
                    <TypeBadge type={move.type} />
                  </td>
                  <td className="py-1.5 text-right">{move.power}</td>
                  <td className="py-1.5 text-right">{dps.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
