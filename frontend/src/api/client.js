import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getVault    = ()            => api.get('/vault').then(r => r.data)
export const saveItem    = (item)        => api.post('/vault', item).then(r => r.data)
export const patchItem   = (id, patch)   => api.patch(`/vault/${id}`, patch).then(r => r.data)
export const removeItem  = (id)          => api.delete(`/vault/${id}`).then(r => r.data)
export const removeItems = (ids)         => api.delete('/vault/batch', { data: { ids } }).then(r => r.data)
export const extractAPI  = (text, intent) => api.post('/extract', { text, intent }).then(r => r.data)
export const translateAPI = (text)       => api.post('/translate', { text }).then(r => r.data)
