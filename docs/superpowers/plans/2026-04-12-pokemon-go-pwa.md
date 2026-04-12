# Pokemon GO PWA Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React PWA installable on Android/iOS that replicates Pokemon GO Hub's Pokédex experience in Brazilian Portuguese, consuming the existing GitHub Pages API.

**Architecture:** Single-page React 18 + TypeScript app using Vite as build tool, React Router for navigation, TanStack Query for API caching, Tailwind CSS for styling, and vite-plugin-pwa for offline/install support. The PHP API is patched first to emit PT-BR names from the holoholo-text repo. The PWA lives at `pokemon-go-pwa/` inside the existing repo and is deployed to GitHub Pages.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS (darkMode: media), React Router v6, TanStack Query v5, vite-plugin-pwa (Workbox), Vitest + React Testing Library, Lucide React

---

## Chunk 1: PHP API Fix + Project Scaffold

### Task 1: Add Brazilian Portuguese to the PHP API

**Files:**
- Modify: `src/IO/GithubLoader.php`
- Modify: `src/Parser/TranslationParser.php`

- [ ] **Step 1: Add BrazilianPortuguese to GithubLoader.php**

Open `src/IO/GithubLoader.php`. In the `AVAILABLE_TEXT_REPOS` constant, both `filesRemote` and `filesApk` arrays need a new entry. Current `filesRemote` ends with `'Spanish' => 'Remote/Spanish/es-es_formatted.txt'`. Add after it:

```php
// In filesRemote:
'BrazilianPortuguese' => 'Remote/Brazilian Portuguese/pt-br_formatted.txt',

// In filesApk:
'BrazilianPortuguese' => 'Release/Brazilian Portuguese/pt-br_formatted.txt',
```

The full updated constant block in `GithubLoader.php` (lines ~24-47):
```php
private const AVAILABLE_TEXT_REPOS = [
    [
        'owner' => 'sora10pls',
        'repo' => 'holoholo-text',
        'filesRemote' => [
            'English' => 'Remote/English/en-us_formatted.txt',
            'German' => 'Remote/German/de-de_formatted.txt',
            'French' => 'Remote/French/fr-fr_formatted.txt',
            'Italian' => 'Remote/Italian/it-it_formatted.txt',
            'Japanese' => 'Remote/Japanese/ja-jp_formatted.txt',
            'Korean' => 'Remote/Korean/ko-kr_formatted.txt',
            'Spanish' => 'Remote/Spanish/es-es_formatted.txt',
            'BrazilianPortuguese' => 'Remote/Brazilian Portuguese/pt-br_formatted.txt',
        ],
        'filesApk' => [
            'English' => 'Release/English/en-us_formatted.txt',
            'German' => 'Release/German/de-de_formatted.txt',
            'French' => 'Release/French/fr-fr_formatted.txt',
            'Italian' => 'Release/Italian/it-it_formatted.txt',
            'Japanese' => 'Release/Japanese/ja-jp_formatted.txt',
            'Korean' => 'Release/Korean/ko-kr_formatted.txt',
            'Spanish' => 'Release/Spanish/es-es_formatted.txt',
            'BrazilianPortuguese' => 'Release/Brazilian Portuguese/pt-br_formatted.txt',
        ],
    ],
];
```

- [ ] **Step 2: Add BRAZILIAN_PORTUGUESE constant to TranslationParser.php**

Open `src/Parser/TranslationParser.php`. After line 35 (`public const SPANISH = 'Spanish';`), add:

```php
public const BRAZILIAN_PORTUGUESE = 'BrazilianPortuguese';
```

Then add it to the `LANGUAGES` array (after `self::SPANISH`):

```php
public const LANGUAGES = [
    self::ENGLISH,
    self::GERMAN,
    self::FRENCH,
    self::ITALIAN,
    self::JAPANESE,
    self::KOREAN,
    self::SPANISH,
    self::BRAZILIAN_PORTUGUESE,
];
```

- [ ] **Step 3: Run the PHP build to regenerate the API JSON**

From the repo root (requires PHP 8.1+ and Composer installed):

```bash
composer install
composer run-script api-build
```

Expected: the build runs without errors. The generated JSON files in `public/api/` will now include `BrazilianPortuguese` keys in all `names` objects.

Verify: grep for BrazilianPortuguese in any generated pokemon JSON:
```bash
grep -o '"BrazilianPortuguese":"[^"]*"' public/api/pokedex/id/1.json | head -3
```
Expected output: `"BrazilianPortuguese":"Bulbasaur"` (or similar PT-BR name)

- [ ] **Step 4: Commit the PHP API fix**

```bash
git add src/IO/GithubLoader.php src/Parser/TranslationParser.php
git commit -m "feat: add Brazilian Portuguese language to API"
```

---

### Task 2: Scaffold the React PWA project

**Files:**
- Create: `pokemon-go-pwa/` (entire folder tree)

- [ ] **Step 1: Create the Vite + React + TypeScript project**

From the repo root:

```bash
npm create vite@latest pokemon-go-pwa -- --template react-ts
cd pokemon-go-pwa
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install
npm install react-router-dom @tanstack/react-query lucide-react
npm install -D vite-plugin-pwa
npm install -D tailwindcss @tailwindcss/vite
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Tailwind**

Tailwind v4 (installed via `@tailwindcss/vite`) uses a CSS-first config — **no `tailwind.config.ts` file needed**. Dark mode via `prefers-color-scheme` is the default v4 behavior; no explicit setting required.

Replace the contents of `pokemon-go-pwa/src/index.css` with:

```css
@import "tailwindcss";
```

That single line is the complete Tailwind setup for v4. Delete any `tailwind.config.ts` the scaffold may have generated.

- [ ] **Step 4: Configure Vitest**

Replace the entire `pokemon-go-pwa/vite.config.ts` with the final merged version (PWA plugin + test config together):

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/pokemon-go-api/pokemon-go-pwa/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pokédex GO',
        short_name: 'PokédexGO',
        description: 'Pokédex completa para Pokemon GO',
        start_url: '/pokemon-go-api/pokemon-go-pwa/',
        scope: '/pokemon-go-api/pokemon-go-pwa/',
        theme_color: '#EE1515',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'pt-BR',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/pokemon-go-api\.github\.io\/pokemon-go-api\/api\/pokedex\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'pokedex-list' },
          },
          {
            urlPattern: /^https:\/\/pokemon-go-api\.github\.io\/pokemon-go-api\/api\/pokedex\/id\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-detail',
              expiration: { maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /^https:\/\/pokemon-go-api\.github\.io\/pokemon-go-api\/api\/raidboss\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'raid-bosses' },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-images',
              expiration: { maxEntries: 1000, maxAgeSeconds: 604800 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Create `pokemon-go-pwa/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom'
