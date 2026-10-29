import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiUser, FiLogOut, FiInbox, FiClipboard, FiBookOpen } from 'react-icons/fi';

export default function Navigation({
  home = false,
  search = false,
  profile = false,
  isProfile = false,
  isActivity = false,
  admin = false
}) {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = Boolean(loggedInUser);
  const isUserAdmin = Boolean(loggedInUser && loggedInUser.role === 'admin');
  const [searchVal, setSearchVal] = useState('');

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

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('Network error during backend logout:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <header className="wireframe-desktop-nav">
      {/* Brand */}
      <Link
        to={isLoggedIn ? '/home' : '/'}
        className="nav-brand-container"
        aria-label="BookSnaps Home"
      >
        <FiBookOpen style={{ fontSize: '1.6rem', color: 'var(--accent)' }} />
        <span className="brand-logo">BookSnaps</span>
      </Link>

      {/* Centre search bar (prominent Pinterest-style) */}
      {isLoggedIn && (
        <form className="nav-search-form" onSubmit={handleNavSearch} role="search">
          <FiSearch className="nav-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search books, #tags, @readers…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            aria-label="Search BookSnaps"
          />
        </form>
      )}

      {/* Right side navigation icons / actions */}
      {isLoggedIn ? (
        <nav className="nav-logged-in-icons" aria-label="Main navigation">
          {isUserAdmin && (
            <Link
              to="/admin"
              id="nav-admin-link"
              className={admin ? 'nav-icon-link-current' : 'nav-icon-link'}
              title="Admin Dashboard"
              aria-label="Admin Dashboard"
            >
              <FiClipboard className="nav-icon-symbol" />
            </Link>
          )}

          <Link
            to="/home"
            id="nav-home-link"
            className={home ? 'nav-icon-link-current' : 'nav-icon-link'}
            title="Home Feed"
            aria-label="Home Feed"
          >
            <FiHome className="nav-icon-symbol" />
          </Link>

          <Link
            to="/search"
            id="nav-search-link"
            className={search ? 'nav-icon-link-current' : 'nav-icon-link'}
            title="Explore & Search"
            aria-label="Search"
          >
            <FiSearch className="nav-icon-symbol" />
          </Link>

          <Link
            to="/activity"
            id="nav-activity-link"
            className={isActivity ? 'nav-icon-link-current' : 'nav-icon-link'}
            title="Recent Activity"
            aria-label="Activity"
          >
            <FiInbox className="nav-icon-symbol" />
          </Link>

          <Link
            to={`/profile/${loggedInUser?.username || ''}`}
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
            aria-label="Log Out"
          >
            <FiLogOut className="nav-icon-symbol" />
          </button>
        </nav>
      ) : (
        <div className="nav-logged-out-actions">
          <Link to="/signup" id="nav-signup-btn" className="wireframe-btn">
            Create Account
          </Link>
          <Link
            to="/login"
            id="nav-login-btn"
            className="wireframe-btn"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1.5px solid var(--border)'
            }}
          >
            Sign In
          </Link>
        </div>
      )}
    </header>
  );
}
