import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import TopNav from '../../components/Member/TopNav';
import ProfileSection from '../../components/Member/ProfileSection';
import ActivitySection from '../../components/Member/ActivitySection';
import SidebarSection from '../../components/Member/SidebarSection';
import Logo from '../../components/Logo/Logo';
// 💡 내 정보 조회를 위해 get 추가
import { get, del } from '../../api/apiClient';
import CustomAlertModal from '../../components/Common/CustomAlertModal';
import { extractCurrentUserProfile, saveCurrentUserProfile } from '../../utils/currentUserProfile';

// 사용자의 프로필 정보와 활동 내역(게시글, 댓글 등)을 관리하고 보여주는 마이페이지 컴포넌트
function MemberPage({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('게시글');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 삭제 모달과 결과 알림 모달을 제어할 상태들
  const [postToDelete, setPostToDelete] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  const goToEdit = () => {
    setIsMenuOpen(false);
    navigate('/member/edit');
  };

  /**
   * 💡 [NEW] 마이페이지 접속 시 내 최신 정보를 불러오는 함수
   */
  const fetchMyInfo = useCallback(async () => {
    try {
      const res = await get('/v1/member/me');
      if (res?.data?.isSuccess && res.data.data && setUser) {
        const myInfo = res.data.data;
        const currentProfile = extractCurrentUserProfile(myInfo);
        // App.js 등 최상단에서 내려주는 setUser를 통해 전역 유저 상태 최신화
        setUser((prev) => ({
          ...prev,
          ...myInfo,
          ...currentProfile,
        }));
        saveCurrentUserProfile(currentProfile);
      }
    } catch (error) {
      console.error('최신 유저 정보 로드 실패:', error);
    }
  }, [setUser]);

  /**
   * 💡 [Lint 해결] useCallback을 사용하여 함수 재사용 (exhaustive-deps 방지)
   * 서버로부터 사용자가 작성한 게시글과 댓글 목록을 불러오는 비동기 함수
   */
  const fetchMyActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const [postsRes, commentsRes] = await Promise.all([
        get('/v1/bulletin-boards/boards-info?size=10'),
        get('/v1/bulletin-boards/comments/comments-info?size=10'),
      ]);

      // 내가 쓴 게시글 데이터 상태 업데이트
      if (postsRes?.data?.isSuccess) {
        const postsData = postsRes.data.data;
        setPosts(postsData?.content || postsData || []);
      }

      // 내가 쓴 댓글 데이터 상태 업데이트
      if (commentsRes?.data?.isSuccess) {
        const commentsData = commentsRes.data.data;
        setComments(commentsData?.content || commentsData || []);
      }
    } catch (error) {
      console.error('활동 내역 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 💡 컴포넌트 마운트 시 최신 유저 정보와 활동 내역을 모두 불러옴
  useEffect(() => {
    fetchMyInfo();
    fetchMyActivities();
  }, [fetchMyInfo, fetchMyActivities]);

  const confirmDeletePost = (boardId) => setPostToDelete(boardId);
  const confirmDeleteComment = (boardId, commentId) => setCommentToDelete({ boardId, commentId });

  /**
   * 게시글 삭제 완료 후 fetchMyActivities()를 호출하여 목록을 리로드합니다.
   */
  const executeDeletePost = async () => {
    if (!postToDelete) return;
    try {
      const res = await del(`/v1/bulletin-boards/${postToDelete}`);
      if (res.data.isSuccess) {
        await fetchMyActivities();
        setAlertMessage('게시글이 삭제되었습니다.');
      } else {
        setAlertMessage('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      setAlertMessage('권한이 없거나 오류가 발생했습니다.');
    } finally {
      setPostToDelete(null);
    }
  };

  /**
   * 댓글 삭제 완료 후 fetchMyActivities()를 호출하여 목록을 리로드합니다.
   */
  const executeDeleteComment = async () => {
    if (!commentToDelete) return;
    const { boardId, commentId } = commentToDelete;
    try {
      const res = await del(`/v1/bulletin-boards/${boardId}/comments/${commentId}`);
      if (res.data.isSuccess) {
        await fetchMyActivities();
        setAlertMessage('댓글이 삭제되었습니다.');
      } else {
        setAlertMessage('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      setAlertMessage('권한이 없거나 오류가 발생했습니다.');
    } finally {
      setCommentToDelete(null);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#F7F7F7',
        position: 'relative',
        margin: '0 auto',
        overflowX: 'hidden',
      }}
    >
      <Logo vw={vw} style={{ position: 'absolute', left: vw(550), top: vw(-12), zIndex: 100 }} />
      <TopNav isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} onEditClick={goToEdit} />

      {/* 💡 최신화된 user 정보가 ProfileSection으로 내려갑니다 */}
      <ProfileSection user={user} onEditClick={goToEdit} />

      <div
        style={{ position: 'absolute', top: vw(348), left: vw(526), display: 'flex', gap: vw(14) }}
      >
        <ActivitySection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          posts={posts}
          comments={comments}
          isLoading={isLoading}
          onDeletePost={confirmDeletePost}
          onDeleteComment={confirmDeleteComment}
        />
        <SidebarSection
          onOrderListClick={() => navigate('/payments/history')}
          onCommissionListClick={() => navigate('/commissions')}
        />
      </div>

      <CustomAlertModal
        isOpen={postToDelete !== null}
        onClose={() => setPostToDelete(null)}
        icon="🗑️"
        title="게시글 삭제"
        description="정말로 이 게시글을 삭제하시겠습니까?"
        leftBtnText="취소"
        rightBtnText="삭제하기"
        onRightBtnClick={executeDeletePost}
      />

      <CustomAlertModal
        isOpen={commentToDelete !== null}
        onClose={() => setCommentToDelete(null)}
        icon="🗑️"
        title="댓글 삭제"
        description="정말로 이 댓글을 삭제하시겠습니까?"
        leftBtnText="취소"
        rightBtnText="삭제하기"
        onRightBtnClick={executeDeleteComment}
      />

      <CustomAlertModal
        isOpen={alertMessage !== ''}
        onClose={() => setAlertMessage('')}
        icon={alertMessage.includes('삭제되었습니다') ? '✅' : '🚨'}
        title="알림"
        description={alertMessage}
        leftBtnText="확인"
      />
    </div>
  );
}

MemberPage.propTypes = {
  user: PropTypes.shape({
    nickname: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
    introduce: PropTypes.string,
    profileImageUrl: PropTypes.string,
  }).isRequired,
  setUser: PropTypes.func, // 💡 프로필 최신화를 위해 setUser를 props로 받을 수 있게 추가
};

export default MemberPage;
