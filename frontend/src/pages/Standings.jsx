import { getStandings } from '../services/standingService'
import useFetch from '../hooks/useFetch'
import StandingsTable from '../components/StandingsTable'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

export default function Standings() {
  const { data, loading, error } = useFetch(getStandings, 1)

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl text-white mb-2">TABLA DE POSICIONES</h1>
      <p className="text-slate-500 text-sm mb-8">Liga Profesional — Temporada 2025</p>
      <div className="card">
        {loading && <Spinner />}
        {error   && <ErrorMessage message={error} />}
        {!loading && !error && <StandingsTable standings={data} />}
      </div>
    </div>
  )
}
