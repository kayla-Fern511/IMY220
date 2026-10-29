import PostPreview from './PostPreview';

export default function PostList({ userPosts = [] }) {
    if (!userPosts || userPosts.length === 0) {
        return null;
    }

    return (
        <div className="masonry-grid" aria-label="Posts grid">
            {userPosts.map((post, idx) => (
                <div
                    key={post.id || post._id || idx}
                    className="masonry-item post-card-animated-wrapper"
                    style={{ animationDelay: `${Math.min(idx * 0.06, 0.6)}s` }}
                >
                    <PostPreview post={post} />
                </div>
            ))}
        </div>
    );
}
