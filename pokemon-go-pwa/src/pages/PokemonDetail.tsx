import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EvolutionChain from '../components/EvolutionChain'
import MoveTable from '../components/MoveTable'
import StatBar from '../components/StatBar'
import TypeBadge from '../components/TypeBadge'
import { usePokedex } from '../hooks/usePokedex'
import { usePokemon } from '../hooks/usePokemon'
import {
  formatMultiplier,
  getBaseStatTotal,
  getBestMoveset,
  getDisplayName,
  getGenerationLabel,
  getPokemonClassLabel,
  getTypeMatchups,
} from '../utils/pokemon'

type Tab = 'overview' | 'moves' | 'evolutions'

const STAT_MAX = { stamina: 500, attack: 400, defense: 400 }

export default function PokemonDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: pokemon, isLoading, isError } = usePokemon(id ?? '')
  const { data: pokedex } = usePokedex()
  const [tab, setTab] = useState<Tab>('overview')

  const relatedPokemon = useMemo(() => {
    if (!pokemon || !pokedex) return []
    return pokedex
      .filter((entry) => entry.id !== pokemon.id && entry.primaryType.type === pokemon.primaryType.type)
      .slice(0, 4)
  }, [pokedex, pokemon])

  if (isLoading) return <p className="py-20 text-center text-slate-400">Carregando detalhe do Pokémon...</p>
  if (isError || !pokemon) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-300">Pokémon não encontrado.</p>
        <Link to="/pokedex" className="mt-3 inline-block text-sm text-red-200 underline">Voltar para a Pokédex</Link>
      </div>
    )
  }

  const primaryType = pokemon.primaryType.type
  const secondaryType = pokemon.secondaryType?.type ?? null
  const quickMoves = Object.values(pokemon.quickMoves)
  const chargedMoves = Object.values(pokemon.cinematicMoves)
  const eliteQuick = Object.values(pokemon.eliteQuickMoves)
  const eliteCharged = Object.values(pokemon.eliteCinematicMoves)
  const typeMatchups = getTypeMatchups(pokemon)
  const bestMoveset = getBestMoveset(pokemon)
  const totalStats = getBaseStatTotal(pokemon)
  const classLabel = getPokemonClassLabel(pokemon.pokemonClass)

  const tabClass = (currentTab: Tab) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      tab === currentTab
        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
    }`

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 lg:p-8">
        <Link to="/pokedex" className="text-sm text-slate-400 transition hover:text-slate-200">← Voltar para a Pokédex</Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">#{String(pokemon.dexNr).padStart(3, '0')} · {getGenerationLabel(pokemon.generation)}</p>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">{getDisplayName(pokemon.names)}</h1>
              {classLabel && <p className="mt-2 text-sm font-medium text-yellow-300">{classLabel}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={pokemon.primaryType} />
              {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <InfoBox label="Base stats" value={String(totalStats)} />
              <InfoBox label="Melhor moveset" value={bestMoveset.quick && bestMoveset.charged ? `${getDisplayName(bestMoveset.quick.names)} + ${getDisplayName(bestMoveset.charged.names)}` : '—'} />
              <InfoBox label="Formas especiais" value={`${pokemon.hasMegaEvolution ? 'Mega ' : ''}${pokemon.hasGigantamaxEvolution ? 'Gigantamax' : ''}`.trim() || 'Nenhuma'} />
            </div>
          </div>

          <div className="flex items-center justify-center rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_55%)] p-6">
            {pokemon.assets ? (
              <img
                src={pokemon.assets.image}
                alt={getDisplayName(pokemon.names)}
                className="h-64 w-64 object-contain drop-shadow-[0_30px_60px_rgba(248,113,113,0.2)]"
              />
            ) : (
              <div className="h-64 w-64 rounded-full bg-slate-800" />
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button className={tabClass('overview')} onClick={() => setTab('overview')}>Visão geral</button>
        <button className={tabClass('moves')} onClick={() => setTab('moves')}>Ataques</button>
        <button className={tabClass('evolutions')} onClick={() => setTab('evolutions')}>Evoluções</button>
      </div>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Stats base</h2>
            {pokemon.stats ? (
              <div className="mt-5 space-y-4">
                <StatBar label="Ataque" value={pokemon.stats.attack} max={STAT_MAX.attack} />
                <StatBar label="Defesa" value={pokemon.stats.defense} max={STAT_MAX.defense} />
                <StatBar label="HP" value={pokemon.stats.stamina} max={STAT_MAX.stamina} />
              </div>
            ) : (
              <p className="mt-4 text-slate-400">Stats indisponíveis.</p>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Matchups de tipo</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Fraquezas</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {typeMatchups.weaknesses.slice(0, 8).map((entry) => (
                    <div key={entry.type} className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2">
                      <TypeBadge type={entry.type} />
                      <span className="text-sm text-red-100">{formatMultiplier(entry.multiplier)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Resistências</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {typeMatchups.resistances.slice(0, 8).map((entry) => (
                    <div key={entry.type} className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
                      <TypeBadge type={entry.type} />
                      <span className="text-sm text-emerald-100">{formatMultiplier(entry.multiplier)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 lg:col-span-2">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Leitura rápida</h2>
                <p className="mt-2 text-slate-400">Resumo útil para raids e exploração no portal.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <InsightCard
                title="Melhor set ofensivo"
                body={
                  bestMoveset.quick && bestMoveset.charged
                    ? `${getDisplayName(bestMoveset.quick.names)} + ${getDisplayName(bestMoveset.charged.names)}`
                    : 'Sem combinação calculada'
                }
              />
              <InsightCard
                title="Tipos que mais punem"
                body={typeMatchups.weaknesses.slice(0, 2).map((entry) => entry.label).join(', ') || 'Nenhum destaque'}
              />
              <InsightCard
                title="Relacionados"
                body={relatedPokemon.map((entry) => getDisplayName(entry.names)).join(', ') || 'Sem relacionados'}
              />
            </div>
          </section>
        </div>
      )}

      {tab === 'moves' && (
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <div className="space-y-6">
            <MoveTable moves={quickMoves} primaryType={primaryType} secondaryType={secondaryType} title="Ataques rápidos" />
            <MoveTable moves={chargedMoves} primaryType={primaryType} secondaryType={secondaryType} title="Ataques carregados" />
            {eliteQuick.length > 0 && (
              <MoveTable moves={eliteQuick} primaryType={primaryType} secondaryType={secondaryType} title="Ataques rápidos Elite" />
            )}
            {eliteCharged.length > 0 && (
              <MoveTable moves={eliteCharged} primaryType={primaryType} secondaryType={secondaryType} title="Ataques carregados Elite" />
            )}
          </div>
        </section>
      )}

      {tab === 'evolutions' && (
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold text-white">Linha evolutiva</h2>
          <div className="mt-5">
            {pokemon.evolutions.length > 0 ? (
              <EvolutionChain evolutions={pokemon.evolutions} pokedex={pokedex} />
            ) : (
              <p className="text-slate-400">Este Pokémon não possui evoluções listadas.</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  )
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 font-medium text-white">{body}</p>
    </div>
  )
}
