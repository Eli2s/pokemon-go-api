import { useQuery } from '@tanstack/react-query'
import { ApiError, fetchPokemon } from '../services/api'

export function usePokemon(id: string, enabled = true) {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => fetchPokemon(id),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!id && enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false
      }

      return failureCount < 3
    },
  })
}
