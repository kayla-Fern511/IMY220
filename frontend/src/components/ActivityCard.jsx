import { Link, useNavigate } from 'react-router-dom';
import { FiClock, FiFolder, FiImage } from 'react-icons/fi';

export default function ActivityCard({ activity }) {
  const navigate = useNavigate();

  const renderActionSubtitle = () => {
    switch (activity.actionType) {
      case 'created_album':
        return (
          <span className="activity-action-text">
            created collection <strong>{activity.albumName}</strong>
          </span>
        );
      case 'added_to_album':
        return (
          <span className="activity-action-text">
            added {activity.photoCount || 1} {activity.photoCount === 1 ? 'photo' : 'photos'} to{' '}
            <strong>{activity.albumName}</strong>
          </span>
        );
      case 'created_post':
      default:
        return <span className="activity-action-text">shared a new book snap</span>;
    }
  };

  const renderMedia = () => {
    if (activity.actionType === 'created_album' || activity.actionType === 'added_to_album') {
      const images = activity.images || [];
      return (
        <div
          className="post-image-container activity-album-media-box"
          onClick={() => navigate(`/profile/${activity.username}`)}
        >
          {images.length > 0 ? (
            <div className="activity-multi-photo-grid">
              {images.slice(0, 2).map((img, idx) => (
                <div key={idx} className="activity-photo-cell">
                  <img src={img} alt="Album photo" className="post-photo-img" />
                </div>
              ))}
            </div>
          ) : (
            <div className="post-image-placeholder album-empty-placeholder">
              <FiFolder className="album-placeholder-icon" />
            </div>
          )}
        </div>
      );
    }

    return (
      <Link to={`/post/${activity.targetId || activity.postId}`} className="post-image-container">
        {activity.imageUrl ? (
          <img
            src={activity.imageUrl}
            alt={activity.caption || 'Activity photo'}
            className="post-photo-img"
          />
        ) : (
          <div className="post-image-placeholder">📚</div>
        )}
      </Link>
    );
  };

  const renderHashtags = () => {
    const rawTags = activity.hashtags;
    if (!rawTags) return null;
    const tagList = Array.isArray(rawTags) ? rawTags : String(rawTags).trim().split(/\s+/);

    return tagList.map((tag, index) => {
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

  return (
    <article className="activity-card-item">
      {renderMedia()}

      <div className="post-meta-details">
        <div className="post-tags-user-row">
          <div className="post-hashtags-container">
            {renderHashtags()}
          </div>
          <Link
            to={`/profile/${activity.username}`}
            className="post-username-link"
          >
            @{activity.username}
          </Link>
        </div>

        <div className="activity-caption-block">
          {renderActionSubtitle()}
          {activity.caption && (
            <p className="post-description-text">
              {activity.caption}
            </p>
          )}
        </div>

        <hr className="post-card-divider" />

        <div className="post-stats-footer-row">
          <span className="activity-type-indicator">
            {activity.actionType === 'created_post' ? (
              <>
                <FiImage className="metric-icon" /> Book Snap
              </>
            ) : (
              <>
                <FiFolder className="metric-icon" /> Collection
              </>
            )}
          </span>

          <div className="post-metrics-group">
            <div className="metric-item" title="Time of activity">
              <FiClock className="metric-icon" />
              <span className="metric-number">{activity.timeAgo || 'Just now'}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
