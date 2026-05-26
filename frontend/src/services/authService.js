import api from './api'

export const login    = (data) => api.post('/api/auth/login', data).then(r => r.data.data)
export const register = (data) => api.post('/api/auth/register', data).then(r => r.data.data)
export const getMe    = ()     => api.get('/api/auth/me').then(r => r.data.data)
