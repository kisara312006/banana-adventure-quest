import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Welcome() {
  const { user } = useAuth();
  return (
    <section className="hero">
      <div className="hero-banana" aria-hidden="true">🍌</div>
      <h1>Banana Adventure Quest</h1>
      <p className="lead">Explore four fruity jungle levels, solve puzzles, earn rewards and unlock the Final Treasure!</p>
      <div className="row center-row">
        {user ? <Link className="btn big" to="/dashboard">Continue adventure</Link> : (
          <>
            <Link className="btn big" to="/register">Start your quest</Link>
            <Link className="btn big ghost" to="/login">I have an account</Link>
          </>
        )}
      </div>
    </section>
  );
}
