import { useParams } from 'react-router-dom'
import { getPlayer, getPlayerStats } from '../services/playerService'
import useFetch from '../hooks/useFetch'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

const posLabel = { GK: 'Portero', DEF: 'Defensa', MID: 'Mediocampista', FWD: 'Delantero' }
const posColor = { GK: 'text-slate-400', DEF: 'text-blue-400', MID: 'text-amber', FWD: 'text-green' }

export default function PlayerPage() {
  const { id } = useParams()
  const { data: player, loading, error } = useFetch(getPlayer, id)
  const { data: stats }                  = useFetch(getPlayerStats, id)

  if (loading) return <Spinner />
  if (error)   return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>
  if (!player) return null

  const age = player.birth_date
    ? Math.floor((Date.now() - new Date(player.birth_date)) / (365.25 * 24 * 3600 * 1000))
    : null

  return (
    <div className="page-enter max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Perfil */}
      <div className="card flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-pitch border-2 border-pitch-border flex items-center justify-center flex-shrink-0">
          <span className={`font-display text-3xl ${posColor[player.position]}`}>{player.position}</span>
        </div>
        <div>
          <h1 className="font-display text-5xl text-white">{player.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-sm font-medium ${posColor[player.position]}`}>{posLabel[player.position]}</span>
            <span className="text-slate-500 text-sm">·</span>
            <span className="text-slate-400 text-sm">{player.team?.name}</span>
            {age && <><span className="text-slate-500 text-sm">·</span><span className="text-slate-400 text-sm">{age} años</span></>}
          </div>
        </div>
      </div>

      {/* Stats por temporada */}
      {stats?.length > 0 && (
        <div className="card">
          <h2 className="font-display text-2xl text-white mb-4">ESTADÍSTICAS</h2>
          {stats.map(s => (
            <div key={s.id} className="mb-6">
              <p className="text-xs text-slate-500 font-mono mb-3">{s.season?.name}</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Goles',     value: s.goals,        color: 'text-green' },
                  { label: 'Asistencias',value: s.assists,      color: 'text-blue-400' },
                  { label: 'Amarillas', value: s.yellow_cards,  color: 'text-amber' },
                  { label: 'Rojas',     value: s.red_cards,     color: 'text-red' },
                ].map(stat => (
                  <div key={stat.label} className="bg-pitch rounded-xl p-4 text-center border border-pitch-border">
                    <p className={`font-display text-4xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
