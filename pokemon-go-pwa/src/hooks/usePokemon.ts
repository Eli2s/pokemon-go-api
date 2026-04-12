import { useQuery } from '@tanstack/react-query'
import { fetchPokemon } from '../services/api'

export function usePokemon(id: string) {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => fetchPokemon(id),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!id,
  })
}
