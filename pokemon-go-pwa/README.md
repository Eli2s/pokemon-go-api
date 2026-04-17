# PokéGO Database Frontend

Frontend em React + TypeScript + Vite para consumir a API pública deste repositório e apresentar os dados como um portal de consulta de Pokémon GO em português.

## Objetivo

Eu criei essa interface para sair do formato de PWA simples e aproximar a experiência de um database hub:

- home com visão geral do conteúdo
- navegação por Pokédex, tipos, gerações, categorias e raids
- página de detalhe mais rica para cada Pokémon
- visual mais próximo de portal de consulta do que de app minimalista

O foco agora é uso online. A camada offline/PWA foi removida do projeto.

## Stack

- React 19
- TypeScript
- Vite 8
- React Router
- TanStack Query
- Tailwind CSS 4
- Vitest + Testing Library

## Fonte de dados

O frontend consome a API pública já publicada pelo projeto:

- `https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex.json`
- `https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex/id/{id}.json`
- `https://pokemon-go-api.github.io/pokemon-go-api/api/raidboss.json`

## Estrutura

```text
src/
  components/      componentes reutilizáveis
  constants/       labels, cores e type chart
  hooks/           integração com React Query
  pages/           home, pokedex, raids, tipos, gerações e categorias
  services/        chamadas HTTP
  types/           contratos TypeScript da API
  utils/           helpers e métricas derivadas
```

## Páginas

- `/`:
  home do portal com atalhos, destaques e blocos exploratórios
- `/pokedex`:
  listagem principal com busca, filtro por tipo, filtro por geração e ordenação
- `/pokemon/:id`:
  detalhe com visão geral, matchups de tipo, golpes e evoluções
- `/raids`:
  chefes de raid agrupados por tier
- `/types` e `/types/:typeKey`:
  índice de tipos e páginas por tipo
- `/generations` e `/generations/:generation`:
  índice por geração
- `/categories` e `/categories/:category`:
  páginas editoriais para lendários, míticos, mega etc.

## Decisões de implementação

- Mantive a stack atual em Vite para evoluir rápido o frontend sem migrar a base inteira.
- Passei a tratar o app como portal de conteúdo e não mais como uma tela única de listagem.
- Adicionei cálculos derivados no frontend para enriquecer o detalhe:
  - total de base stats
  - melhor combinação de golpes
  - fraquezas e resistências por tipo
- Removi a configuração de service worker e manifest gerado, porque o uso offline deixou de ser requisito.

## Desenvolvimento local

Instalação:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Gerar build:

```bash
npm run build
```

Executar testes:

```bash
npm test
```

## Observações

- O projeto usa `BrowserRouter` com `basename` configurado para publicação em GitHub Pages dentro de `pokemon-go-api/pokemon-go-pwa`.
- Como o frontend depende da API publicada, a experiência local exige acesso online aos endpoints públicos.
- Se eu decidir perseguir SEO forte no futuro, o próximo passo natural é migrar essa interface para SSR/SSG.
