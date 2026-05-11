import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { vw } from '../../utils/style';

/**
 * 마이페이지에서 사용자의 게시글, 댓글, 즐겨찾기 내역을 탭 형식으로 보여주는 활동 섹션 컴포넌트
 * @param {string} activeTab - 현재 활성화된 탭의 이름
 * @param {function} setActiveTab - 활성화된 탭을 변경하는 함수
 * @param {Array} posts - 사용자가 작성한 게시글 목록
 * @param {Array} comments - 사용자가 작성한 댓글 목록
 * @param {boolean} isLoading - 데이터 로딩 상태 여부
 * @param {function} onDeletePost - 게시글 삭제 시 호출되는 함수
 * @param {function} onDeleteComment - 댓글 삭제 시 호출되는 함수
 */
function ActivitySection({
  activeTab,
  setActiveTab,
  posts,
  comments,
  isLoading,
  onDeletePost,
  onDeleteComment,
}) {
  const tabs = ['게시글', '댓글', '즐겨찾기'];
  const navigate = useNavigate();

  // 💡 상태(state) 방식 대신 URL 뒤에 직접 파라미터를 붙여서 이동시킵니다!
  const handleGoToPost = (boardId) => {
    navigate(`/bulletinboard?boardId=${boardId}`);
  };

  return (
    <div
      style={{
        width: vw(600),
        minHeight: vw(300),
        backgroundColor: '#FFF',
        border: `${vw(1)} solid #B4B4B4`,
        borderRadius: vw(10),
        overflow: 'hidden',
      }}
    >
      {/* 상단 탭 헤더 영역 */}
      <div
        role="tablist"
        style={{ display: 'flex', height: vw(40), borderBottom: `${vw(1)} solid #E0E0E0` }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                fontSize: vw(14),
                fontWeight: isActive ? 'bold' : '500',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: isActive ? `${vw(4)} solid #000` : `${vw(4)} solid transparent`,
                color: isActive ? '#000' : '#B4B4B4',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              {tab}
            </button>
          );
        })}
        <div style={{ flex: 3 }} />
      </div>

      {/* 탭 내부 콘텐츠 영역 */}
      <div style={{ padding: vw(20) }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#999', padding: vw(40) }}>
            데이터를 불러오는 중입니다...
          </div>
        ) : (
          <>
            {/* 게시글 탭 콘텐츠 */}
            {activeTab === '게시글' &&
              (posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={`my-post-${post.boardId}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: vw(12),
                      borderBottom: '1px solid #F0F0F0',
                    }}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => handleGoToPost(post.boardId)}
                        style={{
                          fontSize: vw(16),
                          fontWeight: '500',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {post.title}
                      </button>
                      <div style={{ fontSize: vw(12), color: '#999', marginTop: vw(4) }}>
                        추천 {post.recommendCount || 0}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeletePost(post.boardId)}
                      style={{
                        color: '#FF4D4F',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: vw(14),
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: vw(40) }}>
                  작성한 게시글이 없습니다.
                </div>
              ))}

            {/* 댓글 탭 콘텐츠 */}
            {activeTab === '댓글' &&
              (comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={`my-comment-${comment.commentId}`}
                    style={{ padding: vw(12), borderBottom: '1px solid #F0F0F0' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleGoToPost(comment.boardId)}
                        style={{
                          fontSize: vw(12),
                          color: '#2C9753',
                          fontWeight: 'bold',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: vw(4),
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >
                        {comment.boardTitle || '원문 게시글로 이동'}{' '}
                        <span style={{ fontSize: vw(10) }}>➔</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteComment(comment.boardId, comment.commentId)}
                        style={{
                          color: '#999',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: vw(12),
                        }}
                      >
                        삭제
                      </button>
                    </div>
                    <div style={{ fontSize: vw(15), marginTop: vw(8), color: '#333' }}>
                      {typeof comment.content === 'string' && comment.content.startsWith('{')
                        ? JSON.parse(comment.content).content
                        : comment.content}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: vw(40) }}>
                  작성한 댓글이 없습니다.
                </div>
              ))}

            {/* 즐겨찾기 탭 콘텐츠 (현재 미구현) */}
            {activeTab === '즐겨찾기' && (
              <div style={{ textAlign: 'center', color: '#999', padding: vw(40) }}>
                즐겨찾기 내역이 없습니다.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

ActivitySection.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  posts: PropTypes.arrayOf(PropTypes.object).isRequired,
  comments: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onDeletePost: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
};

export default ActivitySection;
