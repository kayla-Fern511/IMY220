import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PostPreview from '../components/PostPreview';
import PostSkeleton from '../components/PostSkeleton';
import { FiSearch } from 'react-icons/fi';

const SKELETON_HEIGHTS = ['220px', '300px', '180px', '260px', '200px', '280px'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchInput(queryParam);
    if (queryParam.trim()) {
      fetchSearchResults(queryParam.trim());
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [queryParam]);

  const fetchSearchResults = async (term) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    const startTime = Date.now();

    const cleanTerm = term.replace(/^[#@]/, '').trim();

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts?q=${encodeURIComponent(cleanTerm)}`
      );

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 800 - elapsed);

      setTimeout(() => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      }, remaining);
    } catch {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 800 - elapsed);
      setTimeout(() => {
        setError('Could not reach the search server. Make sure the backend is running.');
        setResults([]);
        setLoading(false);
      }, remaining);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: trimmed.replace(/^[#@]/, '') });
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchParams({});
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="app-container search-desktop-screen">
      <Navigation isLoggedIn={true} search={true} />

      <main className="search-main-container">
        <section className="search-bar-section">
          <h1 className="search-page-title">Search & Explore</h1>

          {/* Bug fix: placeholder now says books/reading, not birds */}
          <form
            id="search-form"
            onSubmit={handleSearchSubmit}
            className="search-input-wrapper"
            role="search"
          >
            <FiSearch className="search-input-icon" aria-hidden="true" />
            <input
              id="search-input"
              type="text"
              className="search-field-input"
              placeholder="Search books, #readingwrap, @username…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoFocus
              aria-label="Search posts"
            />
            {searchInput && (
              <button
                id="search-clear-btn"
                type="button"
                className="search-clear-btn"
                onClick={handleClear}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button
              id="search-submit-btn"
              type="submit"
              className="wireframe-btn search-submit-btn"
            >
              Search
            </button>
          </form>

          {queryParam && !loading && (
            <p className="search-status-bar">
              Results for: <strong>"{queryParam}"</strong> ({results.length} found)
            </p>
          )}
        </section>

        {/* Results masonry grid */}
        <div className="masonry-grid" aria-label="Search results" aria-busy={loading}>
          {loading && SKELETON_HEIGHTS.map((h, i) => (
            <div key={i} className="masonry-item" aria-hidden="true">
              <PostSkeleton height={h} />
            </div>
          ))}

          {error && !loading && (
            <p className="form-error-msg" style={{ columnSpan: 'all', margin: '20px auto', maxWidth: '500px' }}>
              {error}
            </p>
          )}

          {!loading && !error && hasSearched && results.length === 0 && (
            <div className="search-empty-state">
              <p className="empty-title">No results found</p>
              <p className="empty-subtitle">Try a different book title, hashtag, or reader handle.</p>
            </div>
          )}

          {!loading && !error && !hasSearched && (
            <div className="search-empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📖</div>
              <p className="empty-title">Start discovering</p>
              <p className="empty-subtitle">Search for a book title, #hashtag, or @reader to explore BookSnaps.</p>
            </div>
          )}

          {!loading && !error && results.map((post, idx) => (
            <div
              key={post.id || post._id}
              className="masonry-item post-card-animated-wrapper"
              style={{ animationDelay: `${Math.min(idx * 0.07, 0.7)}s` }}
            >
              <PostPreview post={post} />
            </div>
          ))}
        </div>
      </main>

      <Footer isLoggedIn={true} />
    </div>
  );
}