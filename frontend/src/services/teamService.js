import api from './api'

export const getTeams       = (params) => api.get('/api/teams', { params }).then(r => r.data.data)
export const getTeam        = (id)     => api.get(`/api/teams/${id}`).then(r => r.data.data)
export const getTeamPlayers = (id)     => api.get(`/api/teams/${id}/players`).then(r => r.data.data)
