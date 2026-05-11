import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

function PostCard({ post, onClick }) {
  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  // 썸네일 우선순위: 1. 직접 업로드한 이미지 배열의 첫 번째 사진 -> 2. 기존 assetUrl
  const thumbnail = post.images && post.images.length > 0 ? post.images[0].imageUrl : post.assetUrl;

  const handleMouseEnter = (e) => {
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
  };
  const handleMouseLeave = (e) => {
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: vw(25),
        backgroundColor: 'white',
        border: `${vw(1)} solid #E0E0E0`,
        borderRadius: vw(12),
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: vw(15),
        outline: 'none',
        background: 'white',
      }}
      onMouseOver={handleMouseEnter}
      onMouseOut={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {/* 1. 상단: 작성자 및 작성일 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: vw(12) }}>
          <div
            style={{
              width: vw(35),
              height: vw(35),
              minWidth: vw(35), // 💡 추가: 어떤 상황에서도 너비 축소 방지
              minHeight: vw(35), // 💡 추가: 어떤 상황에서도 높이 축소 방지
              flexShrink: 0, // 💡 추가: 공간이 좁아져도 원형이 타원형으로 찌그러지지 않게 완벽 고정
              backgroundColor: '#D9D9D9',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={post.profileImageUrl || '/defaultprofile.png'}
              alt={`${post.nickname || post.loginId}의 프로필`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // 💡 원 안에 빈 공간 없이 꽉 차게 맞춰줌
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/defaultprofile.png';
              }}
            />
          </div>
          <span style={{ fontSize: vw(14), fontWeight: 'bold', color: '#333' }}>
            {post.nickname || post.loginId}
          </span>
        </div>
        <span style={{ fontSize: vw(12), color: '#999' }}>{formatDate(post.createdAt)}</span>
      </div>

      {/* 2. 중단: 제목과 내용 */}
      <div style={{ width: '100%' }}>
        <h3
          style={{ fontSize: vw(18), fontWeight: 'bold', margin: `0 0 ${vw(8)} 0`, color: '#111' }}
        >
          {post.title}
        </h3>
        <p
          style={{
            fontSize: vw(14),
            color: '#666',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.content}
        </p>
      </div>

      {/* 3. 하단 미디어: 이미지가 있을 때만 350 높이 영역 출력 */}
      {thumbnail && (
        <img
          src={thumbnail}
          alt={post.title}
          style={{
            width: '100%',
            height: vw(350),
            objectFit: 'cover',
            borderRadius: vw(8),
            backgroundColor: '#F9F9F9',
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none'; // 로드 실패 시 영역 숨김
          }}
        />
      )}

      {/* 4. 최하단: 좋아요 및 댓글 수 통계 */}
      <div
        style={{ display: 'flex', gap: vw(15), fontSize: vw(13), color: '#888', fontWeight: '500' }}
      >
        <span>♥ {post.recommendCount || 0}</span>
        <span>💬 {post.commentCount || 0}</span>
      </div>
    </button>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    boardId: PropTypes.number.isRequired,
    loginId: PropTypes.string.isRequired,
    nickname: PropTypes.string,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    assetUrl: PropTypes.string,
    profileImageUrl: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        imageUrl: PropTypes.string,
      }),
    ),
    recommendCount: PropTypes.number,
    commentCount: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default PostCard;
