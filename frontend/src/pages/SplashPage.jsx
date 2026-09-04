import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation'


export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Navigation isLoggedIn={false} />

      <main className="splash-desktop-container">
        <section className="splash-hero-left">
          <h2>Welcome to BookSnaps</h2>
          <p className="tagline">Every click tells a story</p>
          <div>
            <p>
              BookSnaps is a photo-sharing platform designed for book lovers, readers, and literary aesthetic creators. Users can share photos of their current reads, cozy book nooks, annotated pages, and indie bookstore visits, while discovering new books and connecting with a community of passionate readers.
            </p>
          </div>
          <div className="splash-actions-desktop">
            <button className="wireframe-btn" onClick={() => navigate('/signup')}>Create Account</button>
            <button
              className="wireframe-btn"
              style={{ backgroundColor: 'var(--tags-color)', color: 'var(--text-main)' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </section>

        <section className="splash-hero-right">
          <div className="splash-placeholder-graphic">
            <img src={logoImg} alt="BookSnaps Logo" className="nav-logo-image" style={{ height: '420px', width: 'auto' }} />
          </div>
        </section>
      </main>
      <Footer isLoggedIn={false} />
    </div>
  );
}