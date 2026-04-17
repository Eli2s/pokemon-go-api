import type { PokemonMove } from '../types/api'
import { calcDps, formatMoveEnergy, getDisplayName } from '../utils/pokemon'
import TypeBadge from './TypeBadge'

interface Props {
  moves: PokemonMove[]
  primaryType: string
  secondaryType: string | null
  title: string
}

export default function MoveTable({ moves, primaryType, secondaryType, title }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {moves.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum ataque disponível</p>
      ) : (
        <div className="overflow-x-auto rounded-[1.5rem] border border-white/8 bg-slate-950/50">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-4 py-3 font-medium">Golpe</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 text-right font-medium">Poder</th>
                <th className="px-4 py-3 text-right font-medium">Energia</th>
                <th className="px-4 py-3 text-right font-medium">DPS</th>
                <th className="px-4 py-3 text-right font-medium">PvP</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move) => {
                const isStab = move.type.type === primaryType || move.type.type === secondaryType
                const dps = calcDps(move, primaryType, secondaryType)

                return (
                  <tr key={move.id} className="border-b border-white/6 text-slate-300 last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={isStab ? 'font-semibold text-white' : 'font-medium'}>{getDisplayName(move.names)}</span>
                        {isStab && <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-[11px] font-semibold text-yellow-300">STAB</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={move.type} />
                    </td>
                    <td className="px-4 py-3 text-right">{move.power}</td>
                    <td className="px-4 py-3 text-right">{formatMoveEnergy(move)}</td>
                    <td className="px-4 py-3 text-right">{dps.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {move.combat ? `${move.combat.power}/${move.combat.turns}T` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
