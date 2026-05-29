import { useState, useEffect, useCallback } from 'react'
import {
  getVault, saveItem, patchItem, removeItem, removeItems,
  addIntentAPI, removeIntentAPI, importVaultAPI,
} from '../api/client'

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

  const bulkDelete = useCallback(async (ids) => {
    const data = await removeItems(ids)
    setVault(data)
  }, [])

  const addIntent = useCallback(async (name) => {
    const data = await addIntentAPI(name)
    setVault(data)
  }, [])

  const removeIntent = useCallback(async (name) => {
    const data = await removeIntentAPI(name)
    setVault(data)
  }, [])

  const importData = useCallback(async (vaultData) => {
    const data = await importVaultAPI(vaultData)
    setVault(data)
  }, [])

  return {
    vault, loading, error,
    addItem, updateItemStatus, deleteItem, bulkDelete,
    addIntent, removeIntent, importData,
    refetch: fetchVault,
  }
}
