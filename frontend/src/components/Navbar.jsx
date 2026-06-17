import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/fixtures", label: "Partidos" },
  { to: "/standings", label: "Tabla" },
  { to: "/players", label: "Jugadores" },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      data-testid="navbar"
      className="fixed top-0 inset-x-0 z-50 border-b border-pitch-border bg-pitch/90 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <NavLink
          to="/"
          className="font-display text-2xl text-green tracking-widest"
        >
          FUTBOL<span className="text-white">STATS</span>
        </NavLink>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-green bg-green-muted"
                      : "text-slate-400 hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          {isAdmin && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-amber bg-amber-muted"
                      : "text-slate-400 hover:text-amber"
                  }`
                }
              >
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-slate-400 hidden sm:block">
                {user.email}
              </span>
              <button
                data-testid="logout-btn"
                onClick={handleLogout}
                className="btn-ghost text-xs py-1.5"
              >
                Salir
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn-primary text-xs py-1.5">
              Ingresar
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
