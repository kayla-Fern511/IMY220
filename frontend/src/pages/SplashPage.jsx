import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Navigation isLoggedIn={false} />

      <main className="splash-desktop-container">
        <div className="splash-hero-content">
          <span className="splash-eyebrow">For Book Lovers</span>

          <section className="splash-hero-left">
            <h2>Your reading life,<br />beautifully shared.</h2>
            <p className="tagline">
              BookSnaps is a visual diary for readers. Share photos, document your
              reading progress, and discover a community that loves books as much as you do.
            </p>
          </section>

          <div className="splash-actions-desktop">
            <button
              id="splash-signup-btn"
              className="wireframe-btn"
              onClick={() => navigate('/signup')}
            >
              Get Started — It's Free
            </button>
            <button
              id="splash-login-btn"
              className="wireframe-btn"
              style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1.5px solid var(--border)' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>        
      </main>

      <Footer isLoggedIn={false} />
    </div>
  );
}