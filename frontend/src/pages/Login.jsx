import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useTitle from "../hooks/useTitle";

export default function Login() {
  useTitle("Login");

  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-5xl text-white mb-2">ACCEDER</h1>
        <p className="text-slate-500 text-sm mb-8">
          Ingresá con tu cuenta de FutbolStats
        </p>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-pitch border border-pitch-border text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-green"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-pitch border border-pitch-border text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-green"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-slate-500 text-sm text-center mt-6">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="text-green hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
