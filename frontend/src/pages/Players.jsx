import { useState } from "react";
import { Link } from "react-router-dom";
import { getPlayers } from "../services/playerService";
import useFetch from "../hooks/useFetch";
import useTitle from "../hooks/useTitle";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

const POSITIONS = ["", "GK", "DEF", "MID", "FWD"];
const posLabel = {
  "": "Todos",
  GK: "Porteros",
  DEF: "Defensas",
  MID: "Mediocampistas",
  FWD: "Delanteros",
};
const posColor = {
  GK: "text-slate-400",
  DEF: "text-blue-400",
  MID: "text-amber-400",
  FWD: "text-green",
};

export default function Players() {
  useTitle("Jugadores");

  const [position, setPosition] = useState("");
  const {
    data: players,
    loading,
    error,
  } = useFetch(getPlayers, position ? { position } : {});

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl text-white mb-6">JUGADORES</h1>

      {/* Filtro por posición */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {POSITIONS.map((p) => (
          <button
            key={p}
            data-testid="position-filter-btn"
            onClick={() => setPosition(p)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              position === p
                ? "border-green text-green bg-green-muted"
                : "border-pitch-border text-slate-400 hover:border-green/50"
            }`}
          >
            {posLabel[p]}
          </button>
        ))}
      </div>

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players?.map((p) => (
            <Link
              key={p.id}
              to={`/players/${p.id}`}
              data-testid="player-card"
              className="card flex items-center gap-4 hover:border-green/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-pitch-light flex items-center justify-center text-slate-400 font-mono text-sm flex-shrink-0">
                {p.jersey_number ?? "—"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  data-testid="player-name"
                  className="text-white text-sm font-medium truncate"
                >
                  {p.name}
                </p>
                <p
                  className={`text-xs mt-0.5 ${posColor[p.position] || "text-slate-400"}`}
                >
                  {p.position} · {p.team?.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && !players?.length && (
        <p className="text-slate-500 text-center py-12">
          No hay jugadores para mostrar
        </p>
      )}
    </div>
  );
}
