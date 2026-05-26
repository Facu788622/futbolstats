import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const { login, loading }      = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white">FUTBOL<span className="text-green">STATS</span></h1>
          <p className="text-slate-500 text-sm mt-1">Ingresá a tu cuenta</p>
        </div>

        <div className="card space-y-4">
          {error && (
            <div className="bg-red-muted border border-red/30 text-red text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@futbolstats.com"
              className="w-full bg-pitch border border-pitch-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-pitch border border-pitch-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green transition-colors"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-xs text-slate-500">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-green hover:underline">Registrate</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Admin: admin@futbolstats.com / admin1234
        </p>
      </div>
    </div>
  )
}
