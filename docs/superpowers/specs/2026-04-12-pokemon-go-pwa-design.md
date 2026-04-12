# Pokemon GO PWA — Design Spec

**Date:** 2026-04-12
**Status:** Approved (v2 — post spec review)

---

## Overview

A Progressive Web App (PWA) that replicates the core experience of Pokemon GO Hub's database (db.pokemongohub.net), focused on Portuguese-speaking users. Installable on Android/iOS via "Adicionar à tela inicial", works offline after first load, and auto-follows the device's dark/light theme.

Data source: the public API at `https://pokemon-go-api.github.io/pokemon-go-api/` (no backend required).

---

## Goals

- Full Pokédex list with search by name or number
- Individual Pokémon page with tabs: Visão Geral, Golpes, Evoluções
- Current Raid Boss list grouped by tier
- Installable as PWA — works offline (mixed mode: cache-first, revalidates online)
- Portuguese UI labels; Pokémon names displayed in Spanish (closest available in API — see note below)
- Auto dark/light theme following device preference

---

## Language Note — Pokémon Names

The API (`Names` schema) provides names in: English, German, French, Italian, Japanese, Korean, **Spanish** — but **not Portuguese**. Spanish Pokémon names are nearly identical to Portuguese (e.g., Bulbasaur, Charmander, Pikachu are the same in both). The app will:

- Display **Spanish** names as the Pokémon name throughout the app
- Use `names.Spanish ?? names.English` as the display name fallback
- All **UI chrome** (labels, headings, tabs, buttons) is in Brazilian Portuguese (`pt-BR`)
- Search also operates on the Spanish name field

---

## Architecture

### Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Component model suits Pokédex scale |
| Build | Vite | Fast dev, native ESM, PWA plugin |
| Routing | React Router v6 | Standard SPA routing |
| Data fetching | TanStack Query v5 | Built-in cache, background revalidation |
| Styling | Tailwind CSS (`darkMode: 'media'`) | Follows device preference automatically |
| PWA | vite-plugin-pwa (Workbox) | Auto-generates service worker and manifest |
| Icons | Lucide React | Lightweight, consistent |

**Tailwind dark mode:** uses the `media` strategy (`prefers-color-scheme`). No JS toggle needed — theme follows the OS automatically.

### Data Sources (API endpoints used)

| Data | Endpoint |
|---|---|
| Full Pokédex | `/api/pokedex.json` |
| Single Pokémon | `/api/pokedex/id/{id}.json` |
| Raid Bosses | `/api/raidboss.json` |

### Offline Strategy (Workbox)

- **App shell** (HTML/JS/CSS): CacheFirst — always loads from cache after install.
- **Pokédex list** (`/api/pokedex.json`): StaleWhileRevalidate — serves cache instantly, updates in background when online.
- **Pokémon detail** (`/api/pokedex/id/{id}.json`): CacheFirst with 24h expiry — cached on first visit, revalidated when stale.
- **Raid Bosses** (`/api/raidboss.json`): StaleWhileRevalidate.

---

## Deployment & Base Path

The PWA lives in a `pokemon-go-pwa/` subfolder inside the existing repo. When deployed to GitHub Pages, the URL will be:

```
https://pokemon-go-api.github.io/pokemon-go-api/pokemon-go-pwa/
```

Three settings **must** all use this base path:
- `vite.config.ts`: `base: '/pokemon-go-api/pokemon-go-pwa/'`
- React Router: `<BrowserRouter basename="/pokemon-go-api/pokemon-go-pwa/">`
- PWA manifest: `"start_url": "/pokemon-go-api/pokemon-go-pwa/"`

---

## Pages & Routes

```
/                    → Pokédex (list + search + type filter)
/pokemon/:id         → Pokémon detail (3 tabs)
/raids               → Raid Boss list
```

---

## Data Shapes (TypeScript Interfaces)

