import { Link } from "react-router-dom";

export default function StandingsTable({ standings }) {
  if (!standings?.length)
    return (
      <p className="text-slate-500 text-sm text-center py-6">
        Sin datos de tabla
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-pitch-border text-slate-500 text-xs uppercase tracking-wider">
            <th className="pb-3 text-left w-8">#</th>
            <th className="pb-3 text-left">Equipo</th>
            <th className="pb-3 text-center">PJ</th>
            <th className="pb-3 text-center">G</th>
            <th className="pb-3 text-center">E</th>
            <th className="pb-3 text-center">P</th>
            <th className="pb-3 text-center">GF</th>
            <th className="pb-3 text-center">GC</th>
            <th className="pb-3 text-center">DG</th>
            <th className="pb-3 text-center font-bold text-green">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.id}
              data-testid="standings-row"
              className="border-b border-pitch-border/50 hover:bg-pitch-light/50 transition-colors"
            >
              <td
                data-testid="position"
                className="py-3 text-slate-500 font-mono text-xs"
              >
                {i + 1}
              </td>
              <td className="py-3">
                <Link
                  data-testid="team-link"
                  to={`/teams/${s.team?.id}`}
                  className="font-medium text-white hover:text-green transition-colors"
                >
                  {s.team?.name}
                </Link>
              </td>
              <td className="py-3 text-center text-slate-400">{s.played}</td>
              <td
                data-testid="wins"
                className="py-3 text-center text-slate-400"
              >
                {s.won}
              </td>
              <td
                data-testid="draws"
                className="py-3 text-center text-slate-400"
              >
                {s.drawn}
              </td>
              <td className="py-3 text-center text-slate-400">{s.lost}</td>
              <td className="py-3 text-center text-slate-400">{s.goals_for}</td>
              <td className="py-3 text-center text-slate-400">
                {s.goals_against}
              </td>
              <td className="py-3 text-center text-slate-400">
                {s.goals_for - s.goals_against > 0 ? "+" : ""}
                {s.goals_for - s.goals_against}
              </td>
              <td
                data-testid="points"
                className="py-3 text-center font-display text-lg text-green"
              >
                {s.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
