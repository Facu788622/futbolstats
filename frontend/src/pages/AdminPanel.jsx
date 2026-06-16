import { useState } from 'react'
import { patchFixture } from '../services/fixtureService'
import { getFixtures }  from '../services/fixtureService'
import useFetch from '../hooks/useFetch'
import useTitle from '../hooks/useTitle'
import Spinner from '../components/Spinner'

export default function AdminPanel() {
  useTitle('Admin')

  const { data: fixtures, loading, refetch } = useFetch(getFixtures, { league_id: 1 })
  const [editing,   setEditing]  = useState(null)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [status,    setStatus]   = useState('')
  const [saving,    setSaving]   = useState(false)
  const [msg,       setMsg]      = useState('')

  const openEdit = (f) => {
    setEditing(f.id)
    setHomeScore(f.home_score ?? '')
    setAwayScore(f.away_score ?? '')
    setStatus(f.status)
    setMsg('')
  }

  const save = async () => {
    setSaving(true)
    try {
      await patchFixture(editing, {
        status,
        home_score: homeScore !== '' ? Number(homeScore) : undefined,
        away_score: awayScore !== '' ? Number(awayScore) : undefined,
      })
      setMsg('✓ Guardado')
      setEditing(null)
      refetch()
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="admin-panel" className="page-enter max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl text-white mb-2">PANEL ADMIN</h1>
      <p className="text-slate-500 text-sm mb-8">Gestión de partidos</p>

      {loading && <Spinner />}

      <div className="space-y-3">
        {fixtures?.map(f => (
          <div key={f.id} className="card">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-white font-medium">
                  {f.homeTeam?.name} <span className="text-slate-500">vs</span> {f.awayTeam?.name}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Fecha {f.matchday} — {f.status}
                  {f.status !== 'scheduled' && ` — ${f.home_score}:${f.away_score}`}
                </p>
              </div>
              <button
                data-testid="edit-player-btn"
                onClick={() => openEdit(f)}
                className="btn-ghost text-xs py-1.5"
              >
                Editar
              </button>
            </div>

            {editing === f.id && (
              <div className="mt-4 pt-4 border-t border-pitch-border space-y-3">
                <div className="flex gap-3 items-center flex-wrap">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Estado</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="bg-pitch border border-pitch-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green"
                    >
                      <option value="scheduled">scheduled</option>
                      <option value="live">live</option>
                      <option value="finished">finished</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Local</label>
                    <input
                      type="number"
                      min="0"
                      value={homeScore}
                      onChange={e => setHomeScore(e.target.value)}
                      className="w-16 bg-pitch border border-pitch-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Visitante</label>
                    <input
                      type="number"
                      min="0"
                      value={awayScore}
                      onChange={e => setAwayScore(e.target.value)}
                      className="w-16 bg-pitch border border-pitch-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green"
                    />
                  </div>
                  <div className="flex gap-2 self-end">
                    <button onClick={save} disabled={saving} className="btn-primary text-xs py-2">
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button onClick={() => setEditing(null)} className="btn-ghost text-xs py-2">
                      Cancelar
                    </button>
                  </div>
                </div>
                {msg && (
                  <p className={`text-xs ${msg.startsWith('✓') ? 'text-green' : 'text-red-400'}`}>
                    {msg}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
