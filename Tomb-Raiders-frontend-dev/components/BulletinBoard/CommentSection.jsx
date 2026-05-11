import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import CommentItem from './CommentItem';

function CommentSection({
  comments,
  postData,
  currentUser,
  isAdmin,
  isLoggedIn,
  formatDate,
  newComment,
  setNewComment,
  onCommentSubmit,
  commentStates,
  commentActions,
  apiActions,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onCommentSubmit(null);
  };

  return (
    <div style={{ borderTop: `${vw(1)} solid #EEE`, paddingTop: vw(30) }}>
      <h3 style={{ fontSize: vw(18), fontWeight: 'bold', marginBottom: vw(20) }}>
        댓글 {postData?.commentCount || comments.length}
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: vw(10), marginBottom: vw(30) }}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 남겨보세요."
          aria-label="댓글 입력"
          style={{
            flex: 1,
            padding: vw(12),
            borderRadius: vw(8),
            border: `${vw(1)} solid #CCC`,
            fontSize: vw(14),
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: `0 ${vw(20)}`,
            backgroundColor: '#333',
            color: 'white',
            borderRadius: vw(8),
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          등록
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: vw(15) }}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              currentUser={currentUser}
              // 💡 노출용은 닉네임, 내부 로직 판별용은 로그인 아이디 전달
              postAuthorNickname={postData?.nickname || postData?.loginId}
              postAuthorLoginId={postData?.loginId} // 💡 추가: 작성자 여부 등 내부 판별에 사용
              isAdmin={isAdmin}
              isLoggedIn={isLoggedIn}
              formatDate={formatDate}
              commentStates={commentStates}
              commentActions={commentActions}
              apiActions={apiActions}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: vw(20) }}>
            첫 번째 댓글을 남겨보세요!
          </div>
        )}
      </div>
    </div>
  );
}

CommentSection.propTypes = {
  comments: PropTypes.array.isRequired,
  postData: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  isAdmin: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  formatDate: PropTypes.func.isRequired,
  newComment: PropTypes.string.isRequired,
  setNewComment: PropTypes.func.isRequired,
  onCommentSubmit: PropTypes.func.isRequired,
  commentStates: PropTypes.object.isRequired,
  commentActions: PropTypes.object.isRequired,
  apiActions: PropTypes.object.isRequired,
};

export default CommentSection;
