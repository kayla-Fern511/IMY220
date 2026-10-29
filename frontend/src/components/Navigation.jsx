import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiUser, FiLogOut, FiBookOpen } from 'react-icons/fi';

export default function Navigation({ isLoggedIn = true, home = false, search = false, profile = false, isProfile = false }) {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('user')) || { username: 'testuser' };
  const [searchVal, setSearchVal] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    const q = searchVal.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q.replace(/^[#@]/, ''))}`);
    } else {
      navigate('/search');
    }
    setSearchVal('');
  };

  return (
    <header className="wireframe-desktop-nav">
      {/* Brand */}
      {isLoggedIn ? (
        <Link to="/home" className="nav-brand-container" aria-label="BookSnaps Home">
          <FiBookOpen style={{ fontSize: '1.6rem', color: 'var(--accent)' }} />
          <span className="brand-logo">BookSnaps</span>
        </Link>
      ) : (
        <Link to="/" className="nav-brand-container" aria-label="BookSnaps">
          <FiBookOpen style={{ fontSize: '1.6rem', color: 'var(--accent)' }} />
          <span className="brand-logo">BookSnaps</span>
        </Link>
      )}

      {/* Centre search bar (only when logged in) */}
      {isLoggedIn && (
        <form className="nav-search-form" onSubmit={handleNavSearch} role="search">
          <FiSearch className="nav-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search books, #tags, @readers…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            aria-label="Search"
          />
        </form>
      )}

      {/* Right-side icons */}
      {isLoggedIn ? (
        <nav className="nav-logged-in-icons" aria-label="Main navigation">
          <Link
            to="/home"
            id="nav-home-link"
            className={home ? 'nav-icon-link-current' : 'nav-icon-link'}
            title="Home feed"
            aria-label="Home"
          >
            <FiHome className="nav-icon-symbol" />
          </Link>
          <Link
            to="/search"
            id="nav-search-link"
            className={search ? 'nav-icon-link-current' : 'nav-icon-link'}
            title="Search"
            aria-label="Search"
          >
            <FiSearch className="nav-icon-symbol" />
          </Link>
          <Link
            to={`/profile/${loggedInUser.username}`}
            id="nav-profile-link"
            className={(profile && isProfile) ? 'nav-icon-link-current' : 'nav-icon-link'}
            title="My Profile"
            aria-label="My Profile"
          >
            <FiUser className="nav-icon-symbol" />
          </Link>
          <button
            id="nav-logout-btn"
            type="button"
            className="nav-icon-button"
            onClick={handleLogout}
            title="Log Out"
            aria-label="Log out"
          >
            <FiLogOut className="nav-icon-symbol" />
          </button>
        </nav>
      ) : (
        <div className="nav-logged-out-actions">
          <Link to="/signup" id="nav-signup-btn" className="wireframe-btn">Create Account</Link>
          <Link
            to="/login"
            id="nav-login-btn"
            className="wireframe-btn"
            style={{ background: 'var(--bg)', color: 'var(--text)', border: '1.5px solid var(--border)' }}
          >
            Sign In
          </Link>
        </div>
      )}
    </header>
  );
}