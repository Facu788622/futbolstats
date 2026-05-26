import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as registerService } from '../services/authService'

export default function Register() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerService({ email, password })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white">FUTBOL<span className="text-green">STATS</span></h1>
          <p className="text-slate-500 text-sm mt-1">Creá tu cuenta</p>
        </div>
        <div className="card space-y-4">
          {error && (
            <div className="bg-red-muted border border-red/30 text-red text-sm rounded-lg px-4 py-3">{error}</div>
          )}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-pitch border border-pitch-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green transition-colors" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-pitch border border-pitch-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green transition-colors" />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-50">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          <p className="text-center text-xs text-slate-500">
            ¿Ya tenés cuenta? <Link to="/login" className="text-green hover:underline">Ingresá</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
