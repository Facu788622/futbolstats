import { useState } from "react";
import { getFixtures } from "../services/fixtureService";
import useFetch from "../hooks/useFetch";
import useTitle from "../hooks/useTitle";
import FixtureCard from "../components/FixtureCard";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

const STATUSES = [
  { value: "", label: "Todos" },
  { value: "scheduled", label: "Programados" },
  { value: "live", label: "En vivo" },
  { value: "finished", label: "Finalizados" },
];

export default function Fixtures() {
  useTitle("Partidos");

  const [status, setStatus] = useState("");
  const [matchday, setMatchday] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = { league_id: 1 };
  if (status) params.status = status;
  if (matchday) params.matchday = matchday;

  const { data: fixtures, loading, error } = useFetch(getFixtures, params);

  // Filtro por rango de fechas del lado del cliente
  const filtered = (fixtures || []).filter((f) => {
    const fechaPartido = new Date(f.date);
    if (dateFrom && fechaPartido < new Date(dateFrom)) return false;
    if (dateTo && fechaPartido > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, f) => {
    const key = `Fecha ${f.matchday}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl text-white mb-6">PARTIDOS</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Filtro por estado */}
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                status === s.value
                  ? "border-green text-green bg-green-muted"
                  : "border-pitch-border text-slate-400 hover:border-green/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Filtro por fecha # */}
        <input
          type="number"
          placeholder="Fecha #"
          value={matchday}
          onChange={(e) => setMatchday(e.target.value)}
          className="w-24 bg-pitch-light border border-pitch-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green"
        />

        {/* Filtro por rango de fechas */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-slate-500">Desde</label>
            <input
              type="date"
              value={dateFrom}
              data-testid="date-from"
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-pitch-light border border-pitch-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-green"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-slate-500">Hasta</label>
            <input
              type="date"
              value={dateTo}
              data-testid="date-to"
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-pitch-light border border-pitch-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-green"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              data-testid="apply-date-filter"
              onClick={clearDates}
              className="self-end text-xs text-slate-400 border border-pitch-border rounded-lg px-3 py-1.5 hover:border-green/50 transition-colors"
            >
              Limpiar fechas
            </button>
          )}
        </div>
      </div>

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {!loading &&
        !error &&
        Object.entries(grouped).map(([fecha, items]) => (
          <div key={fecha} className="mb-8">
            <h2 className="font-display text-2xl text-slate-400 mb-3">
              {fecha}
            </h2>
            <div className="space-y-3">
              {items.map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </div>
          </div>
        ))}

      {!loading && !error && !filtered.length && (
        <p className="text-slate-500 text-center py-12">
          No hay partidos para mostrar
        </p>
      )}
    </div>
  );
}
