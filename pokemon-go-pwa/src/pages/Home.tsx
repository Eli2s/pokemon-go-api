import { Link } from 'react-router-dom'
import PokemonCard from '../components/PokemonCard'
import TypeBadge from '../components/TypeBadge'
import { TYPE_ORDER } from '../constants/types'
import { usePokedex } from '../hooks/usePokedex'
import { useRaids } from '../hooks/useRaids'
import { getCategoryLabel, getDisplayName, getGenerationLabel, getTopPokemonByStat } from '../utils/pokemon'

const QUICK_LINKS = [
  { title: 'Pokédex completa', href: '/pokedex', copy: 'Busca por nome, número, geração e ordenação.' },
  { title: 'Explorar por tipo', href: '/types', copy: 'Abra listas detalhadas por tipo e matchup.' },
  { title: 'Raids atuais', href: '/raids', copy: 'Veja os chefes ativos com tiers e CP.' },
]

export default function Home() {
  const { data: pokedex, isLoading: loadingPokedex } = usePokedex()
  const { data: raids, isLoading: loadingRaids } = useRaids()

  const totalPokemon = pokedex?.length ?? 0
  const generations = pokedex ? new Set(pokedex.map((pokemon) => pokemon.generation)).size : 0
  const topPokemon = pokedex ? getTopPokemonByStat(pokedex, 6) : []
  const raidPreview = raids
    ? Object.values(raids.currentList).flat().slice(0, 6)
    : []

  const categoryCounts = pokedex
    ? {
        legendary: pokedex.filter((pokemon) => pokemon.pokemonClass === 'POKEMON_CLASS_LEGENDARY').length,
        mythic: pokedex.filter((pokemon) => pokemon.pokemonClass === 'POKEMON_CLASS_MYTHIC').length,
        ultra_beast: pokedex.filter((pokemon) => pokemon.pokemonClass === 'POKEMON_CLASS_ULTRA_BEAST').length,
        mega: pokedex.filter((pokemon) => pokemon.hasMegaEvolution).length,
      }
    : null

  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1 text-sm font-medium text-red-200">
            Banco de dados Pokémon GO em português
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white lg:text-6xl">
              Uma home de database, não só uma lista de cards.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Seu PWA agora pode funcionar como portal exploratório: taxonomias por geração, tipo e categoria,
              atalhos para raids e páginas de detalhe com leitura mais próxima de um hub.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/pokedex" className="rounded-full bg-red-500 px-5 py-3 font-medium text-white transition hover:bg-red-400">
              Abrir Pokédex
            </Link>
            <Link to="/types" className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/10">
              Explorar por tipo
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatTile label="Pokémon indexados" value={loadingPokedex ? '...' : String(totalPokemon)} copy="Lista carregada da API pública." />
          <StatTile label="Gerações" value={loadingPokedex ? '...' : String(generations)} copy="De Kanto a Paldea." />
          <StatTile label="Chefes de raid" value={loadingRaids ? '...' : String(raidPreview.length)} copy="Prévia das raids atuais." />
          <StatTile
            label="Categorias editoriais"
            value={categoryCounts ? '4+' : '...'}
            copy={categoryCounts ? `${categoryCounts.legendary} lendários, ${categoryCounts.mythic} míticos.` : 'Listas temáticas prontas.'}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-slate-900"
          >
            <p className="text-xl font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.copy}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Destaques</p>
              <h2 className="text-2xl font-semibold text-white">Maior total de base stats</h2>
            </div>
            <Link to="/pokedex" className="text-sm text-red-300 transition hover:text-red-200">Ver ranking completo</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topPokemon.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ao vivo</p>
              <h2 className="text-2xl font-semibold text-white">Raids em destaque</h2>
            </div>
            <Link to="/raids" className="text-sm text-red-300 transition hover:text-red-200">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {raidPreview.map((boss) => (
              <Link
                key={`${boss.id}-${boss.form}-${boss.level}`}
                to={`/pokemon/${boss.id}`}
                className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 transition hover:border-red-400/30 hover:bg-white/8"
              >
                <img src={boss.assets.image} alt={getDisplayName(boss.names)} className="h-16 w-16 object-contain" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{getDisplayName(boss.names)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {boss.types.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">CP {boss.cpRange.min}–{boss.cpRange.max}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Entradas</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Explorar por geração</h2>
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((generation) => (
              <Link
                key={generation}
                to={`/generations/${generation}`}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 transition hover:border-red-400/30 hover:bg-white/8"
              >
                <span className="font-medium text-white">{getGenerationLabel(generation)}</span>
                <span className="text-sm text-slate-400">
                  {pokedex?.filter((pokemon) => pokemon.generation === generation).length ?? 0} entradas
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Taxonomias</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Tipos e categorias</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {TYPE_ORDER.map((type) => (
              <Link key={type} to={`/types/${type}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-red-400/30 hover:bg-white/10">
                <TypeBadge type={type} />
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {(['legendary', 'mythic', 'ultra_beast', 'mega'] as const).map((category) => (
              <Link
                key={category}
                to={`/categories/${category}`}
                className="rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:border-red-400/30 hover:bg-white/8"
              >
                <p className="font-semibold text-white">{getCategoryLabel(category)}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {categoryCounts
                    ? `${categoryCounts[category] ?? 0} entradas com curadoria inicial`
                    : 'Carregando contagem...'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function StatTile({ label, value, copy }: { label: string; value: string; copy: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
    </div>
  )
}
