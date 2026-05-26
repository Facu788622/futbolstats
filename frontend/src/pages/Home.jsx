import { getFixtures }   from '../services/fixtureService'
import { getStandings }  from '../services/standingService'
import { getTopScorers } from '../services/playerService'
import useFetch          from '../hooks/useFetch'
import FixtureCard       from '../components/FixtureCard'
import StandingsTable    from '../components/StandingsTable'
import TopScorers        from '../components/TopScorers'
import Spinner           from '../components/Spinner'

export default function Home() {
  const { data: fixtures, loading: lf } = useFetch(getFixtures, { league_id: 1, status: 'finished' })
  const { data: scheduled }             = useFetch(getFixtures, { league_id: 1, status: 'scheduled' })
  const { data: standings, loading: ls }= useFetch(getStandings, 1)
  const { data: scorers,   loading: lsc }= useFetch(getTopScorers, { limit: 5 })

  const recent = fixtures?.slice(-3).reverse() || []

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-pitch-light border border-pitch-border p-8">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #00d084 0%, transparent 60%)' }} />
        <h1 className="font-display text-6xl text-white mb-1">LIGA <span className="text-green">PROFESIONAL</span></h1>
        <p className="text-slate-400 text-sm">Temporada 2025 — Argentina</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Últimos resultados */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-2xl text-white">ÚLTIMOS RESULTADOS</h2>
          {lf ? <Spinner /> : recent.map(f => <FixtureCard key={f.id} fixture={f} />)}

          {scheduled?.length > 0 && (
            <>
              <h2 className="font-display text-2xl text-white pt-2">PRÓXIMOS PARTIDOS</h2>
              {scheduled.slice(0, 3).map(f => <FixtureCard key={f.id} fixture={f} />)}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-display text-xl text-white mb-4">TABLA DE POSICIONES</h2>
            {ls ? <Spinner size="sm" /> : <StandingsTable standings={standings} />}
          </div>
          <div className="card">
            <h2 className="font-display text-xl text-white mb-4">GOLEADORES</h2>
            {lsc ? <Spinner size="sm" /> : <TopScorers players={scorers} />}
          </div>
        </div>
      </div>
    </div>
  )
}
