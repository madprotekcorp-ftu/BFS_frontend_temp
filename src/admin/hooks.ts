import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

/** Keeps filters in the URL so lists are shareable and survive refresh. */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => {
    const out = {} as Record<K, string>
    for (const k of keys) out[k] = params.get(k) ?? ''
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const setFilters = useCallback(
    (patch: Partial<Record<K, string>>, resetPage = true) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch) as [string, string | undefined][]) {
            if (v) next.set(k, v)
            else next.delete(k)
          }
          if (resetPage && !('page' in patch)) next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const clear = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams])
  return { filters, setFilters, clear }
}
