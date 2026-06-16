import { getFixtures } from "../services/fixtureService";
import { getStandings } from "../services/standingService";
import { getTopScorers } from "../services/playerService";
import useFetch from "../hooks/useFetch";
import useTitle from "../hooks/useTitle";
import FixtureCard from "../components/FixtureCard";
import StandingsTable from "../components/StandingsTable";
import TopScorers from "../components/TopScorers";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Home() {
  useTitle("Inicio");

  const {
    data: fixtures,
    loading: lf,
    error: ef,
  } = useFetch(getFixtures, { league_id: 1, status: "live" });
  const { data: standings, loading: ls, error: es } = useFetch(getStandings, 1);
  const { data: scorers, loading: lsc } = useFetch(getTopScorers, {
    league_id: 1,
    season_id: 1,
  });

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-8 space-y-12">
      <section>
        <h1 className="font-display text-5xl text-white mb-2">EN VIVO</h1>
        <p className="text-slate-500 text-sm mb-6">
          Liga Profesional — partidos en curso
        </p>
        {lf && <Spinner />}
        {ef && <ErrorMessage message={ef} />}
        {!lf &&
          !ef &&
          (fixtures?.length ? (
            <div className="space-y-3">
              {fixtures.map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              No hay partidos en vivo ahora mismo.
            </p>
          ))}
      </section>

      <section>
        <h2 className="font-display text-3xl text-white mb-4">TABLA</h2>
        <div className="card">
          {ls && <Spinner />}
          {es && <ErrorMessage message={es} />}
          {!ls && !es && <StandingsTable standings={standings} />}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl text-white mb-4">GOLEADORES</h2>
        {lsc && <Spinner />}
        {!lsc && <TopScorers scorers={scorers} />}
      </section>
    </div>
  );
}
