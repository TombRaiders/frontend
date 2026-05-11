import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { vw } from '../../utils/style';
import { get, post, del, patch } from '../../api/apiClient';
import CustomAlertModal from '../Common/CustomAlertModal';

import PostDetail from './PostDetail';
import CommentSection from './CommentSection';
import ReportPromptModal from './ReportPromptModal';

const extractCleanContent = (rawText) => {
  if (!rawText) return '';
  let text = rawText;

  try {
    const parsed = JSON.parse(text);
    if (parsed?.content !== undefined) {
      text = parsed.content;
    }
  } catch (e) {
    console.debug('1차 파싱 실패, 복구를 시도합니다:', e.message);

    const brokenJsonRegex = /\{"content":"(.*?)"(?:,"\w+":".*?")*\}/g;
    if (brokenJsonRegex.test(text)) {
      text = text.replaceAll(brokenJsonRegex, '$1').replaceAll(String.raw`\"`, '"');
    }
  }

  try {
    const parsedAgain = JSON.parse(text);
    if (parsedAgain?.content !== undefined) {
      text = parsedAgain.content;
    }
  } catch (e) {
    console.debug('2차 파싱 불필요 (순수 텍스트):', e.message);
  }

  return text;
};

const formatComments = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map((c) => ({
    ...c,
    content: extractCleanContent(c.content),
    nickname: c.authorNickname || c.loginId || '익명',
    children: c.children?.length > 0 ? formatComments(c.children) : [],
  }));
};

