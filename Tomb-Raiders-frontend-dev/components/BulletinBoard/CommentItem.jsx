import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

// --- 공통 스타일 함수 ---
const hoverStyle = (e) => {
  e.currentTarget.style.backgroundColor = '#F0F5FF';
};
const leaveStyle = (e) => {
  e.currentTarget.style.backgroundColor = 'transparent';
};
const dangerHoverStyle = (e) => {
  e.currentTarget.style.backgroundColor = '#FFF0F0';
};
const commonHoverStyle = (e) => {
  e.currentTarget.style.backgroundColor = '#F5F5F5';
};

const commentShape = PropTypes.shape({
  commentId: PropTypes.number.isRequired,
  content: PropTypes.string,
  authorNickname: PropTypes.string,
  loginId: PropTypes.string,
  createdAt: PropTypes.string,
  profileImageUrl: PropTypes.string,
  isDeletedDummy: PropTypes.bool,
  children: PropTypes.array,
});

const commentStatesShape = PropTypes.shape({
  editingId: PropTypes.number,
  replyingId: PropTypes.number,
  activeMenuId: PropTypes.number,
  editContent: PropTypes.string,
  replyContent: PropTypes.string,
});

const commentActionsShape = PropTypes.shape({
  setActiveMenuId: PropTypes.func.isRequired,
  setEditingId: PropTypes.func.isRequired,
  setReplyingId: PropTypes.func.isRequired,
  setEditContent: PropTypes.func.isRequired,
  setReplyContent: PropTypes.func.isRequired,
});

const apiActionsShape = PropTypes.shape({
  onReplySubmit: PropTypes.func.isRequired,
  onEditSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReport: PropTypes.func.isRequired,
  onAuthError: PropTypes.func.isRequired,
});

const currentUserShape = PropTypes.shape({
  nickname: PropTypes.string,
  loginId: PropTypes.string,
  role: PropTypes.string,
});

const sharedPropTypes = {
  comment: commentShape.isRequired,
  isChild: PropTypes.bool,
  depth: PropTypes.number,
  currentUser: currentUserShape,
  postAuthorNickname: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  formatDate: PropTypes.func.isRequired,
  commentStates: commentStatesShape.isRequired,
  commentActions: commentActionsShape.isRequired,
  apiActions: apiActionsShape.isRequired,
};

function CommentChildren({
  childComments,
  depth = 0,
  currentUser,
  postAuthorNickname,
  isAdmin,
  isLoggedIn,
  formatDate,
  commentStates,
  commentActions,
  apiActions,
}) {
  if (!childComments || childComments.length === 0) return null;
  if (depth > 10) return null; // 방어 로직

  return (
    <div style={{ marginTop: vw(5), display: 'flex', flexDirection: 'column' }}>
      {childComments.map((child) => (
        <CommentItem
          key={child.commentId}
          comment={child}
          isChild
          depth={depth + 1}
          currentUser={currentUser}
          postAuthorNickname={postAuthorNickname}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          formatDate={formatDate}
          commentStates={commentStates}
          commentActions={commentActions}
          apiActions={apiActions}
        />
      ))}
    </div>
  );
}

CommentChildren.propTypes = {
  childComments: PropTypes.arrayOf(commentShape),
  depth: PropTypes.number,
  currentUser: currentUserShape,
  postAuthorNickname: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  formatDate: PropTypes.func.isRequired,
  commentStates: commentStatesShape.isRequired,
  commentActions: commentActionsShape.isRequired,
  apiActions: apiActionsShape.isRequired,
};

// 💡 [수정] targetLoginId Props 추가
function CommentDropdown({
  commentId,
  targetLoginId,
  content,
  isAuthor,
  isAdmin,
  commentActions,
  apiActions,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: vw(25),
        right: 0,
        width: vw(90),
        backgroundColor: 'white',
        borderRadius: vw(8),
        boxShadow: `0 ${vw(4)} ${vw(12)} rgba(0,0,0,0.15)`,
        border: `${vw(1)} solid #E0E0E0`,
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {isAuthor && (
        <button
          onClick={() => {
            commentActions.setEditingId(commentId);
            commentActions.setEditContent(content || '');
            commentActions.setActiveMenuId(null);
          }}
          style={{
            width: '100%',
            padding: `${vw(10)} 0`,
            fontSize: vw(13),
            color: '#0066FF',
            cursor: 'pointer',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: `${vw(1)} solid #F0F0F0`,
          }}
          onMouseOver={hoverStyle}
          onFocus={hoverStyle}
          onMouseOut={leaveStyle}
          onBlur={leaveStyle}
        >
          수정
        </button>
      )}
      {(isAuthor || isAdmin) && (
        <button
          onClick={() => {
            apiActions.onDelete(commentId);
            commentActions.setActiveMenuId(null);
          }}
          style={{
            width: '100%',
            padding: `${vw(10)} 0`,
            fontSize: vw(13),
            color: '#FF4D4F',
            cursor: 'pointer',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: `${vw(1)} solid #F0F0F0`,
          }}
          onMouseOver={dangerHoverStyle}
          onFocus={dangerHoverStyle}
          onMouseOut={leaveStyle}
          onBlur={leaveStyle}
        >
          삭제
        </button>
      )}
      {/* 💡 [수정] 신고 버튼 클릭 시 targetLoginId 함께 전달 */}
      <button
        onClick={() => {
          apiActions.onReport(commentId, targetLoginId);
          commentActions.setActiveMenuId(null);
        }}
        style={{
          width: '100%',
          padding: `${vw(10)} 0`,
          fontSize: vw(13),
          color: '#333',
          cursor: 'pointer',
          border: 'none',
          backgroundColor: 'transparent',
        }}
        onMouseOver={commonHoverStyle}
        onFocus={commonHoverStyle}
        onMouseOut={leaveStyle}
        onBlur={leaveStyle}
      >
        신고
      </button>
    </div>
  );
}
CommentDropdown.propTypes = {
  commentId: PropTypes.number.isRequired,
  targetLoginId: PropTypes.string,
  content: PropTypes.string,
  isAuthor: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  commentActions: commentActionsShape.isRequired,
  apiActions: apiActionsShape.isRequired,
};

