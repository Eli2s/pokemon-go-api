import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const Pokedex = lazy(() => import('./pages/Pokedex'))
const PokemonDetail = lazy(() => import('./pages/PokemonDetail'))
const Raids = lazy(() => import('./pages/Raids'))

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex-1 py-2 text-center text-sm font-medium transition-colors border-b-2 ${
    isActive
      ? 'border-red-500 text-red-500'
      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
  }`

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 dark:text-white">
      <header className="sticky top-0 z-10 bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-2">
          <span className="text-lg font-bold text-red-500">PokéGO</span>
        </div>
        <nav className="flex border-t border-gray-100 dark:border-gray-700">
          <NavLink to="/pokedex" className={navClass}>Pokédex</NavLink>
          <NavLink to="/raids" className={navClass}>Raids</NavLink>
        </nav>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-4">
        <Suspense fallback={<div className="py-10 text-center text-gray-400">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/pokedex" replace />} />
            <Route path="/pokedex" element={<Pokedex />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/raids" element={<Raids />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
