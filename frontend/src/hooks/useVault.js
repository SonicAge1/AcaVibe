import { useState, useEffect, useCallback } from 'react'
import { getVault, saveItem, patchItem, removeItem } from '../api/client'

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

  // 乐观更新：先改本地 state，再同步后端
  const updateItemStatus = useCallback(async (id, status) => {
    setVault(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, status } : item),
    }))
    await patchItem(id, { status })
  }, [])

  const deleteItem = useCallback(async (id) => {
    const data = await removeItem(id)
    setVault(data)
  }, [])

  return { vault, loading, error, addItem, updateItemStatus, deleteItem, refetch: fetchVault }
}
