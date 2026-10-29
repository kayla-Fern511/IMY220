import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.identifier.trim() || !formData.password.trim()) {
            setError('Please fill in both email/username and password.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                navigate('/home');
            } else {
                setError(data.message || 'Login failed. Check your credentials.');
            }
        } catch {
            setError('Could not connect to the backend. Ensure the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container login-desktop-container">
            <Navigation isLoggedIn={false} />

            <main className="auth-centered-layout">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <h1 className="auth-title">Welcome back</h1>
                        <p className="auth-subtitle">Sign in to your BookSnaps account</p>
                    </div>

                    <form id="login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
                        {error && <p className="form-error-msg" role="alert">{error}</p>}

                        <div className="input-group">
                            <label className="wireframe-label" htmlFor="login-identifier">
                                Email or Username
                            </label>
                            <input
                                id="login-identifier"
                                className="auth-input"
                                type="text"
                                placeholder="reader@example.com or @bookworm"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="wireframe-label" htmlFor="login-password">
                                Password
                            </label>
                            <input
                                id="login-password"
                                className="auth-input"
                                type="password"
                                placeholder="Your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            id="login-submit-btn"
                            type="submit"
                            className="wireframe-btn auth-submit-btn"
                            disabled={isLoading}
                            style={{ justifyContent: 'center' }}
                        >
                            {isLoading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="auth-footer-link">
                        New to BookSnaps?{' '}
                        <Link to="/signup">Create a free account</Link>
                    </p>
                </div>
            </main>

            <Footer isLoggedIn={false} />
        </div>
    );
}
