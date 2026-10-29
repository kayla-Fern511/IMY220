import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';

export default function PostPreview({ post }) {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user')) || { username: 'testuser' };

    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likesCount, setLikesCount] = useState(post.likes ?? 0);

    const handleLikeClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

        try {
            await fetch(`http://localhost:5000/api/posts/${post.id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loggedInUser.username })
            });
        } catch {
            // Optimistic update stays; silently fail
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
                        navigate(`/search?q=${encodeURIComponent(cleanTag.replace('#', ''))}`);
                    }}
                >
                    {cleanTag}
                </button>
            );
        });
    };

    // Get initials for avatar fallback
    const initials = post.username ? post.username.charAt(0).toUpperCase() : '?';

    return (
        <article className="pin-card">
            {/* Image with hover overlay */}
            <Link to={`/post/${post.id}`} className="pin-card-image-wrapper" aria-label={`View post by @${post.username}`}>
                {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.caption || 'Book photo'} loading="lazy" />
                ) : (
                    <div className="pin-card-placeholder">📚</div>
                )}

                {/* Hover overlay */}
                <div className="pin-card-overlay" aria-hidden="true">
                    <div className="pin-card-overlay-actions">
                        <button
                            type="button"
                            className={`pin-overlay-btn save like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLikeClick}
                            title={isLiked ? 'Unlike' : 'Like'}
                        >
                            <FiHeart className="heart-icon" style={{ fontSize: '0.95rem' }} />
                            {likesCount}
                        </button>
                        <Link
                            to={`/post/${post.id}`}
                            className="pin-overlay-btn"
                            onClick={(e) => e.stopPropagation()}
                            title="View comments"
                        >
                            <FiMessageCircle style={{ fontSize: '0.95rem' }} />
                            {post.comments?.length || 0}
                        </Link>
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
                    <p className="pin-card-caption" title={post.caption}>
                        {post.caption}
                    </p>
                )}

                <div className="pin-card-footer">
                    <Link
                        to={`/profile/${post.username}`}
                        className="pin-card-user"
                        aria-label={`View profile of @${post.username}`}
                    >
                        <div className="pin-user-avatar">
                            {initials}
                        </div>
                        <span className="pin-user-name">@{post.username}</span>
                    </Link>

                    <button
                        type="button"
                        className={`pin-card-likes ${isLiked ? 'liked' : ''}`}
                        onClick={handleLikeClick}
                        title={isLiked ? 'Unlike' : 'Like'}
                        aria-label={`${isLiked ? 'Unlike' : 'Like'} post — ${likesCount} likes`}
                    >
                        <FiHeart className="heart-icon" />
                        {likesCount}
                    </button>
                </div>
            </div>
        </article>
    );
}