import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiAlertTriangle } from 'react-icons/fi';

export default function PostPreview({ post }) {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    if (!post) return null;

    const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));
    const [likesCount, setLikesCount] = useState(post.likes ?? 0);
    const [revealReported, setRevealReported] = useState(false);

    useEffect(() => {
        setIsLiked(Boolean(post.isLiked));
        setLikesCount(post.likes ?? 0);
    }, [post.id, post._id, post.likes, post.isLiked]);

    const handleLikeClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!loggedInUser) {
            navigate('/login');
            return;
        }

        const nextLikedState = !isLiked;
        setIsLiked(nextLikedState);
        setLikesCount((prev) => (nextLikedState ? prev + 1 : Math.max(0, prev - 1)));

        try {
            const res = await fetch(`http://localhost:5000/api/posts/${post.id || post._id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loggedInUser.username })
            });

            if (!res.ok) {
                throw new Error('Failed to update like status');
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

    const renderHashtags = () => {
        if (!post.hashtags) return null;
        const rawTags = post.hashtags;
        const tagList = Array.isArray(rawTags) ? rawTags : String(rawTags).trim().split(/\s+/);

        return tagList.slice(0, 3).map((tag, index) => {
            const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
            return (
                <button
                    key={`${cleanTag}-${index}`}
                    type="button"
                    className="hashtag-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/search?q=${encodeURIComponent(cleanTag.replace(/^#/, ''))}`);
                    }}
                >
                    {cleanTag}
                </button>
            );
        });
    };

    const rawUser = post.username || post.author?.username || 'reader';
    const authorUsername = typeof rawUser === 'string'
        ? rawUser
        : (Array.isArray(rawUser) && rawUser[0] ? String(rawUser[0]) : 'reader');
    const initials = (authorUsername && typeof authorUsername === 'string' ? authorUsername.charAt(0) : 'R').toUpperCase();
    const postId = post.id || post._id;

    if (post.isReported && !revealReported) {
        return (
            <article className="pin-card reported-pin-card">
                <div className="reported-pin-content">
                    <FiAlertTriangle className="reported-pin-icon" />
                    <h3 className="reported-pin-title">This post was reported</h3>
                    <p className="reported-pin-desc">Flagged by community members for review.</p>
                    <button
                        type="button"
                        className="wireframe-btn reported-reveal-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setRevealReported(true);
                        }}
                    >
                        View Post Anyway
                    </button>
                </div>
            </article>
        );
    }

    return (
        <article className="pin-card">
            {/* Image with hover overlay */}
            <Link
                to={`/post/${postId}`}
                className="pin-card-image-wrapper"
                aria-label={`View post by @${authorUsername}`}
            >
                {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.caption || 'Book photo'} loading="lazy" />
                ) : (
                    <div className="pin-card-placeholder">📚</div>
                )}

                {/* Hover overlay with Pinterest-style save/like and comments */}
                <div className="pin-card-overlay" aria-hidden="true">
                    <div className="pin-card-overlay-actions">
                        <button
                            type="button"
                            className={`pin-overlay-btn save like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLikeClick}
                            title={isLiked ? 'Unlike' : 'Like'}
                        >
                            <FiHeart className="heart-icon post-preview-meta-icon" />
                            <span>{likesCount}</span>
                        </button>
                        <span
                            className="pin-overlay-btn"
                            title="Comments"
                        >
                            <FiMessageCircle className="post-preview-meta-icon" />
                            <span>{post.comments?.length || 0}</span>
                        </span>
                    </div>
                </div>
            </Link>

            {/* Card bottom info */}
            <div className="pin-card-info">
                {post.hashtags && (
                    <div className="pin-card-tags">
                        {renderHashtags()}
                    </div>
                )}

                {post.caption && (
                    <p className="pin-card-caption">
                        {post.caption}
                    </p>
                )}

                <div className="pin-card-footer">
                    <Link
                        to={`/profile/${authorUsername}`}
                        className="pin-card-author"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="pin-user-avatar">{initials}</div>
                        <span className="pin-user-handle">@{authorUsername}</span>
                    </Link>

                    {post.timeAgo && (
                        <span className="pin-time-ago">{post.timeAgo}</span>
                    )}
                </div>
            </div>
        </article>
    );
}
