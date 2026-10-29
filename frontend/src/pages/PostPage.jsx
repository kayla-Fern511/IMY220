import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import EditPost from '../components/EditPost';
import Comments from '../components/Comments';
import { FiHeart, FiClock, FiMoreHorizontal, FiEdit2, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import ReportModal from '../components/ReportModal';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem('user')) || {
    id: '1',
    username: 'reader'
  };

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const startTime = Date.now();

    fetch(`http://localhost:5000/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then((data) => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsedTime);

        setTimeout(() => {
          setPost(data);
          setIsLiked(Boolean(data.isLiked));
          setLikesCount(data.likes || 0);
          setLoading(false);
        }, remainingTime);
      })
      .catch(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsedTime);

        setTimeout(() => {
          setPost(null);
          setLoading(false);
        }, remainingTime);
      });
  }, [id]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isOwner =
    post && loggedInUser?.username && post.username &&
    loggedInUser.username.toLowerCase() === post.username.toLowerCase();

  const handleToggleLike = async () => {
    const nextLikedState = !isLiked;
    setIsLiked(nextLikedState);
    setLikesCount((prev) => (nextLikedState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUser.username })
      });

      if (!res.ok) {
        setIsLiked(!nextLikedState);
        setLikesCount((prev) => (nextLikedState ? Math.max(0, prev - 1) : prev + 1));
      }

      const data = await res.json();
      if (typeof data.liked === 'boolean') {
        setIsLiked(data.liked);
      }
      if (typeof data.likesCount === 'number') {
        setLikesCount(data.likesCount);
      }
    } catch {
      setIsLiked(!nextLikedState);
      setLikesCount((prev) => (nextLikedState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleReportPost = () => {
    setShowOptionsMenu(false);
    setShowReportModal(true);
  };

  const handleSavePost = async (updatedData) => {
    try {
      await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch {
      // Local fallback
    }

    setPost((prev) => ({
      ...prev,
      caption: updatedData.caption,
      hashtags: updatedData.hashtags
    }));
    setIsEditingPost(false);
  };

  const handleDeletePost = async () => {
    setShowOptionsMenu(false);

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this book snap? This will remove all associated comments.'
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        navigate('/home');
      } else {
        alert('Failed to delete the post. Please try again.');
      }
    } catch {
      navigate('/home');
    }
  };

  const handleAddComment = async (text) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          user: loggedInUser.username
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to post comment.');
        return;
      }

      const data = await res.json();
      const newComment = data.comment || {
        id: Date.now().toString(),
        text,
        user: loggedInUser.username,
        createdAt: new Date().toISOString()
      };

      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Could not submit comment. Please check your backend connection.');
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      await fetch(`http://localhost:5000/api/posts/${id}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText })
      });
    } catch (err) {
      console.error('Error editing comment:', err);
    }

    setPost((prev) => ({
      ...prev,
      comments: (prev.comments || []).map((c) =>
        c.id === commentId ? { ...c, text: newText } : c
      )
    }));
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await fetch(`http://localhost:5000/api/posts/${id}/comments/${commentId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
    }

    setPost((prev) => ({
      ...prev,
      comments: (prev.comments || []).filter((c) => c.id !== commentId)
    }));
  };

  if (loading) {
    return (
      <div className="app-container postpage-desktop-screen">
        <Navigation />
        <main className="postpage-desktop-split-layout">
          <div className="postpage-main-image-skeleton skeleton-shimmer" />
          <div className="postpage-details-skeleton">
            <div className="postpage-skeleton-line postpage-skeleton-title skeleton-shimmer" />
            <div className="postpage-skeleton-line postpage-skeleton-subtitle skeleton-shimmer" />
            <div className="postpage-skeleton-line postpage-skeleton-body skeleton-shimmer" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="app-container postpage-desktop-screen">
        <Navigation />
        <main className="postpage-desktop-split-layout postpage-empty-layout">
          <div className="search-empty-state">
            <p className="empty-title">Post not found</p>
            <button
              type="button"
              className="wireframe-btn postpage-return-btn"
              onClick={() => navigate('/home')}
            >
              Return Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = post.username ? post.username.charAt(0).toUpperCase() : '?';

  return (
    <div className="app-container postpage-desktop-screen">
      <Navigation />

      <main className="postpage-desktop-split-layout">
        <div className="postpage-desktop-left-col">
          <div className="postpage-main-image-container">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.caption || 'Post image'}
                className="postpage-main-image"
              />
            ) : (
              <div className="postpage-main-image-placeholder">📚</div>
            )}
          </div>
        </div>

        <div className="postpage-desktop-right-col">
          <div className="postpage-sub-header">
            <div className="postpage-user-left">
              <Link to={`/profile/${post.username}`} className="postpage-user-badge">
                <div className="postpage-avatar-circle">{initials}</div>
                <span className="postpage-user-name">@{post.username}</span>
              </Link>
            </div>

            <div className="postpage-meta-right" ref={menuRef}>
              <button
                type="button"
                className="postpage-menu-trigger-btn"
                onClick={() => setShowOptionsMenu((prev) => !prev)}
                aria-label="Options"
              >
                <FiMoreHorizontal />
              </button>

              {showOptionsMenu && (
                <div className="postpage-dropdown-menu">
                  {isOwner ? (
                    <>
                      <button
                        type="button"
                        className="dropdown-menu-item"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setIsEditingPost(true);
                        }}
                      >
                        <FiEdit2 className="dropdown-item-icon" />
                        <span>Edit Post</span>
                      </button>
                      <button
                        type="button"
                        className="dropdown-menu-item item-danger"
                        onClick={handleDeletePost}
                      >
                        <FiTrash2 className="dropdown-item-icon" />
                        <span>Delete Post</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="dropdown-menu-item item-danger"
                      onClick={handleReportPost}
                    >
                      <FiAlertCircle className="dropdown-item-icon" />
                      <span>Report Post</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="postpage-metrics-row">
            <button
              type="button"
              className={`metric-item-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleToggleLike}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <FiHeart className="metric-icon heart-icon" />
              <span className="metric-number">{likesCount}</span>
            </button>

            <div className="metric-item" title="Time posted">
              <FiClock className="metric-icon" />
              <span className="metric-number">{post.timeAgo || 'Just now'}</span>
            </div>
          </div>

          {isEditingPost ? (
            <EditPost
              post={post}
              onSave={handleSavePost}
              onCancel={() => setIsEditingPost(false)}
            />
          ) : (
            <>
              {post.hashtags && (
                <div className="postpage-hashtags-container">
                  {(Array.isArray(post.hashtags)
                    ? post.hashtags
                    : String(post.hashtags).trim().split(/\s+/)
                  ).map((tag, idx) => {
                    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
                    return (
                      <button
                        key={`${cleanTag}-${idx}`}
                        type="button"
                        className="hashtag-btn"
                        onClick={() =>
                          navigate(`/search?q=${encodeURIComponent(cleanTag.replace(/^#/, ''))}`)
                        }
                      >
                        {cleanTag}
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="postpage-caption-body">
                {post.caption || 'No description provided.'}
              </p>

              <hr className="post-card-divider" />

              <Comments
                comments={post.comments || []}
                currentUsername={loggedInUser.username}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
              />
            </>
          )}
        </div>
      </main>

      {showReportModal && (
        <ReportModal
          postId={id}
          currentUsername={loggedInUser.username}
          onClose={() => setShowReportModal(false)}
          onSubmitSuccess={() => {
            setShowReportModal(false);
            alert(`Report submitted for post #${id}. Our team will review it.`);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
