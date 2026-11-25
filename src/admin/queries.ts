import { useQuery } from '@tanstack/react-query'
import { adminApi, publicApi } from '@/lib/api/endpoints'

export const useEmployees = (activeOnly = false) =>
  useQuery({
    queryKey: ['admin', 'employees', { activeOnly }],
    queryFn: () => adminApi.employees(activeOnly ? { is_active: 'true' } : {}),
    staleTime: 60_000,
  })

export const useServiceOptions = () =>
  useQuery({ queryKey: ['services'], queryFn: () => publicApi.services(), staleTime: 10 * 60_000 })
