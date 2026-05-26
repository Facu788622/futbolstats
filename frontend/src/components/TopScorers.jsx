import { Link } from 'react-router-dom'

const posColor = { GK: 'text-slate-400', DEF: 'text-blue-400', MID: 'text-amber', FWD: 'text-green' }

export default function TopScorers({ players }) {
  if (!players?.length) return <p className="text-slate-500 text-sm text-center py-6">Sin datos</p>

  return (
    <div className="space-y-2">
      {players.map((p, i) => {
        const goals = p.stats?.[0]?.goals ?? 0
        return (
          <div key={p.id} className="flex items-center gap-3 py-2 border-b border-pitch-border/40">
            <span className="font-mono text-xs text-slate-500 w-5 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <Link to={`/players/${p.id}`} className="font-medium text-white hover:text-green transition-colors truncate block">
                {p.name}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-mono ${posColor[p.position]}`}>{p.position}</span>
                <span className="text-xs text-slate-500">{p.team?.name}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-2xl text-green">{goals}</span>
              <p className="text-xs text-slate-500">goles</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
