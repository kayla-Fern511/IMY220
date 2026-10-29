import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const features = [
  {
    icon: '📸',
    title: 'Share Your Reads',
    desc: 'Post photos of your current reads, cozy corners, and annotated pages.'
  },
  {
    icon: '📚',
    title: 'Discover Books',
    desc: 'Explore what other readers are loving and add to your TBR list.'
  },
  {
    icon: '🤝',
    title: 'Build Your Community',
    desc: 'Follow fellow readers, exchange recommendations, and make friends.'
  }
];

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

        {/* Feature cards */}
        <div className="splash-feature-grid" role="list">
          {features.map((feat) => (
            <div key={feat.title} className="splash-feature-card" role="listitem">
              <div className="splash-feature-icon" aria-hidden="true">{feat.icon}</div>
              <h3 className="splash-feature-title">{feat.title}</h3>
              <p className="splash-feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer isLoggedIn={false} />
    </div>
  );
}