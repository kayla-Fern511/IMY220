import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PostSkeleton from '../components/PostSkeleton';
import ActivityCard from '../components/ActivityCard';

export default function ActivityPage() {
  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  const [feedScope, setFeedScope] = useState('global');
  const [filterType, setFilterType] = useState('all');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const startTime = Date.now();
    
    const userParam = loggedInUser?.username ? `&user=${encodeURIComponent(loggedInUser.username)}` : '';
    const url = `http://localhost:5000/api/activity?feed=${feedScope}${userParam}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsedTime);

        setTimeout(() => {
          setActivities(list);
          setLoading(false);
        }, remainingTime);
      })
      .catch(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsedTime);

        setTimeout(() => {
          setError('Could not connect to the activity feed.');
          setActivities([]);
          setLoading(false);
        }, remainingTime);
      });
  }, [feedScope, loggedInUser?.username]);

  const displayedActivities = activities.filter((item) => {
    if (filterType === 'posts') return item.actionType === 'created_post';
    if (filterType === 'albums') {
      return item.actionType === 'created_album' || item.actionType === 'added_to_album';
    }
    return true;
  });

  return (
    <div className="app-container home-desktop-screen">
      <Navigation isActivity={true} />

      <main className="activity-page-main">
        <div className="home-subbar">
          <div className="home-feed-toggle-group" role="group" aria-label="Activity scope">
            <button
              type="button"
              className={`feed-switch-btn ${feedScope === 'local' ? 'active' : ''}`}
              onClick={() => setFeedScope('local')}
            >
              Friends' Activity
            </button>
            <button
              type="button"
              className={`feed-switch-btn ${feedScope === 'global' ? 'active' : ''}`}
              onClick={() => setFeedScope('global')}
            >
              Global Activity
            </button>
          </div>
          
          <div className="activity-type-filters">
            <button
              type="button"
              className={`activity-filter-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`activity-filter-pill ${filterType === 'posts' ? 'active' : ''}`}
              onClick={() => setFilterType('posts')}
            >
              Book Snaps
            </button>
            <button
              type="button"
              className={`activity-filter-pill ${filterType === 'albums' ? 'active' : ''}`}
              onClick={() => setFilterType('albums')}
            >
              Collections
            </button>
          </div>
        </div>

        {error && !loading && (
          <p className="form-error-msg" style={{ maxWidth: '500px', margin: '20px auto' }}>
            {error}
          </p>
        )}
        
        <section className="activity-cards-grid">
          {loading && (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}

          {!loading && !error && displayedActivities.length === 0 && (
            <div className="feed-empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="feed-empty-icon">📖</div>
              <p className="feed-empty-title">No recent activity</p>
              <p className="feed-empty-sub">
                {feedScope === 'local'
                  ? 'Your friends have not shared any updates yet.'
                  : 'Be the first to share a new book snap or create a reading collection!'}
              </p>
            </div>
          )}

          {!loading && !error && displayedActivities.map((act) => (
            <div key={act.id} className="post-card-animated-wrapper">
              <ActivityCard activity={act} />
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