```ts
// Names object — Portuguese not available; use Spanish ?? English
interface Names {
  English: string;
  German: string;
  French?: string;
  Italian?: string;
  Japanese?: string;
  Korean?: string;
  Spanish?: string;
}

// Assets
interface Assets {
  image: string;      // URI to sprite
  shinyImage: string; // URI to shiny sprite
}

// Type
interface PokeType {
  type: string;       // e.g. "pokemon_type_fire"
  names: Names;
}

// Move combat data (PvP)
interface MoveCombat {
  energy: number;
  power: number;
  turns: number;
  buffs: {
    activationChance: number;
    attackerAttackStatsChange: number | null;
    attackerDefenseStatsChange: number | null;
    targetAttackStatsChange: number | null;
    targetDefenseStatsChange: number | null;
  } | null;
}

// Move (both quick and cinematic)
interface PokemonMove {
  id: string;
  power: number;        // PvE power
  energy: number;       // PvE energy
  durationMs: number;   // PvE duration in milliseconds — confirmed field name
  type: PokeType;
  names: Names;
  combat: MoveCombat | null; // PvP data
}

// Stats
interface PokemonStats {
  stamina: number;
  attack: number;
  defense: number;
}

// Evolution condition
interface Evolution {
  id: string;
  formId: string;
  candies: number;
  item: { id: string; names: Names } | null;
  quests: Array<{ id: string; type: string; names: Names }>;
}

// Full Pokémon (from /api/pokedex/id/{id}.json)
interface Pokemon {
  id: string;
  formId: string;
  dexNr: number;
  generation: number;
  names: Names;
  stats: PokemonStats | null;
  primaryType: PokeType;
  secondaryType: PokeType | null;
  pokemonClass: 'POKEMON_CLASS_LEGENDARY' | 'POKEMON_CLASS_MYTHIC' | 'POKEMON_CLASS_ULTRA_BEAST' | null;
  quickMoves: Record<string, PokemonMove>;
  cinematicMoves: Record<string, PokemonMove>;
  eliteQuickMoves: Record<string, PokemonMove>;
  eliteCinematicMoves: Record<string, PokemonMove>;
  assets: Assets | null;
  evolutions: Evolution[];
  hasMegaEvolution: boolean;
  hasGigantamaxEvolution: boolean;
  megaEvolutions: Record<string, unknown>;
  regionForms: Record<string, unknown>;
  assetForms: unknown[];
}

// Pokédex list entry (from /api/pokedex.json — same shape as Pokemon above)
type PokedexEntry = Pokemon;

// Raid Boss (from /api/raidboss.json → response.currentList[tier][])
// NOTE: types is plain English strings e.g. ['Rock', 'Flying'],
//       NOT PokeType objects like in the Pokemon schema.
//       TypeBadge must accept both: PokeType object OR plain string.
interface RaidBoss {
  id: string;
  form: string;
  costume: string | null;
  assets: Assets;
  level: 'ex' | 'mega' | 'legendary_mega' | 'ultra_beast' | 'lvl5' | 'lvl3' | 'lvl1' | 'shadow_lvl1' | 'shadow_lvl3' | 'shadow_lvl5';
  shiny: boolean;
  types: string[];  // plain English names e.g. 'Rock', 'Flying'
  names: Names;
  cpRange: { min: number; max: number };
  cpRangeBoost: { min: number; max: number };
}

// Full raidboss.json response shape
interface RaidBossResponse {
  currentList: Record<RaidBoss['level'], RaidBoss[]>;
  graphics: unknown;
}
```

---

## UI Specification

### Pokédex Page (`/`)

- **Search bar** at top: filters by Spanish/English name or Pokédex number (client-side, over fully cached list)
- **Type filter** chips below search: one chip per type with its color badge
- **Grid of cards** (2 columns mobile, 4 desktop):
  - Pokémon sprite (lazy loaded from `assets.image`)
  - Pokédex number (`#001`)
  - Display name (`names.Spanish ?? names.English`)
  - Type badge(s) with color
- **Client-side pagination**: renders 50 items at a time as the user scrolls. The full list is already in memory from the cached API response — this is UI virtualization, not network lazy loading. Works fully offline.

### Pokémon Detail Page (`/pokemon/:id`)

Header (always visible):
- Large sprite (`assets.image`)
- Display name + Pokédex number
- Type badge(s)
- Class label if applicable: Lendário / Mítico / Ultra Beast

**Aba: Visão Geral**
- Stats row: ATK / DEF / STA with visual progress bars
- Bars scaled relative to the maximum stat value across the Pokédex

**Aba: Golpes**

Displays raw move stats from the API. PvP move data (power, energy, turns) is in scope for display. PvP ranking systems (meta tier lists, league ratings) are out of scope.

*Golpes Rápidos*

| Golpe | Tipo | Poder (Ginásio) | Energia (Ginásio) | DPS | Poder (PvP) | Energia (PvP) | Turnos |
|---|---|---|---|---|---|---|---|

*Golpes Carregados*

| Golpe | Tipo | Poder (Ginásio) | Energia (Ginásio) | DPS | Poder (PvP) | Energia (PvP) |
|---|---|---|---|---|---|---|

- Elite TM moves (from `eliteQuickMoves` / `eliteCinematicMoves`) marked with ⭐
- Type badge with color on each move row
- If `combat` is null for a move, PvP columns show "—"