function DeletedComment({
  comment,
  isChild,
  depth,
  currentUser,
  postAuthorNickname,
  isAdmin,
  isLoggedIn,
  formatDate,
  commentStates,
  commentActions,
  apiActions,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: vw(10),
        padding: isChild ? `${vw(10)} 0 ${vw(10)} ${vw(20)}` : vw(15),
        backgroundColor: isChild ? 'transparent' : '#FBFBFB',
        borderRadius: vw(8),
        borderLeft: isChild ? `${vw(2)} solid #E0E0E0` : 'none',
        marginTop: isChild ? vw(10) : 0,
      }}
    >
      <div style={{ display: 'flex', gap: vw(10), alignItems: 'center' }}>
        {isChild && <div style={{ color: '#B4B4B4', fontWeight: 'bold' }}>└</div>}
        <div style={{ padding: vw(10), color: '#999', fontSize: vw(14), fontStyle: 'italic' }}>
          삭제된 댓글입니다.
        </div>
      </div>
      <CommentChildren
        childComments={comment.children}
        depth={depth}
        currentUser={currentUser}
        postAuthorNickname={postAuthorNickname}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        formatDate={formatDate}
        commentStates={commentStates}
        commentActions={commentActions}
        apiActions={apiActions}
      />
    </div>
  );
}
DeletedComment.propTypes = sharedPropTypes;