```

Update `pokemon-go-pwa/package.json` scripts section:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Create PWA icon placeholders**

Install `pngjs` (pure-JS PNG encoder, no native binaries) as a temporary dev dependency, generate both icons, then create the folder and files (run from `pokemon-go-pwa/`):

```bash
npm install -D pngjs
mkdir -p public/icons
node --input-type=commonjs -e "
const PNG = require('pngjs').PNG;
const fs = require('fs');

function makeIcon(size, filename) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) * 4;
      png.data[i]   = 238; // R (#EE1515)
      png.data[i+1] = 21;  // G
      png.data[i+2] = 21;  // B
      png.data[i+3] = 255; // A
    }
  }
  fs.writeFileSync(filename, PNG.sync.write(png));
  console.log('Created', filename);
}

makeIcon(192, 'public/icons/icon-192.png');
makeIcon(512, 'public/icons/icon-512.png');
"
```

Expected output:
```
Created public/icons/icon-192.png
Created public/icons/icon-512.png
```

These are solid red (#EE1515) placeholder icons. They satisfy the PWA install requirement. Replace with proper artwork before a public release.

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts at `http://localhost:5173`. Default React app appears in browser.

- [ ] **Step 7: Commit scaffold**

```bash
cd ..
git add pokemon-go-pwa/
git commit -m "feat: scaffold React PWA project with Vite, Tailwind, TanStack Query"
```

---

## Chunk 2: Types, Constants, Services, and Hooks

### Task 3: TypeScript types

**Files:**
- Create: `pokemon-go-pwa/src/types/api.ts`

- [ ] **Step 1: Write the type definitions**

Create `pokemon-go-pwa/src/types/api.ts`:

```ts
export interface Names {
  English: string
  German: string
  French?: string
  Italian?: string
  Japanese?: string
  Korean?: string
  Spanish?: string
  BrazilianPortuguese?: string
}

export interface Assets {
  image: string
  shinyImage: string
}

export interface PokeType {
  type: string
  names: Names
}

export interface MoveCombat {
  energy: number
  power: number
  turns: number
  buffs: {
    activationChance: number
    attackerAttackStatsChange: number | null
    attackerDefenseStatsChange: number | null
    targetAttackStatsChange: number | null
    targetDefenseStatsChange: number | null
  } | null
}

export interface PokemonMove {
  id: string
  power: number
  energy: number
  durationMs: number
  type: PokeType
  names: Names
  combat: MoveCombat | null
}

export interface PokemonStats {
  stamina: number
  attack: number
  defense: number
}

export interface Evolution {
  id: string
  formId: string
  candies: number
  item: { id: string; names: Names } | null
  quests: Array<{ id: string; type: string; names: Names }>
}

export interface Pokemon {
  id: string
  formId: string
  dexNr: number
  generation: number
  names: Names
  stats: PokemonStats | null
  primaryType: PokeType
  secondaryType: PokeType | null
  pokemonClass: 'POKEMON_CLASS_LEGENDARY' | 'POKEMON_CLASS_MYTHIC' | 'POKEMON_CLASS_ULTRA_BEAST' | null
  quickMoves: Record<string, PokemonMove>
  cinematicMoves: Record<string, PokemonMove>
  eliteQuickMoves: Record<string, PokemonMove>
  eliteCinematicMoves: Record<string, PokemonMove>
  assets: Assets | null
  evolutions: Evolution[]
  hasMegaEvolution: boolean
  hasGigantamaxEvolution: boolean
  megaEvolutions: Record<string, unknown>
  regionForms: Record<string, unknown>
  assetForms: unknown[]
}

export type PokedexEntry = Pokemon

export type RaidLevel =
  | 'ex' | 'mega' | 'legendary_mega' | 'ultra_beast'
  | 'lvl5' | 'lvl3' | 'lvl1'
  | 'shadow_lvl1' | 'shadow_lvl3' | 'shadow_lvl5'

export interface RaidBoss {
  id: string
  form: string
  costume: string | null
  assets: Assets
  level: RaidLevel
  shiny: boolean
  types: string[]
  names: Names
  cpRange: { min: number; max: number }
  cpRangeBoost: { min: number; max: number }
}

export interface RaidBossResponse {
  currentList: Record<RaidLevel, RaidBoss[]>
  graphics: unknown
}
```

- [ ] **Step 2: Commit**

```bash
git add pokemon-go-pwa/src/types/
git commit -m "feat: add TypeScript API types"
```

---

### Task 4: Constants (type colors, labels, utilities)

**Files:**
- Create: `pokemon-go-pwa/src/constants/types.ts`
- Create: `pokemon-go-pwa/src/utils/pokemon.ts`
- Create: `pokemon-go-pwa/src/utils/pokemon.test.ts`

- [ ] **Step 1: Write the type color map and labels**

Create `pokemon-go-pwa/src/constants/types.ts`:

