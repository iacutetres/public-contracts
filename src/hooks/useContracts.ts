import { useState, useCallback } from 'react'
import { fetchCulleraContracts } from '../services/placsp'
import type { Contract } from '../types'

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetched = await fetchCulleraContracts()
      setContracts(fetched)
      setLastChecked(new Date().toISOString())
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  return { contracts, lastChecked, loading, error, refresh }
}
