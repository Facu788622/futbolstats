import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlayers, getTopScorers } from '../services/playerService'
import useFetch from '../hooks/useFetch'
import TopScorers from '../components/TopScorers'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

const POSITIONS = ['', 'GK', 'DEF', 'MID', 'FWD']
const posLabel  = { '': 'Todos', GK: 'Porteros', DEF: 'Defensas', MID: 'Mediocampistas', FWD: 'Delanteros' }
const posColor  = { GK: 'text-slate-400', DEF: 'text-blue-400', MID: 'text-amber', FWD: 'text-green' }

export default function Players() {
  const [position, setPosition] = useState('')
  const { data: players, loading, error } = useFetch(getPlayers, position ? { position } : {})
  const { data: scorers } = useFetch(getTopScorers, { limit: 10 })

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl text-white mb-6">JUGADORES</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista */}
        <div className="lg:col-span-2">
          {/* Filtro posición */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {POSITIONS.map(p => (
              <button
                key={p}
                onClick={() => setPosition(p)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  position === p
                    ? 'border-green text-green bg-green-muted'
                    : 'border-pitch-border text-slate-400 hover:border-green/50'
                }`}
              >
                {posLabel[p]}
              </button>
            ))}
          </div>

          {loading && <Spinner />}
          {error   && <ErrorMessage message={error} />}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players?.map(p => (
                <Link key={p.id} to={`/players/${p.id}`}
                  className="card hover:border-green/50 transition-colors flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pitch border border-pitch-border flex items-center justify-center">
                    <span className={`font-mono text-xs font-bold ${posColor[p.position]}`}>{p.position}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.team?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Goleadores sidebar */}
        <div className="card h-fit">
          <h2 className="font-display text-xl text-white mb-4">TOP GOLEADORES</h2>
          <TopScorers players={scorers} />
        </div>
      </div>
    </div>
  )
}