```ts
export const TYPE_COLORS: Record<string, string> = {
  pokemon_type_normal:   '#A8A878',
  pokemon_type_fire:     '#F08030',
  pokemon_type_water:    '#6890F0',
  pokemon_type_electric: '#F8D030',
  pokemon_type_grass:    '#78C850',
  pokemon_type_ice:      '#98D8D8',
  pokemon_type_fighting: '#C03028',
  pokemon_type_poison:   '#A040A0',
  pokemon_type_ground:   '#E0C068',
  pokemon_type_flying:   '#A890F0',
  pokemon_type_psychic:  '#F85888',
  pokemon_type_bug:      '#A8B820',
  pokemon_type_rock:     '#B8A038',
  pokemon_type_ghost:    '#705898',
  pokemon_type_dragon:   '#7038F8',
  pokemon_type_dark:     '#705848',
  pokemon_type_steel:    '#B8B8D0',
  pokemon_type_fairy:    '#EE99AC',
}

// For RaidBoss where types are plain English strings e.g. 'Rock'
export const TYPE_COLORS_PLAIN: Record<string, string> = {
  Normal:   '#A8A878',
  Fire:     '#F08030',
  Water:    '#6890F0',
  Electric: '#F8D030',
  Grass:    '#78C850',
  Ice:      '#98D8D8',
  Fighting: '#C03028',
  Poison:   '#A040A0',
  Ground:   '#E0C068',
  Flying:   '#A890F0',
  Psychic:  '#F85888',
  Bug:      '#A8B820',
  Rock:     '#B8A038',
  Ghost:    '#705898',
  Dragon:   '#7038F8',
  Dark:     '#705848',
  Steel:    '#B8B8D0',
  Fairy:    '#EE99AC',
}

export const TYPE_LABELS_PT: Record<string, string> = {
  pokemon_type_normal:   'Normal',
  pokemon_type_fire:     'Fogo',
  pokemon_type_water:    'Água',
  pokemon_type_electric: 'Elétrico',
  pokemon_type_grass:    'Grama',
  pokemon_type_ice:      'Gelo',
  pokemon_type_fighting: 'Lutador',
  pokemon_type_poison:   'Venenoso',
  pokemon_type_ground:   'Terra',
  pokemon_type_flying:   'Voador',
  pokemon_type_psychic:  'Psíquico',
  pokemon_type_bug:      'Inseto',
  pokemon_type_rock:     'Pedra',
  pokemon_type_ghost:    'Fantasma',
  pokemon_type_dragon:   'Dragão',
  pokemon_type_dark:     'Sombrio',
  pokemon_type_steel:    'Aço',
  pokemon_type_fairy:    'Fada',
}

export const RAID_LEVEL_LABELS: Record<string, string> = {
  lvl1:         '1★',
  lvl3:         '3★',
  lvl5:         '5★ / Lendário',
  mega:         'Mega',
  legendary_mega: 'Mega Lendário',
  ultra_beast:  'Ultra Beast',
  shadow_lvl1:  'Sombrio 1★',
  shadow_lvl3:  'Sombrio 3★',
  shadow_lvl5:  'Sombrio 5★',
  ex:           'EX',
}

export const CLASS_LABELS_PT: Record<string, string> = {
  POKEMON_CLASS_LEGENDARY:   'Lendário',
  POKEMON_CLASS_MYTHIC:      'Mítico',
  POKEMON_CLASS_ULTRA_BEAST: 'Ultra Beast',
}
```

- [ ] **Step 2: Write the failing tests for utility functions**

Create `pokemon-go-pwa/src/utils/pokemon.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getDisplayName, calcDps } from './pokemon'
import type { Names, Pokemon, PokemonMove } from '../types/api'

const makeNames = (overrides: Partial<Names> = {}): Names => ({
  English: 'Bulbasaur',
  German: 'Bisasam',
  ...overrides,
})

describe('getDisplayName', () => {
  it('returns BrazilianPortuguese when available', () => {
    const names = makeNames({ BrazilianPortuguese: 'Bulbassauro' })
    expect(getDisplayName(names)).toBe('Bulbassauro')
  })

  it('falls back to English when BrazilianPortuguese is missing', () => {
    const names = makeNames()
    expect(getDisplayName(names)).toBe('Bulbasaur')
  })

  it('falls back to English when BrazilianPortuguese is empty string', () => {
    const names = makeNames({ BrazilianPortuguese: '' })
    expect(getDisplayName(names)).toBe('Bulbasaur')
  })
})

describe('calcDps', () => {
  const baseMove: PokemonMove = {
    id: 'TACKLE',
    power: 5,
    energy: 5,
    durationMs: 500,
    type: { type: 'pokemon_type_normal', names: makeNames() },
    names: makeNames(),
    combat: null,
  }

  it('calculates DPS without STAB', () => {
    const dps = calcDps(baseMove, 'pokemon_type_fire', null)
    // 5 / 0.5 = 10
    expect(dps).toBeCloseTo(10)
  })

  it('applies STAB from primary type', () => {
    const dps = calcDps(baseMove, 'pokemon_type_normal', null)
    // (5 * 1.2) / 0.5 = 12
    expect(dps).toBeCloseTo(12)
  })

  it('applies STAB from secondary type', () => {
    const dps = calcDps(baseMove, 'pokemon_type_fire', 'pokemon_type_normal')
    // (5 * 1.2) / 0.5 = 12
    expect(dps).toBeCloseTo(12)
  })

  it('returns 0 for move with 0 power', () => {
    const move = { ...baseMove, power: 0 }
    expect(calcDps(move, 'pokemon_type_fire', null)).toBe(0)
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd pokemon-go-pwa
npm test
```

Expected: FAIL — `getDisplayName` and `calcDps` not found.

- [ ] **Step 4: Implement the utility functions**

Create `pokemon-go-pwa/src/utils/pokemon.ts`:

```ts
import type { Names, PokemonMove } from '../types/api'

export function getDisplayName(names: Names): string {
  return names.BrazilianPortuguese || names.English
}

export function calcDps(
  move: PokemonMove,
  primaryType: string,
  secondaryType: string | null,
): number {
  const stab =
    move.type.type === primaryType || move.type.type === secondaryType
      ? 1.2
      : 1.0
  const durationSec = move.durationMs / 1000
  return (move.power * stab) / durationSec
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
cd ..
git add pokemon-go-pwa/src/constants/ pokemon-go-pwa/src/utils/
git commit -m "feat: add type constants and pokemon utility functions"
```

---

### Task 5: API service and data hooks

**Files:**
- Create: `pokemon-go-pwa/src/services/api.ts`
- Create: `pokemon-go-pwa/src/hooks/usePokedex.ts`
- Create: `pokemon-go-pwa/src/hooks/usePokemon.ts`
- Create: `pokemon-go-pwa/src/hooks/useRaids.ts`

