import { useState, useEffect, useCallback } from 'react'
import { getVault, saveItem, removeItem } from '../api/client'

export function useVault() {
  const [vault, setVault]     = useState({ intents: [], items: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchVault = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getVault()
      setVault(data)
    } catch (e) {
      setError(e.message || 'Failed to load vault')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVault() }, [fetchVault])

  const addItem = useCallback(async (item) => {
    const res = await saveItem(item)
    setVault(res.data)
    return res
  }, [])

  const deleteItem = useCallback(async (id) => {
    const data = await removeItem(id)
    setVault(data)
  }, [])

  return { vault, loading, error, addItem, deleteItem, refetch: fetchVault }
}
