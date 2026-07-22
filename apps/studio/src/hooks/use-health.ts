import { useQuery } from '@tanstack/react-query'

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('/api/health')
      if (!res.ok) {
        throw new Error('Health check failed')
      }
      return res.json()
    }
  })
}