- [ ] **Step 1: Write the API service**

Create `pokemon-go-pwa/src/services/api.ts`:

```ts
import type { PokedexEntry, Pokemon, RaidBossResponse } from '../types/api'

const BASE = 'https://pokemon-go-api.github.io/pokemon-go-api/api'

export async function fetchPokedex(): Promise<PokedexEntry[]> {
  const res = await fetch(`${BASE}/pokedex.json`)
  if (!res.ok) throw new Error('Failed to fetch Pokédex')
  return res.json()
}

export async function fetchPokemon(id: string): Promise<Pokemon> {
  const res = await fetch(`${BASE}/pokedex/id/${id}.json`)
  if (!res.ok) throw new Error(`Failed to fetch Pokémon ${id}`)
  return res.json()
}

export async function fetchRaids(): Promise<RaidBossResponse> {
  const res = await fetch(`${BASE}/raidboss.json`)
  if (!res.ok) throw new Error('Failed to fetch raids')
  return res.json()
}
```

- [ ] **Step 2: Write the data hooks**

Create `pokemon-go-pwa/src/hooks/usePokedex.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchPokedex } from '../services/api'

export function usePokedex() {
  return useQuery({
    queryKey: ['pokedex'],
    queryFn: fetchPokedex,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
```

Create `pokemon-go-pwa/src/hooks/usePokemon.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchPokemon } from '../services/api'

export function usePokemon(id: string) {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => fetchPokemon(id),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!id,
  })
}
```

Create `pokemon-go-pwa/src/hooks/useRaids.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchRaids } from '../services/api'

export function useRaids() {
  return useQuery({
    queryKey: ['raids'],
    queryFn: fetchRaids,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
```

- [ ] **Step 3: Wire TanStack Query in App entry point**

Replace `pokemon-go-pwa/src/main.tsx` with:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/pokemon-go-api/pokemon-go-pwa/">
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 4: Commit**

```bash
git add pokemon-go-pwa/src/services/ pokemon-go-pwa/src/hooks/ pokemon-go-pwa/src/main.tsx
git commit -m "feat: add API service layer and TanStack Query hooks"
```

---

## Chunk 3: Components

### Task 6: TypeBadge component

**Files:**
- Create: `pokemon-go-pwa/src/components/TypeBadge.tsx`
- Create: `pokemon-go-pwa/src/components/TypeBadge.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `pokemon-go-pwa/src/components/TypeBadge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TypeBadge from './TypeBadge'

