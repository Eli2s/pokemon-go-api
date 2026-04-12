import { useQuery } from '@tanstack/react-query'
import { fetchPokedex } from '../services/api'

export function usePokedex() {
  return useQuery({
    queryKey: ['pokedex'],
    queryFn: fetchPokedex,
    staleTime: 1000 * 60 * 60,
  })
}
