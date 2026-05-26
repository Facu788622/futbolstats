import { Link } from 'react-router-dom'

const statusLabel = { scheduled: 'Programado', live: 'En vivo', finished: 'Finalizado' }
const statusClass = { scheduled: 'badge-scheduled', live: 'badge-live', finished: 'badge-finished' }

export default function FixtureCard({ fixture }) {
  const { id, homeTeam, awayTeam, home_score, away_score, status, date, matchday } = fixture
  const d = new Date(date)
  const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  const timeStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <Link to={`/fixtures/${id}`} className="card hover:border-green/50 transition-colors block group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-mono">Fecha {matchday}</span>
        <span className={statusClass[status]}>{statusLabel[status]}</span>
      </div>

      {/* Equipos y marcador */}
      <div className="flex items-center justify-between gap-3">
        {/* Local */}
        <div className="flex-1 text-right">
          <p className="font-display text-xl text-white group-hover:text-green transition-colors">
            {homeTeam?.short_name || homeTeam?.name}
          </p>
          <p className="text-xs text-slate-500">{homeTeam?.name}</p>
        </div>

        {/* Marcador */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pitch border border-pitch-border min-w-[80px] justify-center">
          {status === 'scheduled' ? (
            <div className="text-center">
              <p className="font-mono text-xs text-slate-400">{dateStr}</p>
              <p className="font-mono text-sm text-white">{timeStr}</p>
            </div>
          ) : (
            <>
              <span className="font-display text-3xl text-white">{home_score}</span>
              <span className="text-slate-500 font-mono">-</span>
              <span className="font-display text-3xl text-white">{away_score}</span>
            </>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 text-left">
          <p className="font-display text-xl text-white group-hover:text-green transition-colors">
            {awayTeam?.short_name || awayTeam?.name}
          </p>
          <p className="text-xs text-slate-500">{awayTeam?.name}</p>
        </div>
      </div>
    </Link>
  )
}
