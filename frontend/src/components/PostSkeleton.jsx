// Renders a single Pinterest-style skeleton card for the masonry grid.
// Heights are varied so the masonry looks natural while loading.
export default function PostSkeleton({ height = '240px' }) {
    return (
        <div className="pin-skeleton-card">
            <div
                className="pin-skeleton-img skeleton-shimmer"
                style={{ height }}
                aria-hidden="true"
            />
            <div className="pin-skeleton-body" style={{ background: 'var(--bg-card)' }}>
                <div className="pin-skeleton-line short skeleton-shimmer" aria-hidden="true" />
                <div className="pin-skeleton-line full skeleton-shimmer" aria-hidden="true" />
            </div>
        </div>
    );
}