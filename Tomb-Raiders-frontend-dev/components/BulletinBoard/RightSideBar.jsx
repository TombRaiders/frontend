import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

const STYLES = {
  sidebar: {
    width: vw(300),
    display: 'flex',
    flexDirection: 'column',
    gap: vw(15),
    position: 'sticky',
    top: 0,
  },
  popularBox: {
    width: '100%',
    minHeight: vw(450),
    backgroundColor: 'white',
    borderRadius: vw(10),
    border: `${vw(1)} solid #E0E0E0`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: `${vw(22)} ${vw(18)}`,
    boxSizing: 'border-box',
  },
  title: {
    margin: `0 0 ${vw(18)} 0`,
    color: '#222',
    fontSize: vw(17),
    fontWeight: 800,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: vw(4),
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  rowButton: {
    width: '100%',
    minHeight: vw(34),
    display: 'grid',
    gridTemplateColumns: `${vw(28)} minmax(0, 1fr) ${vw(62)}`,
    alignItems: 'center',
    gap: vw(8),
    border: 'none',
    borderRadius: vw(6),
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: `${vw(5)} ${vw(6)}`,
    textAlign: 'left',
  },
  rank: {
    width: vw(24),
    height: vw(24),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vw(6),
    backgroundColor: '#F0F7F3',
    color: '#2C9753',
    fontSize: vw(12),
    fontWeight: 800,
  },
  topRank: {
    backgroundColor: '#2C9753',
    color: 'white',
  },
  postTitle: {
    minWidth: 0,
    color: '#222',
    fontSize: vw(13),
    fontWeight: 700,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  author: {
    minWidth: 0,
    color: '#8A8A8A',
    fontSize: vw(11),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    textAlign: 'right',
  },
  empty: {
    marginTop: vw(110),
    color: '#9A9A9A',
    fontSize: vw(13),
    textAlign: 'center',
  },
  buttonGroup: { display: 'flex', flexDirection: 'column', gap: vw(10) },
  button: (color) => ({
    width: '100%',
    padding: vw(14),
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: vw(8),
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: vw(16),
  }),
};

function RightSideBar({
  view = 'read',
  onSubmit = () => {},
  isSubmitting = false,
  popularPosts = [],
  isPopularLoading = false,
  onPopularPostClick = () => {},
}) {
  const visiblePopularPosts = popularPosts.slice(0, 10);

  return (
    <aside style={STYLES.sidebar}>
      <section style={STYLES.popularBox} aria-label="인기글">
        <h2 style={STYLES.title}>인기글 TOP 10</h2>

        {isPopularLoading && <p style={STYLES.empty}>인기글을 불러오는 중입니다.</p>}

        {!isPopularLoading && visiblePopularPosts.length === 0 && (
          <p style={STYLES.empty}>아직 인기글이 없습니다.</p>
        )}

        {!isPopularLoading && visiblePopularPosts.length > 0 && (
          <ol style={STYLES.list}>
            {visiblePopularPosts.map((post, index) => {
              const rank = post.rank || index + 1;
              const author = post.author || post.nickname || post.loginId || '익명';
              const postId = post.bulletinBoardId || post.boardId || `${post.title}-${rank}`;
              return (
                <li key={postId}>
                  <button
                    type="button"
                    style={STYLES.rowButton}
                    onClick={() => onPopularPostClick(post)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#F7FAF8';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.backgroundColor = '#F7FAF8';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ ...STYLES.rank, ...(rank <= 3 ? STYLES.topRank : {}) }}>
                      {rank}
                    </span>
                    <span style={STYLES.postTitle}>{post.title}</span>
                    <span style={STYLES.author}>{author}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {view === 'write' && (
        <div style={STYLES.buttonGroup}>
          <button
            type="button"
            style={{
              ...STYLES.button('#2C9753'),
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '올리기'}
          </button>
        </div>
      )}
    </aside>
  );
}

const popularPostShape = PropTypes.shape({
  bulletinBoardId: PropTypes.number,
  boardId: PropTypes.number,
  rank: PropTypes.number,
  author: PropTypes.string,
  loginId: PropTypes.string,
  nickname: PropTypes.string,
  title: PropTypes.string.isRequired,
});

RightSideBar.propTypes = {
  view: PropTypes.oneOf(['write', 'read', 'edit', 'list', 'detail']),
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  popularPosts: PropTypes.arrayOf(popularPostShape),
  isPopularLoading: PropTypes.bool,
  onPopularPostClick: PropTypes.func,
};

RightSideBar.defaultProps = {
  view: 'read',
  onSubmit: () => {},
  isSubmitting: false,
  popularPosts: [],
  isPopularLoading: false,
  onPopularPostClick: () => {},
};

export default RightSideBar;