function ActiveComment({
  comment,
  isChild,
  depth,
  currentUser,
  postAuthorNickname,
  isAdmin,
  isLoggedIn,
  formatDate,
  commentStates,
  commentActions,
  apiActions,
}) {
  const isEditing = commentStates.editingId === comment.commentId;
  const isReplying = commentStates.replyingId === comment.commentId;
  const isMenuOpen = commentStates.activeMenuId === comment.commentId;

  const isCommentAuthor = Boolean(
    (currentUser?.loginId && comment.loginId && currentUser.loginId === comment.loginId) ||
    (currentUser?.nickname &&
      comment.authorNickname &&
      currentUser.nickname === comment.authorNickname) ||
    (currentUser?.loginId && comment.authorNickname === currentUser.loginId),
  );

  const isPostAuthor = Boolean(
    postAuthorNickname && comment.authorNickname && postAuthorNickname === comment.authorNickname,
  );

  const defaultProfileImg =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"%3E%3Crect width="30" height="30" fill="%23CCCCCC"/%3E%3C/svg%3E';
  const displayProfileImg = comment.profileImageUrl || defaultProfileImg;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: vw(10),
        padding: isChild ? `${vw(10)} 0 ${vw(10)} ${vw(20)}` : vw(15),
        backgroundColor: isChild ? 'transparent' : '#FBFBFB',
        borderRadius: vw(8),
        borderLeft: isChild ? `${vw(2)} solid #E0E0E0` : 'none',
        marginTop: isChild ? vw(10) : 0,
      }}
    >
      <div style={{ display: 'flex', gap: vw(10), position: 'relative' }}>
        {isChild && (
          <div style={{ color: '#B4B4B4', fontWeight: 'bold', paddingTop: vw(5) }}>└</div>
        )}

        <div
          style={{
            width: vw(30),
            height: vw(30),
            backgroundColor: '#CCC',
            borderRadius: '50%',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <img
            src={displayProfileImg}
            alt="프로필"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultProfileImg;
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: vw(10), alignItems: 'center' }}>
              <span style={{ fontSize: vw(13), fontWeight: 'bold' }}>
                {comment.authorNickname || comment.loginId || '(알 수 없음)'}
              </span>
              {isPostAuthor && (
                <span
                  style={{
                    fontSize: vw(11),
                    color: '#2C9753',
                    border: `1px solid #2C9753`,
                    borderRadius: vw(4),
                    padding: `0 ${vw(4)}`,
                  }}
                >
                  작성자
                </span>
              )}
              <span style={{ fontSize: vw(11), color: '#999' }}>
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: vw(10) }}>
              {!isChild && (
                <button
                  onClick={() => {
                    if (!isLoggedIn) return apiActions.onAuthError();
                    commentActions.setReplyingId(isReplying ? null : comment.commentId);
                    commentActions.setReplyContent('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: vw(12),
                    color: '#666',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  {isReplying ? '답글 취소' : '답글 달기'}
                </button>
              )}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() =>
                    commentActions.setActiveMenuId(isMenuOpen ? null : comment.commentId)
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: vw(16),
                    color: '#999',
                    cursor: 'pointer',
                    padding: `0 ${vw(5)}`,
                    fontWeight: 'bold',
                    outline: 'none',
                  }}
                >
                  ⋮
                </button>
                {/* 💡 [수정] CommentDropdown에 targetLoginId 전달 */}
                {isMenuOpen && (
                  <CommentDropdown
                    commentId={comment.commentId}
                    targetLoginId={comment.loginId}
                    content={comment.content}
                    isAuthor={isCommentAuthor}
                    isAdmin={isAdmin}
                    commentActions={commentActions}
                    apiActions={apiActions}
                  />
                )}
              </div>
            </div>
          </div>
          {isEditing ? (
            <div style={{ display: 'flex', gap: vw(10), marginTop: vw(10) }}>
              <input
                type="text"
                value={commentStates.editContent}
                onChange={(e) => commentActions.setEditContent(e.target.value)}
                style={{
                  flex: 1,
                  padding: vw(8),
                  borderRadius: vw(5),
                  border: `1px solid #CCC`,
                  fontSize: vw(13),
                  outline: 'none',
                }}
              />
              <button
                onClick={() => apiActions.onEditSubmit(comment.commentId)}
                style={{
                  padding: `0 ${vw(15)}`,
                  backgroundColor: '#2C9753',
                  color: 'white',
                  borderRadius: vw(5),
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: vw(13),
                }}
              >
                저장
              </button>
              <button
                onClick={() => commentActions.setEditingId(null)}
                style={{
                  padding: `0 ${vw(15)}`,
                  backgroundColor: '#999',
                  color: 'white',
                  borderRadius: vw(5),
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: vw(13),
                }}
              >
                취소
              </button>
            </div>
          ) : (
            <div
              style={{ fontSize: vw(14), marginTop: vw(5), whiteSpace: 'pre-wrap', color: '#333' }}
            >
              {comment.content}
            </div>
          )}
        </div>
      </div>
      {isReplying && (
        <div style={{ display: 'flex', gap: vw(10), marginTop: vw(10), marginLeft: vw(40) }}>
          <input
            type="text"
            value={commentStates.replyContent}
            onChange={(e) => commentActions.setReplyContent(e.target.value)}
            placeholder="대댓글을 입력하세요."
            style={{
              flex: 1,
              padding: vw(10),
              borderRadius: vw(5),
              border: `${vw(1)} solid #CCC`,
              fontSize: vw(13),
              outline: 'none',
            }}
          />
          <button
            onClick={() => apiActions.onReplySubmit(comment.commentId)}
            style={{
              padding: `0 ${vw(15)}`,
              backgroundColor: '#333',
              color: 'white',
              borderRadius: vw(5),
              border: 'none',
              cursor: 'pointer',
              fontSize: vw(13),
              fontWeight: 'bold',
            }}
          >
            등록
          </button>
        </div>
      )}

      <CommentChildren
        childComments={comment.children}
        depth={depth}
        currentUser={currentUser}
        postAuthorNickname={postAuthorNickname}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        formatDate={formatDate}
        commentStates={commentStates}
        commentActions={commentActions}
        apiActions={apiActions}
      />
    </div>
  );
}
ActiveComment.propTypes = sharedPropTypes;

function CommentItem({
  comment,
  isChild,
  depth,
  currentUser,
  postAuthorNickname,
  isAdmin,
  isLoggedIn,
  formatDate,
  commentStates,
  commentActions,
  apiActions,
}) {
  const isDeleted =
    comment.isDeletedDummy || comment.content?.trim()?.includes('삭제된 댓글입니다');
  const Component = isDeleted ? DeletedComment : ActiveComment;

  return (
    <Component
      comment={comment}
      isChild={isChild}
      depth={depth}
      currentUser={currentUser}
      postAuthorNickname={postAuthorNickname}
      isAdmin={isAdmin}
      isLoggedIn={isLoggedIn}
      formatDate={formatDate}
      commentStates={commentStates}
      commentActions={commentActions}
      apiActions={apiActions}
    />
  );
}
CommentItem.propTypes = sharedPropTypes;

export default CommentItem;
