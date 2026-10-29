import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PostPreview from '../components/PostPreview';
import PostSkeleton from '../components/PostSkeleton';
import FriendList from '../components/FriendList';
import Requests from '../components/Requests';
import EditProfile from '../components/EditProfile';
import NewPost from '../components/NewPost';
import { FiPlusSquare, FiUserCheck, FiEdit } from 'react-icons/fi';

// Varying skeleton heights for masonry illusion
const SKELETON_HEIGHTS = ['200px', '280px', '160px', '240px', '300px', '180px'];

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const loggedInUser = JSON.parse(localStorage.getItem('user')) || {
        id: '1',
        username: 'testuser'
    };

    // Bug fix: Navigate was used but never imported — now imported from react-router-dom above
    if (!id) {
        return <Navigate to={`/profile/${loggedInUser.username}`} replace />;
    }

    const targetUsername = id.toLowerCase();
    const isOwnProfile = loggedInUser.username.toLowerCase() === targetUsername;

    const [profile, setProfile] = useState({
        id: targetUsername,
        username: targetUsername,
        name: '',
        pronouns: '',
        links: '',
        bio: '',
        avatarUrl: '',
        friends: []
    });

    // Bug fix: pendingRequests now fetched from the API, not hardcoded
    const [pendingRequests, setPendingRequests] = useState([]);

    const [showFriendsList, setShowFriendsList] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showNewPost, setShowNewPost] = useState(false);

    const [relationshipStatus, setRelationshipStatus] = useState('Not Friends');
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const canViewFriends = isOwnProfile || relationshipStatus === 'Friends';

    useEffect(() => {
        setShowFriendsList(false);
        setShowRequests(false);
        setShowEditProfile(false);
        setLoading(true);
        const startTime = Date.now();

        const fetchProfile = fetch(`http://localhost:5000/api/auth/profile/${encodeURIComponent(targetUsername)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) {
                    setProfile(data);
                    const isFriend = (data.friends || []).some(
                        (f) => f.username?.toLowerCase() === loggedInUser.username.toLowerCase()
                    );
                    setRelationshipStatus(isFriend ? 'Friends' : 'Not Friends');
                } else {
                    setProfile((prev) => ({
                        ...prev,
                        id: targetUsername,
                        username: targetUsername,
                        name: targetUsername.replace('_', ' '),
                        bio: '',
                        avatarUrl: '',
                        friends: []
                    }));
                    setRelationshipStatus('Not Friends');
                }
            })
            .catch(() => {});

        // Bug fix: fetch user's posts via username query
        const fetchPosts = fetch(`http://localhost:5000/api/posts?q=${encodeURIComponent(targetUsername)}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((posts) => {
                setUserPosts(Array.isArray(posts) ? posts : []);
            })
            .catch(() => setUserPosts([]));

        // Bug fix: fetch pending friend requests from API (only for own profile)
        const fetchRequests = isOwnProfile
            ? fetch(`http://localhost:5000/api/friends/requests?username=${encodeURIComponent(loggedInUser.username)}`)
                .then((res) => (res.ok ? res.json() : []))
                .then((data) => { setPendingRequests(Array.isArray(data) ? data : []); })
                .catch(() => setPendingRequests([]))
            : Promise.resolve();

        Promise.allSettled([fetchProfile, fetchPosts, fetchRequests]).then(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 800 - elapsed);
            setTimeout(() => setLoading(false), remaining);
        });
    }, [targetUsername]);

    // Bug fix: handleStatusClick now calls the friends API
    const handleStatusClick = async () => {
        if (isOwnProfile) return;

        if (relationshipStatus === 'Friends') {
            const confirmRemove = window.confirm(
                `Remove @${profile.username} as a friend?`
            );
            if (!confirmRemove) return;
            try {
                await fetch(`http://localhost:5000/api/friends`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requesterUsername: loggedInUser.username,
                        recipientUsername: profile.username
                    })
                });
            } catch { /* optimistic */ }
            setRelationshipStatus('Not Friends');

        } else if (relationshipStatus === 'Friend Request Pending') {
            const cancel = window.confirm(
                `Cancel friend request to @${profile.username}?`
            );
            if (!cancel) return;
            try {
                await fetch(`http://localhost:5000/api/friends/cancel`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requesterUsername: loggedInUser.username,
                        recipientUsername: profile.username
                    })
                });
            } catch { /* optimistic */ }
            setRelationshipStatus('Not Friends');

        } else if (relationshipStatus === 'Not Friends') {
            try {
                await fetch(`http://localhost:5000/api/friends/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requesterUsername: loggedInUser.username,
                        recipientUsername: profile.username
                    })
                });
            } catch { /* optimistic */ }
            setRelationshipStatus('Friend Request Pending');
        }
    };

    // Bug fix: handleSaveProfile now calls PUT /api/auth/profile/:username
    const handleSaveProfile = async (updatedData) => {
        try {
            await fetch(`http://localhost:5000/api/auth/profile/${encodeURIComponent(loggedInUser.username)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
        } catch { /* optimistic */ }
        setProfile((prev) => ({ ...prev, ...updatedData }));
        setShowEditProfile(false);
    };

    const handleAcceptRequest = async (requestId) => {
        const accepted = pendingRequests.find((r) => r.id === requestId);
        try {
            await fetch(`http://localhost:5000/api/friends/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
        } catch { /* optimistic */ }
        if (accepted) {
            setProfile((prev) => ({
                ...prev,
                friends: [...prev.friends, accepted]
            }));
            setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            await fetch(`http://localhost:5000/api/friends/decline`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
        } catch { /* optimistic */ }
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    };

    // Bug fix: handlePublishPost now calls POST /api/posts
    const handlePublishPost = async (newPostData) => {
        const payload = {
            username: loggedInUser.username,
            caption: newPostData.caption,
            hashtags: newPostData.hashtags,
            imageUrl: newPostData.imageUrl
        };

        let createdId = String(Date.now());
        try {
            const res = await fetch(`http://localhost:5000/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                createdId = data.id || createdId;
            }
        } catch { /* optimistic */ }

        const optimisticPost = {
            id: createdId,
            username: loggedInUser.username,
            caption: newPostData.caption,
            hashtags: newPostData.hashtags,
            imageUrl: newPostData.imageUrl,
            likes: 0,
            timeAgo: 'Just now',
            comments: []
        };

        setUserPosts((prev) => [optimisticPost, ...prev]);
        setShowNewPost(false);
    };

    // Relationship status label & class
    const statusClass = {
        'Friends': 'status-friends',
        'Friend Request Pending': 'status-friend-request-pending',
        'Not Friends': 'status-not-friends'
    }[relationshipStatus] || 'status-not-friends';

    const statusLabel = {
        'Friends': '✓ Friends',
        'Friend Request Pending': '⏳ Pending',
        'Not Friends': '+ Follow'
    }[relationshipStatus] || '+ Follow';

    // Avatar initial
    const avatarInitial = (profile.name || profile.username || '?').charAt(0).toUpperCase();

    return (
        <div className="app-container profile-desktop-screen">
            <Navigation isLoggedIn={true} profile={true} isProfile={isOwnProfile} />

            {showFriendsList ? (
                <main className="profile-fullscreen-friendlist-container">
                    <FriendList
                        friends={profile.friends}
                        onBack={() => setShowFriendsList(false)}
                    />
                </main>
            ) : showRequests ? (
                <main className="profile-fullscreen-friendlist-container">
                    <Requests
                        requests={pendingRequests}
                        onAccept={handleAcceptRequest}
                        onDecline={handleDeclineRequest}
                        onBack={() => setShowRequests(false)}
                    />
                </main>
            ) : showEditProfile ? (
                <main className="profile-fullscreen-friendlist-container">
                    <EditProfile
                        profile={profile}
                        onSave={handleSaveProfile}
                        onCancel={() => setShowEditProfile(false)}
                    />
                </main>
            ) : showNewPost ? (
                <main className="profile-fullscreen-friendlist-container">
                    <NewPost
                        onPublish={handlePublishPost}
                        onCancel={() => setShowNewPost(false)}
                    />
                </main>
            ) : (
                <main className="profile-page-content">
                    {/* Hero banner */}
                    <div className="profile-hero-banner" style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                        <div className="profile-hero-gradient-overlay" aria-hidden="true" />
                        <div className="profile-avatar-container">
                            <div className="profile-avatar-ring" aria-label={`Avatar of ${profile.username}`}>
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.username} />
                                ) : (
                                    avatarInitial
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile info */}
                    <section className="profile-info-section">
                        <div className="profile-info-left">
                            <h1 className="profile-display-name">
                                {profile.name || profile.username}
                            </h1>
                            <p className="profile-username-handle">@{profile.username}</p>

                            {profile.bio && (
                                <p className="profile-bio-text">{profile.bio}</p>
                            )}

                            <div className="profile-meta-pills">
                                {profile.pronouns && (
                                    <span className="profile-meta-pill">
                                        {profile.pronouns}
                                    </span>
                                )}
                                {profile.links && (
                                    <span className="profile-meta-pill">
                                        🔗&nbsp;
                                        <a
                                            href={profile.links.startsWith('http') ? profile.links : `https://${profile.links}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {profile.links}
                                        </a>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="profile-info-right">
                            {/* Stats */}
                            <div className="profile-stats-row">
                                <div className="profile-stat-btn" title="Posts">
                                    <span className="profile-stat-count">{userPosts.length}</span>
                                    <span className="profile-stat-label">Posts</span>
                                </div>
                                <button
                                    type="button"
                                    className="profile-stat-btn"
                                    onClick={() => canViewFriends && setShowFriendsList(true)}
                                    disabled={!canViewFriends}
                                    title={canViewFriends ? 'View friends' : 'Friends list is private'}
                                >
                                    <span className="profile-stat-count">
                                        {profile.friends?.length ?? 0}
                                    </span>
                                    <span className="profile-stat-label">Friends</span>
                                </button>
                            </div>

                            {/* Action buttons */}
                            <div className="profile-action-buttons">
                                {isOwnProfile ? (
                                    <>
                                        <button
                                            id="btn-new-post"
                                            type="button"
                                            className="wireframe-btn"
                                            onClick={() => setShowNewPost(true)}
                                            title="Create new post"
                                        >
                                            <FiPlusSquare /> Make Post
                                        </button>
                                        <button
                                            id="btn-requests"
                                            type="button"
                                            className="wireframe-btn"
                                            style={{ background: 'var(--bg)', color: 'var(--text)', border: '1.5px solid var(--border)' }}
                                            onClick={() => setShowRequests(true)}
                                        >
                                            <FiUserCheck />
                                            Requests
                                            {pendingRequests.length > 0 && (
                                                <span style={{
                                                    background: 'var(--accent)',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700
                                                }}>
                                                    {pendingRequests.length}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            id="btn-edit-profile"
                                            type="button"
                                            className="wireframe-btn"
                                            style={{ background: 'var(--bg)', color: 'var(--text)', border: '1.5px solid var(--border)' }}
                                            onClick={() => setShowEditProfile(true)}
                                        >
                                            <FiEdit /> Edit Profile
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        id="btn-relationship-status"
                                        type="button"
                                        className={`profile-status-btn ${statusClass}`}
                                        onClick={handleStatusClick}
                                    >
                                        {statusLabel}
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <hr className="profile-divider" />

                    {/* Posts masonry grid */}
                    <section
                        className="profile-three-col-grid"
                        aria-label={`Posts by ${profile.username}`}
                        aria-busy={loading}
                    >
                        {loading && SKELETON_HEIGHTS.map((h, i) => (
                            <div key={i} className="masonry-item" aria-hidden="true">
                                <PostSkeleton height={h} />
                            </div>
                        ))}

                        {!loading && userPosts.length === 0 && (
                            <p className="profile-no-posts-text">
                                {isOwnProfile
                                    ? 'You haven\'t shared any book snaps yet. Make your first post!'
                                    : 'No posts yet.'}
                            </p>
                        )}

                        {!loading && userPosts.map((post, idx) => (
                            <div
                                key={post.id || post._id}
                                className="masonry-item post-card-animated-wrapper"
                                style={{ animationDelay: `${Math.min(idx * 0.08, 0.7)}s` }}
                            >
                                <PostPreview post={post} />
                            </div>
                        ))}
                    </section>
                </main>
            )}

            <Footer isLoggedIn={true} />
        </div>
    );
}