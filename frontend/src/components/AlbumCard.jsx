import { FiFolder, FiImage } from 'react-icons/fi';

export default function AlbumCard({ album, onSelectAlbum }) {
    const coverImage = album.coverImage || (album.posts && album.posts.length > 0 ? album.posts[0].imageUrl : null);
    const postCount = album.photoCount !== undefined ? album.photoCount : (album.posts ? album.posts.length : 0);

    return (
        <article className="pin-board-card" onClick={() => onSelectAlbum(album)} role="button" tabIndex={0}>
            <div className="pin-board-cover">
                {coverImage ? (
                    <img src={coverImage} alt={album.name} className="pin-board-cover-img" />
                ) : (
                    <div className="pin-board-empty-placeholder">
                        <FiFolder className="pin-board-placeholder-icon" />
                    </div>
                )}
                <div className="pin-board-badge">
                    <FiImage style={{ marginRight: '4px' }} /> {postCount} {postCount === 1 ? 'snap' : 'snaps'}
                </div>
            </div>

            <div className="pin-board-details">
                <h3 className="pin-board-title">{album.name}</h3>
                {album.description && (
                    <p className="pin-board-description">{album.description}</p>
                )}
                {album.hashtags && (
                    <div className="pin-card-tags" style={{ marginTop: '6px' }}>
                        <span className="hashtag-btn">{album.hashtags}</span>
                    </div>
                )}
            </div>
        </article>
    );
}