**Aba: Evoluções**
- Horizontal evolution chain: sprite → arrow → sprite
- Evolution condition shown below arrow: candies count + item name (if `item` is not null) + quest description (if `quests` is non-empty)
- Each sprite links to that Pokémon's detail page

### Raid Boss Page (`/raids`)

- Grouped sections by tier (display labels):
  - `lvl1` → 1★, `lvl3` → 3★, `lvl5` → 5★ / Lendário
  - `mega` / `legendary_mega` → Mega
  - `ultra_beast` → Ultra Beast
  - `shadow_lvl1/3/5` → Sombrio
  - `ex` → EX
- Each boss card: sprite, display name, type badges, shiny indicator if `shiny: true`
- No "last updated" timestamp (not available in the API response)

---

## DPS Calculation

```
DPS = (power * stab) / (durationMs / 1000)
stab = 1.2 if move.type.type === pokemon.primaryType.type
         or move.type.type === pokemon.secondaryType?.type
       else 1.0
```

Field `durationMs` is confirmed in the API schema (`PokemonMove.durationMs`).

---

## Type Color Map

| Type key (in API) | PT Label | Hex |
|---|---|---|
| pokemon_type_normal | Normal | #A8A878 |
| pokemon_type_fire | Fogo | #F08030 |
| pokemon_type_water | Água | #6890F0 |
| pokemon_type_electric | Elétrico | #F8D030 |
| pokemon_type_grass | Grama | #78C850 |
| pokemon_type_ice | Gelo | #98D8D8 |
| pokemon_type_fighting | Lutador | #C03028 |
| pokemon_type_poison | Venenoso | #A040A0 |
| pokemon_type_ground | Terra | #E0C068 |
| pokemon_type_flying | Voador | #A890F0 |
| pokemon_type_psychic | Psíquico | #F85888 |
| pokemon_type_bug | Inseto | #A8B820 |
| pokemon_type_rock | Pedra | #B8A038 |
| pokemon_type_ghost | Fantasma | #705898 |
| pokemon_type_dragon | Dragão | #7038F8 |
| pokemon_type_dark | Sombrio | #705848 |
| pokemon_type_steel | Aço | #B8B8D0 |
| pokemon_type_fairy | Fada | #EE99AC |

---

## PWA Manifest

```json
{
  "name": "Pokédex GO",
  "short_name": "PokédexGO",
  "description": "Pokédex completa para Pokemon GO",
  "start_url": "/pokemon-go-api/pokemon-go-pwa/",
  "scope": "/pokemon-go-api/pokemon-go-pwa/",
  "theme_color": "#EE1515",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "lang": "pt-BR",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**PWA Icons:** Two PNG files must be provided before deployment — `icon-192.png` (192×192) and `icon-512.png` (512×512). These will be created as part of the implementation step.

---

## Project Structure

```
pokemon-go-pwa/            ← new folder inside the repo root
├── public/
│   └── icons/             ← icon-192.png, icon-512.png
├── src/
│   ├── components/
│   │   ├── TypeBadge.tsx
│   │   ├── PokemonCard.tsx
│   │   ├── StatBar.tsx
│   │   ├── MoveTable.tsx
│   │   └── EvolutionChain.tsx
│   ├── pages/
│   │   ├── Pokedex.tsx
│   │   ├── PokemonDetail.tsx
│   │   └── Raids.tsx
│   ├── hooks/
│   │   ├── usePokedex.ts
│   │   ├── usePokemon.ts
│   │   └── useRaids.ts
│   ├── services/
│   │   └── api.ts         ← all fetch calls
│   ├── constants/
│   │   └── types.ts       ← type color map + PT labels
│   ├── types/
│   │   └── api.ts         ← TypeScript interfaces (as above)
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts         ← base: '/pokemon-go-api/pokemon-go-pwa/'
├── tailwind.config.ts     ← darkMode: 'media'
└── package.json
```

---

## Out of Scope

- Portuguese Pokémon names (not in API — Spanish used as substitute)
- Counters/best attackers list (requires external damage calc)
- PvP ranking systems (Great League / Ultra League tier lists)
- User accounts or favorites (no backend)
- Push notifications
- "Last updated" timestamp on raids (not in API response)

---

## Success Criteria

- App installs via "Adicionar à tela inicial" on Android Chrome and iOS Safari
- Pokédex list loads and is searchable with no internet after first visit
- Pokémon detail page (moves, stats, evolutions) matches Hub's data
- Raid Boss list reflects current bosses from the API
- Page load under 3s on a mid-range Android on 4G
