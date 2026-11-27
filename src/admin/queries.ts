import { useQuery } from '@tanstack/react-query'
import { adminApi, publicApi } from '@/lib/api/endpoints'

export const useEmployees = (activeOnly = false) =>
  useQuery({
    queryKey: ['admin', 'employees', { activeOnly }],
    // One page of 100 covers every employee; inactive ones only when activeOnly is false.
    queryFn: () => adminApi.employees(activeOnly ? { is_active: 'true' } : {}).then((r) => r.data),
    staleTime: 60_000,
  })

export const useServiceOptions = () =>
  useQuery({ queryKey: ['services'], queryFn: () => publicApi.services(), staleTime: 10 * 60_000 })
