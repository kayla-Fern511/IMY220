import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PostSkeleton from '../components/PostSkeleton';
import { FiTrash2, FiUserX, FiAlertCircle, FiPlus, FiCheckCircle, FiList, FiUsers, FiFlag } from 'react-icons/fi';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('reasons');
    const [reasons, setReasons] = useState([]);
    const [newReason, setNewReason] = useState('');
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        fetchTabContent();
    }, [activeTab]);

    const showStatus = (msg) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(''), 3500);
    };

    const fetchTabContent = async () => {
        setLoading(true);
        setError('');
        const startTime = Date.now();

        let endpoint = 'http://localhost:5000/api/admin/report-reasons';
        if (activeTab === 'reports') endpoint = 'http://localhost:5000/api/admin/reports';
        if (activeTab === 'users') endpoint = 'http://localhost:5000/api/admin/users';

        try {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`Status: ${res.status}`);
            const data = await res.json();

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 600 - elapsed);

            setTimeout(() => {
                if (activeTab === 'reasons') setReasons(Array.isArray(data) ? data : []);
                else if (activeTab === 'reports') setReports(Array.isArray(data) ? data : []);
                else setUsers(Array.isArray(data) ? data : []);
                setLoading(false);
            }, remaining);
        } catch {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 600 - elapsed);

            setTimeout(() => {
                setError('Failed to retrieve data from server.');
                setLoading(false);
            }, remaining);
        }
    };

    const handleAddReason = async (e) => {
        e.preventDefault();
        if (!newReason.trim()) return;

        const reasonPayload = { reason: newReason.trim() };

        try {
            const res = await fetch('http://localhost:5000/api/admin/report-reasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reasonPayload)
            });
            const data = await res.json();
            if (res.ok) {
                setReasons((prev) => [...prev, data.reason]);
                setNewReason('');
                showStatus('New report reason successfully added.');
            } else {
                showStatus(data.message || 'Failed to add reason.');
            }
        } catch {
            showStatus('Failed to connect to server.');
        }
    };

    const handleDeleteReason = async (reasonId) => {
        if (!window.confirm('Delete this report reason?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/report-reasons/${reasonId}`, { method: 'DELETE' });
            if (res.ok) {
                setReasons((prev) => prev.filter((r) => r.id !== reasonId));
                showStatus('Report reason removed.');
            }
        } catch {
            showStatus('Failed to delete reason.');
        }
    };

    const handleDismissReport = async (reportId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/reports/${reportId}`, { method: 'DELETE' });
            if (res.ok) {
                setReports((prev) => prev.filter((r) => r.id !== reportId));
                showStatus(`Report #${reportId} dismissed.`);
            }
        } catch {
            showStatus('Failed to dismiss report.');
        }
    };

    const handleDeleteReportedPost = async (postId, reportId) => {
        if (!window.confirm(`Delete post #${postId}? All associated comments and likes will also be removed.`)) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) {
                setReports((prev) => prev.filter((r) => r.postId !== postId && r.id !== reportId));
                showStatus(`Post #${postId} deleted and report closed.`);
            } else {
                showStatus('Failed to delete post.');
            }
        } catch {
            showStatus('Network error while deleting post.');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Delete user @${username}? This action is irreversible.`)) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                showStatus(`User @${username} was deleted.`);
            } else {
                showStatus('Failed to delete user.');
            }
        } catch {
            showStatus('Network error while deleting user.');
        }
    };

    return (
        <div className="app-container admin-screen">
            <Navigation admin={true} />

            <main className="admin-page-main">
                <div className="admin-header-row">
                    <div>
                        <h1 className="admin-title">Admin Dashboard</h1>
                        <p className="admin-subtitle">Moderate BookSnaps community content, report reasons, and readers</p>
                    </div>

                    {statusMessage && (
                        <div className="admin-status-toast">
                            <FiCheckCircle style={{ color: 'var(--accent)', flexShrink: 0 }} />
                            <span>{statusMessage}</span>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="admin-tabs-nav">
                    <button
                        type="button"
                        className={`admin-tab-btn ${activeTab === 'reasons' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reasons')}
                    >
                        <FiList style={{ marginRight: '6px' }} />
                        Report Reasons ({reasons.length})
                    </button>
                    <button
                        type="button"
                        className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <FiFlag style={{ marginRight: '6px' }} />
                        Active Reports ({reports.length})
                    </button>
                    <button
                        type="button"
                        className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUsers style={{ marginRight: '6px' }} />
                        User Management ({users.length})
                    </button>
                </div>

                {error && !loading && (
                    <p className="form-error-msg" style={{ margin: '20px 0' }}>{error}</p>
                )}

                {/* TAB 1: REASONS */}
                {activeTab === 'reasons' && (
                    <div className="admin-card-section">
                        <h2 className="admin-section-heading">Manage Report Reasons</h2>
                        <p className="admin-section-desc">Add or remove options available when readers flag inappropriate posts.</p>

                        <form onSubmit={handleAddReason} className="admin-inline-form">
                            <input
                                type="text"
                                className="auth-input admin-input"
                                placeholder="Enter reason (e.g. Inappropriate content, Copyright)"
                                value={newReason}
                                onChange={(e) => setNewReason(e.target.value)}
                            />
                            <button type="submit" className="wireframe-btn">
                                <FiPlus style={{ marginRight: '4px' }} /> Add Reason
                            </button>
                        </form>

                        {loading ? (
                            <PostSkeleton />
                        ) : (
                            <div className="admin-reasons-list">
                                {reasons.length === 0 ? (
                                    <p className="profile-no-posts-text">No report reasons configured.</p>
                                ) : (
                                    reasons.map((r) => (
                                        <div key={r.id} className="admin-item-row">
                                            <span className="admin-item-text">{r.reason}</span>
                                            <button
                                                type="button"
                                                className="admin-delete-btn"
                                                onClick={() => handleDeleteReason(r.id)}
                                                title="Delete Reason"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: REPORTS */}
                {activeTab === 'reports' && (
                    <div className="admin-card-section">
                        <h2 className="admin-section-heading">Reported Posts</h2>
                        <p className="admin-section-desc">Review and take action on posts flagged by readers.</p>

                        {loading ? (
                            <PostSkeleton />
                        ) : reports.length === 0 ? (
                            <div className="feed-empty-state">
                                <div className="feed-empty-icon">✨</div>
                                <p className="feed-empty-title">All clear!</p>
                                <p className="feed-empty-sub">There are no active reports at this time.</p>
                            </div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Post</th>
                                            <th>Reason</th>
                                            <th>Reporter</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map((rep) => (
                                            <tr key={rep.id}>
                                                <td>
                                                    <a href={`/post/${rep.postId}`} target="_blank" rel="noreferrer" className="admin-link">
                                                        Post #{String(rep.postId).slice(-6)}
                                                    </a>
                                                </td>
                                                <td><span className="admin-reason-badge">{rep.reason}</span></td>
                                                <td>@{rep.reporter}</td>
                                                <td>{new Date(rep.reportedAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="admin-action-buttons">
                                                        <button
                                                            type="button"
                                                            className="admin-dismiss-btn"
                                                            onClick={() => handleDismissReport(rep.id)}
                                                        >
                                                            Dismiss
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="admin-danger-btn"
                                                            onClick={() => handleDeleteReportedPost(rep.postId, rep.id)}
                                                        >
                                                            Delete Post
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: USERS */}
                {activeTab === 'users' && (
                    <div className="admin-card-section">
                        <h2 className="admin-section-heading">Registered Readers</h2>
                        <p className="admin-section-desc">Manage user accounts across the BookSnaps platform.</p>

                        {loading ? (
                            <PostSkeleton />
                        ) : users.length === 0 ? (
                            <p className="profile-no-posts-text">No users found.</p>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div className="pin-user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                            {u.username ? u.username.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <strong>{u.name || u.username}</strong>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`admin-role-pill ${u.role === 'admin' ? 'admin' : ''}`}>
                                                        {u.role || 'user'}
                                                    </span>
                                                </td>
                                                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            type="button"
                                                            className="admin-danger-btn"
                                                            onClick={() => handleDeleteUser(u.id, u.username)}
                                                            title="Delete User"
                                                        >
                                                            <FiUserX style={{ marginRight: '4px' }} /> Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
