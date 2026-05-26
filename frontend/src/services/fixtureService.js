import api from './api'

export const getFixtures      = (params) => api.get('/api/fixtures', { params }).then(r => r.data.data)
export const getFixture       = (id)     => api.get(`/api/fixtures/${id}`).then(r => r.data.data)
export const getFixtureEvents = (id)     => api.get(`/api/fixtures/${id}/events`).then(r => r.data.data)
export const getFixtureStats  = (id)     => api.get(`/api/fixtures/${id}/stats`).then(r => r.data.data)
export const createFixture    = (data)   => api.post('/api/fixtures', data).then(r => r.data.data)
export const updateFixture    = (id, d)  => api.put(`/api/fixtures/${id}`, d).then(r => r.data.data)
export const patchFixture     = (id, d)  => api.patch(`/api/fixtures/${id}`, d).then(r => r.data.data)
export const deleteFixture    = (id)     => api.delete(`/api/fixtures/${id}`)