describe('TypeBadge', () => {
  it('renders PT-BR label for a PokeType object', () => {
    render(
      <TypeBadge
        type={{ type: 'pokemon_type_fire', names: { English: 'Fire', German: 'Feuer' } }}
      />
    )
    expect(screen.getByText('Fogo')).toBeInTheDocument()
  })

  it('renders plain string type (for RaidBoss)', () => {
    render(<TypeBadge plainType="Rock" />)
    expect(screen.getByText('Rock')).toBeInTheDocument()
  })

  it('applies the correct background color for fire type', () => {
    const { container } = render(
      <TypeBadge
        type={{ type: 'pokemon_type_fire', names: { English: 'Fire', German: 'Feuer' } }}
      />
    )
    const badge = container.firstChild as HTMLElement
    expect(badge.style.backgroundColor).toBe('rgb(240, 128, 48)') // #F08030
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd pokemon-go-pwa && npm test -- TypeBadge
```

Expected: FAIL — `TypeBadge` not found.

- [ ] **Step 3: Implement TypeBadge**

Create `pokemon-go-pwa/src/components/TypeBadge.tsx`:

```tsx
import type { PokeType } from '../types/api'
import { TYPE_COLORS, TYPE_COLORS_PLAIN, TYPE_LABELS_PT } from '../constants/types'

interface Props {
  type?: PokeType
  plainType?: string
}

export default function TypeBadge({ type, plainType }: Props) {
  if (plainType) {
    const bg = TYPE_COLORS_PLAIN[plainType] ?? '#A8A878'
    return (
      <span
        className="inline-block px-2 py-0.5 rounded text-white text-xs font-semibold"
        style={{ backgroundColor: bg }}
      >
        {plainType}
      </span>
    )
  }

  if (!type) return null

  const bg = TYPE_COLORS[type.type] ?? '#A8A878'
  const label = TYPE_LABELS_PT[type.type] ?? type.names.English

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-white text-xs font-semibold"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- TypeBadge
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd .. && git add pokemon-go-pwa/src/components/TypeBadge.tsx pokemon-go-pwa/src/components/TypeBadge.test.tsx
git commit -m "feat: add TypeBadge component"
```

---

### Task 7: StatBar component

**Files:**
- Create: `pokemon-go-pwa/src/components/StatBar.tsx`
- Create: `pokemon-go-pwa/src/components/StatBar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `pokemon-go-pwa/src/components/StatBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatBar from './StatBar'

describe('StatBar', () => {
  it('renders label and value', () => {
    render(<StatBar label="ATK" value={200} max={300} />)
    expect(screen.getByText('ATK')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('bar width is proportional to value/max', () => {
    const { container } = render(<StatBar label="ATK" value={150} max={300} />)
    const bar = container.querySelector('[data-testid="stat-fill"]') as HTMLElement
    expect(bar.style.width).toBe('50%')
  })

  it('caps bar at 100% when value exceeds max', () => {
    const { container } = render(<StatBar label="ATK" value={400} max={300} />)
    const bar = container.querySelector('[data-testid="stat-fill"]') as HTMLElement
    expect(bar.style.width).toBe('100%')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- StatBar
```

Expected: FAIL.

- [ ] **Step 3: Implement StatBar**

Create `pokemon-go-pwa/src/components/StatBar.tsx`:

```tsx
interface Props {
  label: string
  value: number
  max: number
  color?: string
}

export default function StatBar({ label, value, max, color = '#EE1515' }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-sm font-bold text-gray-600 dark:text-gray-400">{label}</span>
      <span className="w-10 text-sm text-right text-gray-800 dark:text-gray-200">{value}</span>
      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          data-testid="stat-fill"
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- StatBar
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd .. && git add pokemon-go-pwa/src/components/StatBar.tsx pokemon-go-pwa/src/components/StatBar.test.tsx
git commit -m "feat: add StatBar component"
```

---

### Task 8: PokemonCard component

**Files:**
- Create: `pokemon-go-pwa/src/components/PokemonCard.tsx`

**Testing note:** PokemonCard is a presentational component that wraps `Link` (requires Router context) and `TypeBadge` (already tested). Its behavior — correct display name, number, sprite, type badges, and navigation link — is covered by visual verification in Step 2 of Task 12. No unit test is added here to avoid testing implementation details of child components.

- [ ] **Step 1: Implement PokemonCard**

Create `pokemon-go-pwa/src/components/PokemonCard.tsx`:

```tsx
import { Link } from 'react-router-dom'
import type { PokedexEntry } from '../types/api'
import TypeBadge from './TypeBadge'
import { getDisplayName } from '../utils/pokemon'

interface Props {
  pokemon: PokedexEntry
}

export default function PokemonCard({ pokemon }: Props) {
  const name = getDisplayName(pokemon.names)
  const nr = String(pokemon.dexNr).padStart(3, '0')

  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      className="
        flex flex-col items-center gap-1 p-3 rounded-xl
        bg-white dark:bg-gray-800
        border border-gray-100 dark:border-gray-700
        hover:shadow-md transition-shadow
      "
    >
      {pokemon.assets?.image ? (
        <img
          src={pokemon.assets.image}
          alt={name}
          loading="lazy"
          className="w-20 h-20 object-contain"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full" />
      )}
      <span className="text-xs text-gray-400">#{nr}</span>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 text-center leading-tight">
        {name}
      </span>
      <div className="flex gap-1 flex-wrap justify-center">
        <TypeBadge type={pokemon.primaryType} />
        {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add pokemon-go-pwa/src/components/PokemonCard.tsx
git commit -m "feat: add PokemonCard component"
```

---

### Task 9: MoveTable component

**Files:**
- Create: `pokemon-go-pwa/src/components/MoveTable.tsx`
- Create: `pokemon-go-pwa/src/components/MoveTable.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `pokemon-go-pwa/src/components/MoveTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MoveTable from './MoveTable'
import type { PokemonMove } from '../types/api'

const makeMove = (overrides: Partial<PokemonMove> = {}): PokemonMove => ({
  id: 'TACKLE',
  power: 5,
  energy: 5,
  durationMs: 500,
  type: { type: 'pokemon_type_normal', names: { English: 'Normal', German: 'Normal' } },
  names: { English: 'Tackle', German: 'Tackle' },
  combat: { energy: 5, power: 5, turns: 2, buffs: null },
  ...overrides,
})

describe('MoveTable', () => {
  it('renders move name', () => {
    render(
      <MoveTable
        title="Golpes Rápidos"
        moves={{ TACKLE: makeMove() }}
        eliteMoves={{}}
        primaryType="pokemon_type_fire"
        secondaryType={null}
        showTurns
      />
    )
    expect(screen.getByText('Tackle')).toBeInTheDocument()
  })

  it('marks elite moves with star', () => {
    render(
      <MoveTable
        title="Golpes Rápidos"
        moves={{}}
        eliteMoves={{ TACKLE: makeMove() }}
        primaryType="pokemon_type_fire"
        secondaryType={null}
        showTurns
      />
    )
    expect(screen.getByText('⭐')).toBeInTheDocument()
  })

  it('shows dash for missing combat PvP data', () => {
    render(
      <MoveTable
        title="Golpes Carregados"
        moves={{ TACKLE: makeMove({ combat: null }) }}
        eliteMoves={{}}
        primaryType="pokemon_type_fire"
        secondaryType={null}
        showTurns={false}
      />
    )
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- MoveTable
```

Expected: FAIL.

- [ ] **Step 3: Implement MoveTable**

Create `pokemon-go-pwa/src/components/MoveTable.tsx`:

```tsx
import type { PokemonMove } from '../types/api'
import TypeBadge from './TypeBadge'
import { calcDps, getDisplayName } from '../utils/pokemon'

interface Props {
  title: string
  moves: Record<string, PokemonMove>
  eliteMoves: Record<string, PokemonMove>
  primaryType: string
  secondaryType: string | null
  showTurns: boolean
}

interface MoveRow {
  move: PokemonMove
  isElite: boolean
}

export default function MoveTable({
  title,
  moves,
  eliteMoves,
  primaryType,
  secondaryType,
  showTurns,
}: Props) {
  const rows: MoveRow[] = [
    ...Object.values(moves).map(m => ({ move: m, isElite: false })),
    ...Object.values(eliteMoves).map(m => ({ move: m, isElite: true })),
  ]

  if (rows.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Golpe</th>
              <th className="text-left px-3 py-2">Tipo</th>
              <th className="text-right px-3 py-2">Poder Gin.</th>
              <th className="text-right px-3 py-2">Energia Gin.</th>
              <th className="text-right px-3 py-2">DPS</th>
              <th className="text-right px-3 py-2">Poder PvP</th>
              <th className="text-right px-3 py-2">Energia PvP</th>
              {showTurns && <th className="text-right px-3 py-2">Turnos</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map(({ move, isElite }) => {
              const dps = calcDps(move, primaryType, secondaryType)
              return (
                <tr
                  key={move.id + (isElite ? '_elite' : '')}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-100">
                    {getDisplayName(move.names)}
                    {isElite && <span className="ml-1">⭐</span>}
                  </td>
                  <td className="px-3 py-2">
                    <TypeBadge type={move.type} />
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                    {move.power}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                    {move.energy}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                    {dps.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                    {move.combat?.power ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                    {move.combat?.energy ?? '—'}
                  </td>
                  {showTurns && (
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                      {move.combat?.turns ?? '—'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- MoveTable
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd .. && git add pokemon-go-pwa/src/components/MoveTable.tsx pokemon-go-pwa/src/components/MoveTable.test.tsx
git commit -m "feat: add MoveTable component with DPS calculation"
```

---

### Task 10: EvolutionChain component

**Files:**
- Create: `pokemon-go-pwa/src/components/EvolutionChain.tsx`

**Testing note:** EvolutionChain renders `Link` components (requires Router context) and delegates display logic to `getDisplayName` (already tested in Task 4). The "no evolutions" branch and evolution condition rendering are verified by visual inspection in Task 13 Step 2. No unit test is added to avoid boilerplate Router wrapping for a purely presentational component.

- [ ] **Step 1: Implement EvolutionChain**

Create `pokemon-go-pwa/src/components/EvolutionChain.tsx`:

```tsx
import { Link } from 'react-router-dom'
import type { Evolution, Names } from '../types/api'
import { getDisplayName } from '../utils/pokemon'

interface PokemonSummary {
  id: string
  dexNr: number
  names: Names
  imageUrl: string | null
  evolutions: Evolution[]
}

interface Props {
  pokemon: PokemonSummary
}

function EvolutionCondition({ evo }: { evo: Evolution }) {
  const parts: string[] = []
  if (evo.candies > 0) parts.push(`${evo.candies} Doces`)
  if (evo.item) parts.push(getDisplayName(evo.item.names))
  if (evo.quests.length > 0) parts.push(getDisplayName(evo.quests[0].names))
  if (parts.length === 0) return null
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 text-center block mt-1">
      {parts.join(' + ')}
    </span>
  )
}

function EvolutionNode({ id, dexNr, names, imageUrl }: Omit<PokemonSummary, 'evolutions'>) {
  const name = getDisplayName(names)
  const nr = String(dexNr).padStart(3, '0')
  return (
    <Link
      to={`/pokemon/${id}`}
      className="flex flex-col items-center gap-1 hover:opacity-80"
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-16 h-16 object-contain" />
      ) : (
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      )}
      <span className="text-xs text-gray-400">#{nr}</span>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 text-center">
        {name}
      </span>
    </Link>
  )
}

export default function EvolutionChain({ pokemon }: Props) {
  if (pokemon.evolutions.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        Este Pokémon não evolui.
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center py-4">
      <EvolutionNode
        id={pokemon.id}
        dexNr={pokemon.dexNr}
        names={pokemon.names}
        imageUrl={pokemon.imageUrl}
      />
      {pokemon.evolutions.map((evo) => (
        <div key={evo.id} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-xl">→</span>
            <EvolutionCondition evo={evo} />
          </div>
          <Link
            to={`/pokemon/${evo.id}`}
            className="flex flex-col items-center gap-1 hover:opacity-80"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400">
              ?
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 text-center">
              {evo.id}
            </span>
          </Link>
        </div>
      ))}
    </div>
  )
}
```

**Note:** Evolution nodes link to the next Pokémon but only show the current Pokémon's sprite — the evolved forms need their own API data to show sprites. This is by design; clicking an evolution navigates to that Pokémon's full detail page.

- [ ] **Step 2: Commit**

```bash
git add pokemon-go-pwa/src/components/EvolutionChain.tsx
git commit -m "feat: add EvolutionChain component"
```

---

## Chunk 4: Pages, App Shell, and Deployment

### Task 11: App shell and routing

**Files:**
- Modify: `pokemon-go-pwa/src/App.tsx`

- [ ] **Step 1: Write the App router**

Replace `pokemon-go-pwa/src/App.tsx` with:

```tsx
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Pokedex from './pages/Pokedex'
import PokemonDetail from './pages/PokemonDetail'
import Raids from './pages/Raids'

const tabs = [
  { path: '/', label: 'Pokédex' },
  { path: '/raids', label: 'Reides' },
]

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="bg-red-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <Link to="/" className="font-bold text-lg tracking-tight">
              Pokédex GO
            </Link>
            <nav className="flex gap-1">
              {tabs.map(tab => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    location.pathname === tab.path
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <Routes>
          <Route path="/" element={<Pokedex />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
          <Route path="/raids" element={<Raids />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add pokemon-go-pwa/src/App.tsx
git commit -m "feat: add app shell with header and routing"
```

---

### Task 12: Pokédex page

**Files:**
- Create: `pokemon-go-pwa/src/pages/Pokedex.tsx`

- [ ] **Step 1: Implement the Pokédex page**

Create `pokemon-go-pwa/src/pages/Pokedex.tsx`:

```tsx
import { useState, useMemo, useCallback } from 'react'
import { Search } from 'lucide-react'
import { usePokedex } from '../hooks/usePokedex'
import PokemonCard from '../components/PokemonCard'
import TypeBadge from '../components/TypeBadge'
import type { PokedexEntry } from '../types/api'
import { TYPE_LABELS_PT, TYPE_COLORS } from '../constants/types'
import { getDisplayName } from '../utils/pokemon'

const PAGE_SIZE = 50

const ALL_TYPES = Object.keys(TYPE_LABELS_PT)

export default function Pokedex() {
  const { data: pokedex, isLoading, isError } = usePokedex()
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!pokedex) return []
    const q = search.trim().toLowerCase()
    return pokedex.filter((p: PokedexEntry) => {
      const matchesSearch =
        !q ||
        getDisplayName(p.names).toLowerCase().includes(q) ||
        String(p.dexNr).includes(q)
      const matchesType =
        !activeType ||
        p.primaryType.type === activeType ||
        p.secondaryType?.type === activeType
      return matchesSearch && matchesType
    })
  }, [pokedex, search, activeType])

  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  )

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const handleTypeFilter = useCallback((type: string) => {
    setActiveType(prev => (prev === type ? null : type))
    setPage(1)
  }, [])

  if (isLoading) {
    return <div className="text-center py-16 text-gray-400">Carregando Pokédex...</div>
  }

  if (isError) {
    return <div className="text-center py-16 text-red-500">Erro ao carregar Pokédex.</div>
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome ou número..."
          value={search}
          onChange={handleSearch}
          className="
            w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-red-400
          "
        />
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-1 mb-4">
        {ALL_TYPES.map(type => (
          <button
            key={type}
            onClick={() => handleTypeFilter(type)}
            className={`rounded px-2 py-0.5 text-xs font-semibold text-white transition-opacity ${
              activeType && activeType !== type ? 'opacity-30' : 'opacity-100'
            }`}
            style={{ backgroundColor: TYPE_COLORS[type] }}
          >
            {TYPE_LABELS_PT[type]}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-3">
        {filtered.length} Pokémon encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {paginated.map((p: PokedexEntry) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>

      {/* Load more */}
      {paginated.length < filtered.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify visually**

```bash
cd pokemon-go-pwa && npm run dev
```

Open `http://localhost:5173`. Expected: Pokédex grid loads with Pokémon cards, search bar works, type filter chips show correct colors.

- [ ] **Step 3: Commit**

```bash
cd .. && git add pokemon-go-pwa/src/pages/Pokedex.tsx
git commit -m "feat: add Pokédex list page with search and type filter"
```

---

### Task 13: Pokémon Detail page

**Files:**
- Create: `pokemon-go-pwa/src/pages/PokemonDetail.tsx`

- [ ] **Step 1: Implement PokemonDetail**

Create `pokemon-go-pwa/src/pages/PokemonDetail.tsx`:

```tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePokemon } from '../hooks/usePokemon'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import MoveTable from '../components/MoveTable'
import EvolutionChain from '../components/EvolutionChain'
import { getDisplayName } from '../utils/pokemon'
import { CLASS_LABELS_PT } from '../constants/types'

type Tab = 'overview' | 'moves' | 'evolutions'

const MAX_STAT = 300 // approximate max to scale bars

export default function PokemonDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: pokemon, isLoading, isError } = usePokemon(id ?? '')
  const [tab, setTab] = useState<Tab>('overview')

  if (isLoading) {
    return <div className="text-center py-16 text-gray-400">Carregando...</div>
  }

  if (isError || !pokemon) {
    return (
      <div className="text-center py-16 text-red-500">
        Pokémon não encontrado.
        <br />
        <Link to="/" className="text-red-400 underline mt-2 inline-block">
          Voltar à Pokédex
        </Link>
      </div>
    )
  }

  const name = getDisplayName(pokemon.names)
  const nr = String(pokemon.dexNr).padStart(3, '0')
  const classLabel = pokemon.pokemonClass ? CLASS_LABELS_PT[pokemon.pokemonClass] : null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Visão Geral' },
    { key: 'moves', label: 'Golpes' },
    { key: 'evolutions', label: 'Evoluções' },
  ]

  return (
    <div>
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Pokédex
      </Link>

      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-4">
        {pokemon.assets?.image && (
          <img
            src={pokemon.assets.image}
            alt={name}
            className="w-32 h-32 object-contain"
          />
        )}
        <span className="text-sm text-gray-400">#{nr}</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
        <div className="flex gap-2">
          <TypeBadge type={pokemon.primaryType} />
          {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
        </div>
        {classLabel && (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
            {classLabel}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-3 max-w-sm mx-auto">
          {pokemon.stats ? (
            <>
              <StatBar label="ATK" value={pokemon.stats.attack} max={MAX_STAT} color="#EE1515" />
              <StatBar label="DEF" value={pokemon.stats.defense} max={MAX_STAT} color="#3B82F6" />
              <StatBar label="STA" value={pokemon.stats.stamina} max={MAX_STAT} color="#22C55E" />
            </>
          ) : (
            <p className="text-center text-gray-400">Stats não disponíveis.</p>
          )}
        </div>
      )}

      {tab === 'moves' && (
        <div>
          <MoveTable
            title="Golpes Rápidos"
            moves={pokemon.quickMoves}
            eliteMoves={pokemon.eliteQuickMoves}
            primaryType={pokemon.primaryType.type}
            secondaryType={pokemon.secondaryType?.type ?? null}
            showTurns
          />
          <MoveTable
            title="Golpes Carregados"
            moves={pokemon.cinematicMoves}
            eliteMoves={pokemon.eliteCinematicMoves}
            primaryType={pokemon.primaryType.type}
            secondaryType={pokemon.secondaryType?.type ?? null}
            showTurns={false}
          />
        </div>
      )}

      {tab === 'evolutions' && (
        <EvolutionChain
          pokemon={{
            id: pokemon.id,
            dexNr: pokemon.dexNr,
            names: pokemon.names,
            imageUrl: pokemon.assets?.image ?? null,
            evolutions: pokemon.evolutions,
          }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Test visually**

With dev server running, click any Pokémon card. Expected:
- Header shows sprite, name, number, type badges
- "Visão Geral" tab shows ATK/DEF/STA bars
- "Golpes" tab shows two move tables
- "Evoluções" tab shows chain or "não evolui" message

- [ ] **Step 3: Commit**

```bash
git add pokemon-go-pwa/src/pages/PokemonDetail.tsx
git commit -m "feat: add Pokémon detail page with tabs"
```

---

### Task 14: Raids page

**Files:**
- Create: `pokemon-go-pwa/src/pages/Raids.tsx`

- [ ] **Step 1: Implement the Raids page**

Create `pokemon-go-pwa/src/pages/Raids.tsx`:

```tsx
import { useRaids } from '../hooks/useRaids'
import TypeBadge from '../components/TypeBadge'
import { RAID_LEVEL_LABELS } from '../constants/types'
import type { RaidBoss, RaidLevel } from '../types/api'
import { getDisplayName } from '../utils/pokemon'

const TIER_ORDER: RaidLevel[] = [
  'mega', 'legendary_mega', 'ex', 'ultra_beast',
  'lvl5', 'shadow_lvl5', 'lvl3', 'shadow_lvl3',
  'lvl1', 'shadow_lvl1',
]

function BossCard({ boss }: { boss: RaidBoss }) {
  const name = getDisplayName(boss.names)
  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
      <img
        src={boss.assets.image}
        alt={name}
        loading="lazy"
        className="w-14 h-14 object-contain"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{name}</p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {boss.types.map(t => (
            <TypeBadge key={t} plainType={t} />
          ))}
        </div>
      </div>
      {boss.shiny && (
        <span className="text-yellow-400 text-lg" title="Shiny disponível">✨</span>
      )}
    </div>
  )
}

export default function Raids() {
  const { data, isLoading, isError } = useRaids()

  if (isLoading) {
    return <div className="text-center py-16 text-gray-400">Carregando Reides...</div>
  }

  if (isError || !data) {
    return <div className="text-center py-16 text-red-500">Erro ao carregar Reides.</div>
  }

  const list = data.currentList

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reides Atuais</h1>
      {TIER_ORDER.map(tier => {
        const bosses = list[tier]
        if (!bosses || bosses.length === 0) return null
        return (
          <section key={tier}>
            <h2 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {RAID_LEVEL_LABELS[tier] ?? tier}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bosses.map(boss => (
                <BossCard key={boss.id + boss.form} boss={boss} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Test visually**

Navigate to `/raids` in the dev server. Expected: sections grouped by tier, each boss shows sprite, name, type badges, and shiny ✨ if applicable.

- [ ] **Step 3: Commit**

```bash
git add pokemon-go-pwa/src/pages/Raids.tsx
git commit -m "feat: add Raids page grouped by tier"
```

---

### Task 15: Full test suite run and build verification

- [ ] **Step 1: Run all tests**

```bash
cd pokemon-go-pwa && npm test
```

Expected: All tests PASS. No failures.

- [ ] **Step 2: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Build for production**

```bash
npm run build
```

Expected: `dist/` folder is created. No build errors. Vite prints uncompressed chunk sizes — the main JS chunk should be under 600kb uncompressed (roughly ~200kb gzipped). If it is significantly larger, run `npx vite-bundle-visualizer` to identify what to lazy-load.

- [ ] **Step 4: Preview the production build locally**

```bash
npm run preview
```

Open the URL shown (usually `http://localhost:4173/pokemon-go-api/pokemon-go-pwa/`). Verify the app works in production mode.

- [ ] **Step 5: Commit final state**

```bash
cd ..
git add pokemon-go-pwa/
git commit -m "feat: complete Pokemon GO PWA - Pokédex, detail page, raids, offline PWA"
```

---

### Task 16: Deploy to GitHub Pages via CI

**Context:** The `.github/workflows/page.yml` workflow runs `composer run-script api-build`, then deploys the entire `public/` folder to `gh-pages` with `keep_history: false` — overwriting everything on every run. The PWA **must** be built inside the workflow (after the PHP build, before the deploy step) so it is always included. Do NOT commit built PWA files to `main` — they will be silently deleted by the next CI run.

**Files:**
- Modify: `.github/workflows/page.yml`

- [ ] **Step 1: Add Node.js setup + PWA build steps to page.yml**

Open `.github/workflows/page.yml`. After the `Convert SVG to PNG` step (around line 75) and **before** the `Deploy to GitHub Pages` step, add two new steps:

```yaml
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: pokemon-go-pwa/package-lock.json

      - name: Build PWA
        run: |
          cd pokemon-go-pwa
          npm ci
          npm run build
          mkdir -p ../public/pokemon-go-pwa
          cp -r dist/. ../public/pokemon-go-pwa/
```

The full updated `page.yml` after the change (showing the relevant section from line 72 onwards):

```yaml
      - name: Convert SVG to PNG
        if: ${{ steps.generated-data.outputs.CACHE_STATUS == 'HAS_CHANGES' }}
        continue-on-error: true
        run: composer run-script convert-svg

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: pokemon-go-pwa/package-lock.json

      - name: Build PWA
        run: |
          cd pokemon-go-pwa
          npm ci
          npm run build
          mkdir -p ../public/pokemon-go-pwa
          cp -r dist/. ../public/pokemon-go-pwa/

      - name: Deploy to GitHub Pages
        if: ${{ (steps.generated-data.outputs.CACHE_STATUS == 'HAS_CHANGES') && github.event_name != 'pull_request'}}
        uses: crazy-max/ghaction-github-pages@v2
        with:
          keep_history: false
          target_branch: gh-pages
          build_dir: public
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Note:** `Set up Node.js` and `Build PWA` have **no `if` condition** — they always run. The PWA is always built fresh into `public/pokemon-go-pwa/` regardless of whether PHP data changed. Only the **Deploy** step is gated on `HAS_CHANGES`. This ensures PWA source changes are always published even when the PHP API data is cached.

- [ ] **Step 2: Commit the workflow change**

```bash
git add .github/workflows/page.yml
git commit -m "ci: build and deploy PWA as part of GitHub Pages workflow"
```

- [ ] **Step 3: Trigger the workflow manually**

Push to `main` (or trigger manually in GitHub Actions):

```bash
git push origin main
```

In GitHub → Actions → `page` workflow → watch the run. Expected: all steps pass including `Build PWA`. The deploy step should run and publish to `gh-pages`.

- [ ] **Step 4: Verify on GitHub Pages**

Wait ~2 minutes after the workflow finishes, then open:
`https://pokemon-go-api.github.io/pokemon-go-api/pokemon-go-pwa/`

Expected: App loads, Pokédex grid appears with Pokémon in Brazilian Portuguese names.

- [ ] **Step 5: Test PWA install on Android**

Open the URL in Chrome for Android. A banner should appear: "Adicionar à tela inicial". Tap it. The app installs and opens without browser chrome.

On iOS Safari: tap the Share button → "Adicionar à Tela de Início".

---

## Summary

| Task | What it builds |
|---|---|
| 1 | PT-BR language added to PHP API |
| 2 | Vite + React + TypeScript + Tailwind + PWA scaffold |
| 3 | TypeScript interfaces for all API shapes |
| 4 | Type constants, display name helper, DPS calculator (with tests) |
| 5 | API service functions + TanStack Query hooks |
| 6 | TypeBadge component (with tests) |
| 7 | StatBar component (with tests) |
| 8 | PokemonCard component |
| 9 | MoveTable component (with tests) |
| 10 | EvolutionChain component |
| 11 | App shell with header and routing |
| 12 | Pokédex list page with search + type filter |
| 13 | Pokémon detail page with 3 tabs |
| 14 | Raids page grouped by tier |
| 15 | Full test run + production build |
| 16 | Deploy to GitHub Pages + PWA install test |
