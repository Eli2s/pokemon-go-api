import { lazy, Suspense } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Pokedex = lazy(() => import('./pages/Pokedex'))
const PokemonDetail = lazy(() => import('./pages/PokemonDetail'))
const Raids = lazy(() => import('./pages/Raids'))
const TypeIndex = lazy(() => import('./pages/TypeIndex'))
const TypeDetail = lazy(() => import('./pages/TypeDetail'))
const GenerationIndex = lazy(() => import('./pages/GenerationIndex'))
const GenerationDetail = lazy(() => import('./pages/GenerationDetail'))
const CategoryIndex = lazy(() => import('./pages/CategoryIndex'))
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'))

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0f172a_38%,_#020617_100%)] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <NavLink to="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/15 text-lg font-bold text-red-300">
                PG
              </span>
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">PokéGO Database</p>
                <p className="text-xs text-slate-400">Portal brasileiro para raids, Pokédex e taxonomias</p>
              </div>
            </NavLink>
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavLink to="/" end className={navClass}>Início</NavLink>
            <NavLink to="/pokedex" className={navClass}>Pokédex</NavLink>
            <NavLink to="/types" className={navClass}>Tipos</NavLink>
            <NavLink to="/generations" className={navClass}>Gerações</NavLink>
            <NavLink to="/categories" className={navClass}>Categorias</NavLink>
            <NavLink to="/raids" className={navClass}>Raids</NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <Suspense fallback={<div className="py-24 text-center text-slate-400">Carregando database...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokedex" element={<Pokedex />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/raids" element={<Raids />} />
            <Route path="/types" element={<TypeIndex />} />
            <Route path="/types/:typeKey" element={<TypeDetail />} />
            <Route path="/generations" element={<GenerationIndex />} />
            <Route path="/generations/:generation" element={<GenerationDetail />} />
            <Route path="/categories" element={<CategoryIndex />} />
            <Route path="/categories/:category" element={<CategoryDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between">
          <p>Dados públicos do projeto pokemon-go-api, reorganizados em formato de portal.</p>
          <p>Pokémon e Pokémon GO pertencem aos seus respectivos proprietários.</p>
        </div>
      </footer>
    </div>
  )
}
