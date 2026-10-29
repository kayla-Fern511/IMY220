import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    pronouns: '',
    username: '',
    bio: '',
    links: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.username.trim()) {
      setError('Username is required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        // Save user so the app knows who is logged in
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else {
        setError(data.message || 'Sign up failed.');
      }
    } catch {
      setError('Could not connect to the backend. Ensure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container signup-wireframe-screen">
      <Navigation isLoggedIn={false} />

      <main className="auth-centered-layout">
        <div className="auth-card signup-auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start sharing your reading journey</p>
          </div>

          <form id="signup-form" className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <p className="form-error-msg signup-error-banner" role="alert">{error}</p>}

            {/* Two-column grid for most fields */}
            <div className="signup-three-columns-wrapper">
              <div className="signup-field-group">
                <label htmlFor="signup-name">First Name *</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Jane"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-field-group">
                <label htmlFor="signup-surname">Last Name *</label>
                <input
                  id="signup-surname"
                  name="surname"
                  type="text"
                  placeholder="Austen"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-field-group">
                <label htmlFor="signup-username">Username *</label>
                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  placeholder="bookworm42"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-field-group">
                <label htmlFor="signup-email">Email *</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="jane@reads.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-field-group">
                <label htmlFor="signup-password">Password *</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-field-group">
                <label htmlFor="signup-confirmPassword">Confirm Password *</label>
                <input
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-field-group">
                <label htmlFor="signup-pronouns">Pronouns</label>
                <input
                  id="signup-pronouns"
                  name="pronouns"
                  type="text"
                  placeholder="she/her, they/them…"
                  value={formData.pronouns}
                  onChange={handleChange}
                />
              </div>

              <div className="signup-field-group">
                <label htmlFor="signup-links">Goodreads / Website</label>
                <input
                  id="signup-links"
                  name="links"
                  type="text"
                  placeholder="goodreads.com/user/jane"
                  value={formData.links}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Bio spans full width */}
            <div className="signup-field-group" style={{ marginTop: '4px' }}>
              <label htmlFor="signup-bio">Short Bio</label>
              <input
                id="signup-bio"
                name="bio"
                type="text"
                placeholder="Fantasy lover & cozy mystery reader 📚"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              className="wireframe-btn auth-submit-btn"
              disabled={isLoading}
              style={{ justifyContent: 'center', marginTop: '4px' }}
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-link">
            Already a reader? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>

      <Footer isLoggedIn={false} />
    </div>
  );
}