function DetailView({ boardId, onBack, onEditPost, currentUser }) {
  const navigate = useNavigate();
  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    icon: '',
    title: '',
    message: '',
    isConfirm: false,
    onConfirm: null,
    onCloseCallback: null,
  });

  // 💡 [수정] 모달 상태에 targetLoginId 추가
  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    title: '',
    targetType: '',
    targetId: null,
    targetLoginId: '',
    reason: '',
  });

  const [newComment, setNewComment] = useState('');
  const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';
  const isLoggedIn = Boolean(currentUser?.loginId || currentUser?.nickname);

  const showAlert = useCallback((icon, title, message, onCloseCallback = null) => {
    setModalState({
      isOpen: true,
      icon,
      title,
      message,
      isConfirm: false,
      onConfirm: null,
      onCloseCallback,
    });
  }, []);

  const showConfirm = useCallback((icon, title, message, onConfirmCallback) => {
    setModalState({
      isOpen: true,
      icon,
      title,
      message,
      isConfirm: true,
      onConfirm: onConfirmCallback,
      onCloseCallback: null,
    });
  }, []);

  const fetchDetailData = useCallback(async () => {
    setIsLoading(true);
    try {
      const postRes = await get(`/v1/bulletin-boards/${boardId}`);
      if (postRes?.data?.isSuccess) {
        setPostData(postRes.data.data);
      }

      const commentsRes = await get(`/v1/bulletin-boards/${boardId}/comments`);
      if (commentsRes?.data?.isSuccess) {
        const rawContent =
          commentsRes.data.data?.content ||
          (Array.isArray(commentsRes.data.data) ? commentsRes.data.data : []);

        const rootComments = rawContent.filter((c) => !c.parentId);
        setComments(formatComments(rootComments));
      }
    } catch (err) {
      console.error('데이터 로드 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (boardId) fetchDetailData();
  }, [boardId, fetchDetailData]);

  const handleRecommend = async () => {
    if (!isLoggedIn) return setShowLoginAlert(true);
    try {
      const res = await post(`/v1/bulletin-boards/${boardId}/recommends`);
      if (res?.data?.isSuccess) fetchDetailData();
    } catch (err) {
      console.error('추천 오류:', err);
      showAlert('🚨', '오류', '추천 처리에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async (parentId = null) => {
    if (!isLoggedIn) return setShowLoginAlert(true);
    const contentToSubmit = parentId ? replyContent : newComment;
    if (!contentToSubmit.trim()) return;

    try {
      const payload = {
        content: contentToSubmit,
        loginId: currentUser.loginId,
      };
      if (parentId) payload.parentId = parentId;

      const res = await post(`/v1/bulletin-boards/${boardId}/comments`, payload);
      if (res?.data?.isSuccess) {
        if (parentId) {
          setReplyContent('');
          setReplyingToId(null);
        } else {
          setNewComment('');
        }
        fetchDetailData();
      }
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      showAlert('🚨', '오류', '댓글 등록에 실패했습니다.');
    }
  };

  const handleEditCommentSubmit = async (commentId) => {
    if (!editCommentContent.trim()) return;
    try {
      const res = await patch(`/v1/bulletin-boards/${boardId}/comments/${commentId}`, {
        content: editCommentContent,
        loginId: currentUser.loginId,
      });
      if (res?.data?.isSuccess) {
        setEditingCommentId(null);
        fetchDetailData();
      }
    } catch (err) {
      console.error('댓글 수정 오류:', err);
      showAlert('🚨', '오류', '댓글 수정 실패');
    }
  };

  const handleDeletePost = () => {
    showConfirm('🗑️', '게시글 삭제', '정말로 삭제하시겠습니까?', async () => {
      setModalState((prev) => ({ ...prev, isOpen: false }));
      try {
        const endpoint = isAdmin
          ? `/admin/v1/bulletin-boards/${boardId}`
          : `/v1/bulletin-boards/${boardId}`;
        const res = await del(endpoint);
        if (res?.data?.isSuccess) showAlert('✅', '삭제 완료', '게시글이 삭제되었습니다.', onBack);
      } catch (err) {
        console.error('게시글 삭제 오류:', err);
        showAlert('🚨', '오류', '삭제 권한이 없거나 실패했습니다.');
      }
    });
  };

  const handleDeleteComment = (commentId) => {
    setActiveCommentMenuId(null);
    showConfirm('🗑️', '댓글 삭제', '댓글을 삭제하시겠습니까?', async () => {
      setModalState((prev) => ({ ...prev, isOpen: false }));
      try {
        const endpoint = isAdmin
          ? `/admin/v1/bulletin-boards/${boardId}/comments/${commentId}`
          : `/v1/bulletin-boards/${boardId}/comments/${commentId}`;
        const res = await del(endpoint);
        if (res?.data?.isSuccess) {
          showAlert('✅', '완료', '삭제되었습니다.');
          fetchDetailData();
        }
      } catch (err) {
        console.error('댓글 삭제 오류:', err);
        showAlert('🚨', '오류', '댓글 삭제 실패');
      }
    });
  };

  // 💡 [수정] 댓글 신고 시 댓글 작성자의 loginId를 함께 받습니다.
  const handleReportComment = (commentId, targetLoginId) => {
    if (!isLoggedIn) return setShowLoginAlert(true);
    setActiveCommentMenuId(null);
    setPromptModal({
      isOpen: true,
      title: '댓글 신고',
      targetType: 'COMMENT',
      targetId: commentId,
      targetLoginId: targetLoginId || '',
      reason: '',
    });
  };

  const handlePromptSubmit = async () => {
    if (!promptModal.reason.trim()) return showAlert('🚨', '입력 오류', '사유를 입력하세요.');
    try {
      // 💡 [수정] API 스펙에 맞춰 targetLoginId를 전송 데이터에 포함합니다.
      const res = await post(`/v1/bulletin-board/reports`, {
        type: promptModal.targetType,
        targetId: promptModal.targetId,
        targetLoginId: promptModal.targetLoginId,
        reason: promptModal.reason.trim(),
      });
      if (res?.data?.isSuccess) {
        showAlert('🚨', '접수', '신고되었습니다.');
        setPromptModal((prev) => ({ ...prev, isOpen: false, reason: '' }));
      }
    } catch (err) {
      console.error('신고 오류:', err);
      showAlert('🚨', '오류', '신고 실패');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime()) || d.getFullYear() === 1970) return '';
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (isLoading)
    return (
      <div style={{ padding: vw(40), textAlign: 'center', fontSize: vw(18), fontWeight: 'bold' }}>
        데이터 로딩 중...
      </div>
    );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          border: 'none',
          backgroundColor: '#F0F0F0',
          padding: `${vw(8)} ${vw(16)}`,
          borderRadius: vw(5),
          cursor: 'pointer',
          fontSize: vw(14),
          marginBottom: vw(20),
          fontWeight: '600',
        }}
      >
        ← 목록으로 돌아가기
      </button>

      <PostDetail
        postData={postData}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onRecommend={handleRecommend}
        onEdit={() => onEditPost(postData)}
        onDelete={handleDeletePost}
        onReport={() => {
          if (!isLoggedIn) return setShowLoginAlert(true);
          // 💡 [수정] 게시글 신고 시 작성자의 loginId를 함께 셋팅
          setPromptModal({
            isOpen: true,
            title: '게시글 신고',
            targetType: 'POST',
            targetId: boardId,
            targetLoginId: postData?.loginId || '',
            reason: '',
          });
          return null;
        }}
        formatDate={formatDate}
      />

      <CommentSection
        comments={comments}
        postData={postData}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        formatDate={formatDate}
        newComment={newComment}
        setNewComment={setNewComment}
        onCommentSubmit={handleCommentSubmit}
        commentStates={{
          activeMenuId: activeCommentMenuId,
          editingId: editingCommentId,
          replyingId: replyingToId,
          editContent: editCommentContent,
          replyContent,
        }}
        commentActions={{
          setActiveMenuId: setActiveCommentMenuId,
          setEditingId: setEditingCommentId,
          setReplyingId: setReplyingToId,
          setEditContent: setEditCommentContent,
          setReplyContent,
        }}
        apiActions={{
          onReplySubmit: handleCommentSubmit,
          onEditSubmit: handleEditCommentSubmit,
          onDelete: handleDeleteComment,
          onReport: handleReportComment,
          onAuthError: () => setShowLoginAlert(true),
        }}
      />

      <ReportPromptModal
        modalData={promptModal}
        setModalData={setPromptModal}
        onSubmit={handlePromptSubmit}
      />

      <CustomAlertModal
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        icon="🔒"
        title="로그인 필요"
        description="로그인이 필요한 서비스입니다."
        leftBtnText="닫기"
        rightBtnText="로그인"
        onRightBtnClick={() => {
          setShowLoginAlert(false);
          navigate('/login');
        }}
      />

      <CustomAlertModal
        isOpen={modalState.isOpen}
        onClose={() => {
          setModalState((p) => ({ ...p, isOpen: false }));
          modalState.onCloseCallback?.();
        }}
        icon={modalState.icon}
        title={modalState.title}
        description={modalState.message}
        leftBtnText={modalState.isConfirm ? '취소' : '확인'}
        rightBtnText={modalState.isConfirm ? '확인' : undefined}
        onRightBtnClick={
          modalState.isConfirm
            ? () => {
                setModalState((p) => ({ ...p, isOpen: false }));
                modalState.onConfirm?.();
              }
            : undefined
        }
      />
    </div>
  );
}

DetailView.propTypes = {
  boardId: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired,
  onEditPost: PropTypes.func,
  currentUser: PropTypes.object,
};

export default DetailView;
