import { useState } from "react";
import { useParams } from "react-router-dom";
import { getFixtureStats } from "../services/fixtureService";
import useFetch from "../hooks/useFetch";
import useTitle from "../hooks/useTitle";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

const eventIcon = {
  goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution: "🔄",
};

export default function FixtureDetail() {
  useTitle("Detalle de Partido");

  const { id } = useParams();
  const { data, loading, error } = useFetch(getFixtureStats, id);
  const [maxMinute, setMaxMinute] = useState(90);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  if (!data) return null;

  const { fixture, stats, events } = data;
  const { homeTeam, awayTeam, home_score, away_score, status, matchday, date } =
    fixture;
  const d = new Date(date);

  const filteredEvents = (events || []).filter((e) => e.minute <= maxMinute);

  return (
    <div className="page-enter max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header del partido */}
      <div className="card text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, #00d084, transparent 60%)",
          }}
        />
        <p className="text-xs text-slate-500 font-mono mb-4">
          Fecha {matchday} —{" "}
          {d.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <div className="flex items-center justify-center gap-8">
          <div className="flex-1 text-right">
            <h2 className="font-display text-4xl text-white">
              {homeTeam?.name}
            </h2>
            <p className="text-xs text-slate-500">{homeTeam?.short_name}</p>
          </div>
          <div className="px-6 py-3 bg-pitch rounded-xl border border-pitch-border">
            {status === "scheduled" ? (
              <p className="font-mono text-slate-400 text-lg">
                {d.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            ) : (
              <p className="font-display text-5xl text-white">
                {home_score} - {away_score}
              </p>
            )}
          </div>
          <div className="flex-1 text-left">
            <h2 className="font-display text-4xl text-white">
              {awayTeam?.name}
            </h2>
            <p className="text-xs text-slate-500">{awayTeam?.short_name}</p>
          </div>
        </div>
      </div>

      {/* Stats del partido */}
      {status !== "scheduled" && (
        <div className="card">
          <h3 className="font-display text-xl text-white mb-4">ESTADÍSTICAS</h3>
          {[
            { label: "Goles", home: stats.home.goals, away: stats.away.goals },
            {
              label: "Amarillas",
              home: stats.home.yellow_cards,
              away: stats.away.yellow_cards,
            },
            {
              label: "Rojas",
              home: stats.home.red_cards,
              away: stats.away.red_cards,
            },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-4 mb-3">
              <span className="font-display text-2xl text-green w-8 text-right">
                {row.home}
              </span>
              <div className="flex-1">
                <p className="text-xs text-slate-500 text-center mb-1">
                  {row.label}
                </p>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-pitch">
                  <div
                    className="bg-green transition-all"
                    style={{
                      width: `${row.home + row.away ? (row.home / (row.home + row.away)) * 100 : 50}%`,
                    }}
                  />
                  <div className="bg-slate-600 flex-1" />
                </div>
              </div>
              <span className="font-display text-2xl text-white w-8">
                {row.away}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Eventos con slider de filtro por minuto */}
      {events?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-white">EVENTOS</h3>
            <span className="text-xs text-slate-500 font-mono">
              {filteredEvents.length} de {events.length}
            </span>
          </div>

          {/* Slider de filtro por minuto */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">
                Filtrar por minuto
              </label>
              <span
                data-testid="minute-value"
                className="text-xs text-green font-mono"
              >
                {maxMinute}'
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={maxMinute}
              data-testid="minute-slider"
              onChange={(e) => setMaxMinute(Number(e.target.value))}
              className="w-full accent-green cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-0.5">
              <span>1'</span>
              <span>45'</span>
              <span>90'</span>
            </div>
          </div>

          <div className="space-y-2">
            {filteredEvents.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">
                No hay eventos hasta el minuto {maxMinute}
              </p>
            )}
            {filteredEvents.map((e) => {
              const isHome = e.team_id === fixture.home_team_id;
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-3 ${isHome ? "flex-row" : "flex-row-reverse"}`}
                >
                  <span className="text-lg">{eventIcon[e.type]}</span>
                  <div
                    className={`flex-1 ${isHome ? "text-left" : "text-right"}`}
                  >
                    <span className="text-sm text-white">
                      {e.player?.name || "—"}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500 w-10 text-center">
                    {e.minute}'
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
