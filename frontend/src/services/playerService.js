import api from './api'

export const getPlayers      = (params) => api.get('/api/players', { params }).then(r => r.data.data)
export const getPlayer       = (id)     => api.get(`/api/players/${id}`).then(r => r.data.data)
export const getPlayerStats  = (id)     => api.get(`/api/players/${id}/stats`).then(r => r.data.data)
export const getTopScorers   = (params) => api.get('/api/players/top-scorers', { params }).then(r => r.data.data)

export const uploadPlayerPhoto = (id, file) => {
  const formData = new FormData()
  formData.append('photo', file)
  return api.patch(`/api/players/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}
