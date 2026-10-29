import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PostPreview from '../components/PostPreview';
import PostSkeleton from '../components/PostSkeleton';
import Filters from '../components/Filters';
import { FiSliders } from 'react-icons/fi';

const SKELETON_HEIGHTS = ['220px', '300px', '180px', '260px', '340px', '200px', '280px', '150px'];

export default function HomePage() {
  const [activeFeed, setActiveFeed] = useState('global');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ tag: '', sortBy: 'newest' });
  const [posts, setPosts] = useState([]);
  const [rawServerPosts, setRawServerPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    setLoading(true);
    setError('');

    const startTime = Date.now();
    const userParam = loggedInUser?.username ? `&user=${encodeURIComponent(loggedInUser.username)}` : '';
    const url = activeFeed === 'local' && loggedInUser?.username
      ? `http://localhost:5000/api/posts?feed=local${userParam}`
      : `http://localhost:5000/api/posts?feed=global`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const postList = Array.isArray(data) ? data : [];
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsedTime);

        setTimeout(() => {
          setPosts(postList);
          setRawServerPosts(postList);
          setLoading(false);
        }, remainingTime);
      })
      .catch(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsedTime);

        setTimeout(() => {
          setError('Could not connect to the server. Make sure the backend is running.');
          setPosts([]);
          setRawServerPosts([]);
          setLoading(false);
        }, remainingTime);
      });
  }, [activeFeed, loggedInUser?.username]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    let filtered = [...rawServerPosts];

    if (newFilters.tag) {
      const term = newFilters.tag.toLowerCase();
      filtered = filtered.filter((p) => {
        const tags = Array.isArray(p.hashtags) ? p.hashtags.join(' ') : String(p.hashtags || '');
        return tags.toLowerCase().includes(term);
      });
    }

    if (newFilters.sortBy === 'likes') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setPosts(filtered);
  };

  const handleResetFilters = () => {
    setFilters({ tag: '', sortBy: 'newest' });
    setPosts(rawServerPosts);
  };

  return (
    <div className="app-container home-desktop-screen">
      <Navigation home={true} />

      <div className="home-page-content">
        {/* Feed selector and filters toggle bar */}
        <div className="home-subbar">
          <div className="home-feed-toggle-group" role="group" aria-label="Feed selector">
            <button
              id="feed-btn-local"
              type="button"
              className={`feed-switch-btn ${activeFeed === 'local' ? 'active' : ''}`}
              onClick={() => setActiveFeed('local')}
              aria-pressed={activeFeed === 'local'}
            >
              Your Feed
            </button>
            <button
              id="feed-btn-global"
              type="button"
              className={`feed-switch-btn ${activeFeed === 'global' ? 'active' : ''}`}
              onClick={() => setActiveFeed('global')}
              aria-pressed={activeFeed === 'global'}
            >
              Explore
            </button>
          </div>

          <button
            id="home-filters-toggle"
            type="button"
            className={`home-filters-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
          >
            <FiSliders />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>

        {showFilters && (
          <Filters
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Error banner */}
        {error && !loading && (
          <p
            className="form-error-msg"
            style={{ maxWidth: '500px', margin: '0 auto 24px' }}
          >
            {error}
          </p>
        )}

        {/* Pinterest Masonry Feed */}
        <main className="masonry-grid" aria-label="Post feed" aria-busy={loading}>
          {loading && SKELETON_HEIGHTS.map((h, i) => (
            <div key={i} className="masonry-item" aria-hidden="true">
              <PostSkeleton height={h} />
            </div>
          ))}

          {!loading && !error && posts.length === 0 && (
            <div className="feed-empty-state" style={{ columnSpan: 'all', gridColumn: '1 / -1' }}>
              <div className="feed-empty-icon">📚</div>
              <p className="feed-empty-title">
                {activeFeed === 'local' ? 'Nothing from your friends yet' : 'No posts yet'}
              </p>
              <p className="feed-empty-sub">
                {activeFeed === 'local'
                  ? 'Connect with fellow readers or switch to Explore to discover book snaps.'
                  : 'Be the first to share a book snap!'}
              </p>
            </div>
          )}

          {!loading && !error && posts.map((post, idx) => (
            <div
              key={post.id || post._id || idx}
              className="masonry-item post-card-animated-wrapper"
              style={{ animationDelay: `${Math.min(idx * 0.07, 0.8)}s` }}
            >
              <PostPreview post={post} />
            </div>
          ))}
        </main>
      </div>

      <Footer />
    </div>
  );
}
