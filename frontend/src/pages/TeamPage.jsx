import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getTeam, getTeamPlayers } from '../services/teamService'
import useFetch from '../hooks/useFetch'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

const posColor = { GK: 'text-slate-400', DEF: 'text-blue-400', MID: 'text-amber', FWD: 'text-green' }
const posOrder = { GK: 0, DEF: 1, MID: 2, FWD: 3 }

export default function TeamPage() {
  const { id } = useParams()
  const { data: team,    loading, error } = useFetch(getTeam, id)
  const { data: players }                 = useFetch(getTeamPlayers, id)

  if (loading) return <Spinner />
  if (error)   return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorMessage message={error} /></div>
  if (!team)   return null

  const sorted = [...(players || [])].sort((a, b) => posOrder[a.position] - posOrder[b.position])

  return (
    <div className="page-enter max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-pitch border border-pitch-border flex items-center justify-center">
            <span className="font-display text-2xl text-green">{team.short_name}</span>
          </div>
          <div>
            <h1 className="font-display text-5xl text-white">{team.name}</h1>
            <p className="text-slate-500 text-sm">{team.league?.name}</p>
          </div>
        </div>
      </div>

      {/* Plantilla */}
      <div className="card">
        <h2 className="font-display text-2xl text-white mb-4">PLANTILLA</h2>
        {sorted.length === 0 ? (
          <p className="text-slate-500 text-sm">Sin jugadores registrados</p>
        ) : (
          <div className="space-y-2">
            {sorted.map(p => (
              <Link key={p.id} to={`/players/${p.id}`}
                className="flex items-center gap-4 py-2 border-b border-pitch-border/40 hover:text-green transition-colors">
                <span className={`font-mono text-xs font-bold w-8 ${posColor[p.position]}`}>{p.position}</span>
                <span className="flex-1 font-medium text-white hover:text-green transition-colors">{p.name}</span>
                {p.birth_date && (
                  <span className="text-xs text-slate-500 font-mono">
                    {Math.floor((Date.now() - new Date(p.birth_date)) / (365.25*24*3600*1000))} años
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
