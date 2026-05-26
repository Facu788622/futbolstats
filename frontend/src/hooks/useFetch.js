import { useState, useEffect, useCallback } from 'react'

/**
 * Hook genérico para fetch de datos.
 * Maneja loading, error y refresco manual.
 * Uso: const { data, loading, error, refetch } = useFetch(getFixtures, { league_id: 1 })
 */
const useFetch = (fetchFn, params = null) => {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = params !== null ? await fetchFn(params) : await fetchFn()
      setData(result)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [fetchFn, JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export default useFetch
