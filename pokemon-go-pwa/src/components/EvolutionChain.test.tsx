import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import EvolutionChain from './EvolutionChain'
import type { Evolution } from '../types/api'

const evolutions: Evolution[] = [
  {
    id: 'IVYSAUR',
    formId: 'IVYSAUR',
    candies: 25,
    item: null,
    quests: [],
  },
  {
    id: 'VENUSAUR',
    formId: 'VENUSAUR',
    candies: 100,
    item: null,
    quests: [],
  },
]

function renderChain(evols: Evolution[] = evolutions) {
  return render(
    <MemoryRouter>
      <EvolutionChain evolutions={evols} />
    </MemoryRouter>,
  )
}

describe('EvolutionChain', () => {
  it('renders all evolution entries', () => {
    renderChain()
    expect(screen.getByText('IVYSAUR')).toBeInTheDocument()
    expect(screen.getByText('VENUSAUR')).toBeInTheDocument()
  })

  it('shows candy cost for each evolution', () => {
    renderChain()
    expect(screen.getByText('25 balas')).toBeInTheDocument()
    expect(screen.getByText('100 balas')).toBeInTheDocument()
  })

  it('renders nothing when evolutions list is empty', () => {
    const { container } = renderChain([])
    expect(container.firstChild).toBeNull()
  })
})
