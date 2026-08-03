// src/components/WatchListPanel.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectWatchList,
  selectCurrentlyPlaying,
  removeFromWatchList,
  setCurrentlyPlaying,
  clearWatchList,
  reorderWatchList,
} from '../store/slices/watchListSlice';
import API from '../api/axios';

function WatchListPanel({ onPlayVideo, roomSocket, roomId }) {
  const dispatch = useDispatch();
  const watchList = useSelector(selectWatchList);
  const currentlyPlaying = useSelector(selectCurrentlyPlaying);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // ✅ Play a video for everyone in the room
  const handlePlay = (video) => {
    dispatch(setCurrentlyPlaying(video._id));

    // Get video URL
    const videoUrl = video.videoUrl?.startsWith('http')
      ? video.videoUrl
      : `${API.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000'}${video.videoUrl}`;

    // Notify everyone via socket
    if (roomSocket) {
      roomSocket.emit('changeVideo', {
        roomId,
        videoUrl,
        videoTitle: video.title,
        videoId: video._id,
      });
    }

    // Callback to parent
    if (onPlayVideo) {
      onPlayVideo(video, videoUrl);
    }
  };

  // ✅ Search and add more videos
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await API.get('/videos', {
        params: { search: searchQuery, limit: 10 },
      });
      setSearchResults(data.videos || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  // ✅ Add video from search results
  const handleAddFromSearch = (video) => {
    dispatch({
      type: 'watchList/addToWatchList',
      payload: video,
    });
    setSearchResults(prev =>
      prev.filter(v => v._id !== video._id)
    );
  };

  // ✅ Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getThumbUrl = (url) => {
    if (!url) return 'https://picsum.photos/120/68';
    if (url.startsWith('http')) return url;
    return `${API.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: 16 }}>📺</span>
          <span style={s.headerTitle}>
            Watch List ({watchList.length})
          </span>
        </div>
        <div style={s.headerActions}>
          <button
            style={s.iconBtn}
            onClick={() => setShowSearch(!showSearch)}
            title="Search & add videos"
          >
            🔍
          </button>
          {watchList.length > 0 && (
            <button
              style={{ ...s.iconBtn, color: '#ef4444' }}
              onClick={() => dispatch(clearWatchList())}
              title="Clear all"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Search Bar (toggled) */}
      {showSearch && (
        <div style={s.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search videos to add..."
            style={s.searchInput}
          />
          <button
            style={s.searchBtn}
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? '...' : '🔍'}
          </button>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={s.searchResults}>
          <div style={s.sectionLabel}>
            Search Results ({searchResults.length})
          </div>
          {searchResults.map((video) => (
            <div key={video._id} style={s.searchItem}>
              <img
                src={getThumbUrl(video.thumbnailUrl)}
                alt=""
                style={s.searchThumb}
              />
              <div style={s.searchInfo}>
                <div style={s.searchTitle}>{video.title}</div>
                <div style={s.searchMeta}>
                  {formatDuration(video.duration)}
                </div>
              </div>
              <button
                style={s.addBtn}
                onClick={() => handleAddFromSearch(video)}
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Watch List */}
      <div style={s.list}>
        {watchList.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📺</div>
            <div style={s.emptyTitle}>No videos in watch list</div>
            <div style={s.emptyDesc}>
              Add videos from the home page using "📺 Watch Together"
              or search above
            </div>
          </div>
        ) : (
          watchList.map((video, index) => {
            const isPlaying = currentlyPlaying === video._id;

            return (
              <div
                key={video._id}
                style={{
                  ...s.videoItem,
                  ...(isPlaying ? s.videoItemPlaying : {}),
                }}
                onClick={() => handlePlay(video)}
              >
                {/* Number / Playing indicator */}
                <div style={s.indexCol}>
                  {isPlaying ? (
                    <span style={s.playingIcon}>▶</span>
                  ) : (
                    <span style={s.indexNumber}>{index + 1}</span>
                  )}
                </div>

                {/* Thumbnail */}
                <div style={s.thumbWrap}>
                  <img
                    src={getThumbUrl(video.thumbnailUrl)}
                    alt=""
                    style={s.thumb}
                  />
                  {video.duration > 0 && (
                    <span style={s.durationBadge}>
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={s.videoInfo}>
                  <div
                    style={{
                      ...s.videoTitle,
                      ...(isPlaying ? { color: '#8b5cf6' } : {}),
                    }}
                  >
                    {video.title}
                  </div>
                  <div style={s.videoMeta}>
                    {video.uploader?.name || 'WatchNest'}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  style={s.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(removeFromWatchList(video._id));
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════
const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2937',
  },
  headerActions: {
    display: 'flex',
    gap: 4,
  },
  iconBtn: {
    width: 28,
    height: 28,
    border: 'none',
    background: '#f3f4f6',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    display: 'flex',
    gap: 6,
    padding: '8px 12px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fafbfc',
  },
  searchInput: {
    flex: 1,
    padding: '8px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    background: '#fff',
  },
  searchBtn: {
    padding: '8px 12px',
    background: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  searchResults: {
    maxHeight: 200,
    overflowY: 'auto',
    borderBottom: '1px solid #e5e7eb',
    background: '#fefce8',
  },
  sectionLabel: {
    padding: '8px 12px 4px',
    fontSize: 11,
    fontWeight: 700,
    color: '#92400e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  searchThumb: {
    width: 48,
    height: 28,
    borderRadius: 4,
    objectFit: 'cover',
    flexShrink: 0,
  },
  searchInfo: {
    flex: 1,
    minWidth: 0,
  },
  searchTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  searchMeta: {
    fontSize: 10,
    color: '#92400e',
  },
  addBtn: {
    width: 24,
    height: 24,
    border: '1px solid #d97706',
    background: '#fff',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    color: '#d97706',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  },
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#94a3b8',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    lineHeight: 1.5,
    maxWidth: 220,
    margin: '0 auto',
  },
  videoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderLeft: '3px solid transparent',
  },
  videoItemPlaying: {
    background: '#f5f3ff',
    borderLeftColor: '#8b5cf6',
  },
  indexCol: {
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  indexNumber: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 600,
  },
  playingIcon: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: 700,
  },
  thumbWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  thumb: {
    width: 64,
    height: 36,
    borderRadius: 6,
    objectFit: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    background: 'rgba(0,0,0,0.8)',
    color: '#fff',
    fontSize: 9,
    padding: '1px 4px',
    borderRadius: 3,
    fontWeight: 600,
  },
  videoInfo: {
    flex: 1,
    minWidth: 0,
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  videoMeta: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  removeBtn: {
    width: 22,
    height: 22,
    border: 'none',
    background: 'transparent',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: 12,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
};

export default WatchListPanel;