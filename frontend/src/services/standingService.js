import api from './api'

export const getStandings = (leagueId) => api.get(`/api/standings/${leagueId}`).then(r => r.data.data)
