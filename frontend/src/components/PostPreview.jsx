import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';

export default function PostPreview({ post }) {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));
    const [likesCount, setLikesCount] = useState(post.likes ?? 0);

    useEffect(() => {
        setIsLiked(Boolean(post.isLiked));
        setLikesCount(post.likes ?? 0);
    }, [post.id, post.likes, post.isLiked]);

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
            // Revert optimistic update
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

    const authorUsername = post.username || 'reader';
    const initials = authorUsername.charAt(0).toUpperCase();
    const postId = post.id || post._id;

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
                            <FiHeart className="heart-icon" style={{ fontSize: '0.95rem' }} />
                            {likesCount}
                        </button>
                        <span
                            className="pin-overlay-btn"
                            title="Comments"
                        >
                            <FiMessageCircle style={{ fontSize: '0.95rem' }} />
                            {post.comments?.length || 0}
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
                    <p className="pin-card-caption" title={post.caption}>
                        {post.caption}
                    </p>
                )}

                <div className="pin-card-footer">
                    <Link
                        to={`/profile/${authorUsername}`}
                        className="pin-card-user"
                        aria-label={`View profile of @${authorUsername}`}
                    >
                        <div className="pin-user-avatar">
                            {initials}
                        </div>
                        <span className="pin-user-name">@{authorUsername}</span>
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
