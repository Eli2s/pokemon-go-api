import { useQuery } from '@tanstack/react-query'
import { fetchRaids } from '../services/api'

export function useRaids() {
  return useQuery({
    queryKey: ['raids'],
    queryFn: fetchRaids,
    staleTime: 1000 * 60 * 60,
  })
}
