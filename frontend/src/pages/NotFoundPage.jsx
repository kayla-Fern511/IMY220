import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const isAuthenticated = Boolean(localStorage.getItem('user'));

    return (
        <div className="app-container notfound-desktop-container">
            <Navigation isLoggedIn={isAuthenticated} />

            <main className="notfound-main-content">
                <p className="notfound-code" aria-hidden="true">404</p>
                <h1 className="notfound-heading">Page Not Found</h1>
                <p className="notfound-description">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="notfound-action-row">
                    <button
                        id="notfound-home-btn"
                        type="button"
                        className="wireframe-btn notfound-home-btn"
                        onClick={() => navigate(isAuthenticated ? '/home' : '/')}
                    >
                        Back to {isAuthenticated ? 'Feed' : 'Home'}
                    </button>
                    <button
                        id="notfound-back-btn"
                        type="button"
                        className="wireframe-btn"
                        style={{ background: 'var(--bg)', color: 'var(--text)', border: '1.5px solid var(--border)' }}
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </button>
                </div>
            </main>

            <Footer isLoggedIn={isAuthenticated} />
        </div>
    );
}