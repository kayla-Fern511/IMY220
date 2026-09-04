import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import logoImg from '../assets/logo.png';

export default function NotFoundPage() {
    const navigate = useNavigate();

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const isAuthenticated = Boolean(token);

    return (
        <div className="app-container notfound-desktop-container">
            <Navigation isLoggedIn={isAuthenticated} />

            <main className="notfound-main-content">
                <div className="notfound-left-pane">
                    <span className="notfound-code">404</span>
                    <h1 className="notfound-heading">Page Not Found</h1>
                    <p className="notfound-description">
                        Page not found
                    </p>

                    <div className="notfound-action-row">
                        <button
                            type="button"
                            className="back-arrow-btn"
                            onClick={() => navigate(-1)}
                            aria-label="Go Back"
                        >
                            ←
                        </button>
                    </div>
                </div>

                <div className="notfound-right-pane">
                    <img
                        src={logoImg}
                        alt="BookSnaps Graphic"
                        className="notfound-graphic-preview"
                    />
                </div>
            </main>

            <Footer isLoggedIn={isAuthenticated} />
        </div>
    );
}