import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

function PostDetail({
  postData,
  currentUser,
  isAdmin,
  onRecommend,
  onEdit,
  onDelete,
  onReport,
  formatDate,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 💡 게시글 작성자 권한 체크: loginId 또는 nickname 비교
  const isPostAuthor = Boolean(
    currentUser &&
    postData &&
    (currentUser.loginId === postData.loginId || currentUser.nickname === postData.nickname),
  );

  // 💡 인라인 SVG를 사용하여 외부 요청 없이 안전하게 기본 프로필 표시
  const defaultProfileImg =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23D9D9D9"/%3E%3C/svg%3E';

  return (
    <>
      <div
        style={{ borderBottom: `${vw(1)} solid #EEE`, paddingBottom: vw(20), marginBottom: vw(20) }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1
            style={{
              fontSize: vw(28),
              fontWeight: 'bold',
              marginBottom: vw(15),
              color: '#333',
              flex: 1,
            }}
          >
            {postData.title}
          </h1>

          {/* 💡 게시글 드롭다운 메뉴 아이콘 및 리스트 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: vw(20),
                color: '#999',
                cursor: 'pointer',
                padding: `0 ${vw(10)}`,
                fontWeight: 'bold',
              }}
            >
              ⋮
            </button>
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: vw(30),
                  right: 0,
                  width: vw(100),
                  backgroundColor: 'white',
                  borderRadius: vw(8),
                  boxShadow: `0 ${vw(4)} ${vw(12)} rgba(0,0,0,0.15)`,
                  border: `${vw(1)} solid #E0E0E0`,
                  overflow: 'hidden',
                  zIndex: 10,
                }}
              >
                {/* 💡 작성자에게만 보이는 수정 버튼 */}
                {isPostAuthor && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit();
                    }}
                    style={{
                      width: '100%',
                      padding: `${vw(10)} 0`,
                      fontSize: vw(14),
                      color: '#0066FF',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderBottom: `${vw(1)} solid #F0F0F0`,
                    }}
                  >
                    수정
                  </button>
                )}

                {/* 💡 작성자 또는 관리자에게 보이는 삭제 버튼 */}
                {(isPostAuthor || isAdmin) && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete();
                    }}
                    style={{
                      width: '100%',
                      padding: `${vw(10)} 0`,
                      fontSize: vw(14),
                      color: '#FF4D4F',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderBottom: `${vw(1)} solid #F0F0F0`,
                    }}
                  >
                    삭제
                  </button>
                )}

                {/* 💡 누구에게나 보이는 신고 버튼 */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onReport();
                  }}
                  style={{
                    width: '100%',
                    padding: `${vw(10)} 0`,
                    fontSize: vw(14),
                    color: '#333',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                >
                  신고
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: vw(12) }}>
            <img
              src={postData.profileImageUrl || defaultProfileImg}
              alt="P"
              style={{
                width: vw(40),
                height: vw(40),
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #ddd',
              }}
              onError={(e) => {
                e.target.onerror = null; // 무한 루프 방지
                e.target.src = defaultProfileImg;
              }}
            />
            <div>
              <div style={{ fontSize: vw(16), fontWeight: 'bold' }}>
                {postData.nickname || postData.loginId || '익명'}
              </div>
              <div style={{ fontSize: vw(12), color: '#999' }}>
                {formatDate(postData.createdAt)}
              </div>
            </div>
          </div>

          <button
            onClick={onRecommend}
            style={{
              padding: `${vw(8)} ${vw(16)}`,
              borderRadius: vw(20),
              border: `${vw(1)} solid #2C9753`,
              backgroundColor: postData.isRecommended ? '#2C9753' : 'white',
              color: postData.isRecommended ? 'white' : '#2C9753',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ♥ 좋아요 {postData.recommendCount}
          </button>
        </div>
      </div>

      <div
        style={{
          minHeight: vw(300),
          fontSize: vw(16),
          color: '#444',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <p style={{ whiteSpace: 'pre-wrap', marginBottom: vw(40) }}>{postData.content}</p>

        {/* 💡 첨부 사진 렌더링 영역 */}
        {postData.images && postData.images.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: vw(20) }}>
            {postData.images.map((img) => (
              <div
                key={img.imageId}
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: vw(10),
                  padding: vw(10),
                  border: '1px solid #EAEAEA',
                  textAlign: 'center',
                }}
              >
                <img
                  src={img.imageUrl}
                  alt="첨부 이미지"
                  style={{
                    width: '100%',
                    minHeight: vw(200),
                    objectFit: 'contain',
                    borderRadius: vw(10),
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';

                    const msg = document.createElement('div');
                    msg.style.color = '#FF4D4F';
                    msg.style.fontSize = vw(14);
                    msg.style.padding = vw(20);
                    msg.innerText = '사진을 불러올 수 없습니다. (서버 권한 오류)';
                    e.target.parentNode.appendChild(msg);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

PostDetail.propTypes = {
  postData: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  isAdmin: PropTypes.bool.isRequired,
  onRecommend: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReport: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

export default PostDetail;
