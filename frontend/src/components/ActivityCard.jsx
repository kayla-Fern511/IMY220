
import { Link, useNavigate } from 'react-router-dom';
import { FiClock, FiFolder, FiImage } from 'react-icons/fi';

export default function ActivityCard({ activity }) {
  const navigate = useNavigate();

  const isCollection =
    activity.actionType === 'created_album' ||
    activity.actionType === 'added_to_album';

  const profileUrl = `/profile/${activity.username}`;
  const postUrl = `/post/${activity.targetId || activity.postId}`;

  const renderAction = () => {
    switch (activity.actionType) {
      case 'created_album':
        return (
          <>
            created a collection{' '}
            <strong>{activity.albumName}</strong>
          </>
        );

      case 'added_to_album':
        return (
          <>
            added {activity.photoCount || 1}{' '}
            {activity.photoCount === 1 ? 'photo' : 'photos'} to{' '}
            <strong>{activity.albumName}</strong>
          </>
        );

      default:
        return <>shared a new book snap</>;
    }
  };

  const renderMediaContent = () => {
    if (isCollection) {
      const images = activity.images || [];

      if (!images.length) {
        return (
          <div className="activity-image-placeholder">
            <FiFolder />
            <span>Reading Collection</span>
          </div>
        );
      }

      return (
        <div className="activity-collection-images">
          {images.slice(0, 2).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${activity.albumName || 'Collection'} preview ${index + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      );
    }

    return activity.imageUrl ? (
      <img
        src={activity.imageUrl}
        alt={activity.caption || 'Book snap'}
        className="activity-card-image"
        loading="lazy"
      />
    ) : (
      <div className="activity-image-placeholder">
        <FiImage />
        <span>Book Snap</span>
      </div>
    );
  };

  const renderHashtags = () => {
    if (!activity.hashtags) return null;

    const tags = Array.isArray(activity.hashtags)
      ? activity.hashtags
      : String(activity.hashtags).trim().split(/\s+/);

    return (
      <div className="activity-card-tags">
        {tags.filter(Boolean).map((tag, index) => {
          const cleanTag = tag.replace(/^#/, '');

          return (
            <button
              key={`${cleanTag}-${index}`}
              type="button"
              className="hashtag-btn"
              onClick={() =>
                navigate(
                  `/search?q=${encodeURIComponent(cleanTag)}`
                )
              }
            >
              #{cleanTag}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <article className="activity-card-item">
      <Link
        to={isCollection ? profileUrl : postUrl}
        className="activity-card-media"
      >
        {renderMediaContent()}
      </Link>

      <div className="activity-card-body">
        {renderHashtags()}

        <p className="activity-card-action">
          <Link to={profileUrl} className="activity-user-link">
            @{activity.username}
          </Link>{' '}
          {renderAction()}
        </p>

        {activity.caption && (
          <p className="activity-card-caption">
            {activity.caption}
          </p>
        )}

        <div className="activity-card-footer">
          <Link to={profileUrl} className="activity-card-user">
            <span className="activity-user-avatar">
              {activity.username?.charAt(0).toUpperCase() || 'B'}
            </span>
            <span>@{activity.username}</span>
          </Link>

          <span className="activity-card-time">
            <FiClock />
            {activity.timeAgo || 'Just now'}
          </span>
        </div>
      </div>
    </article>
  );
}
