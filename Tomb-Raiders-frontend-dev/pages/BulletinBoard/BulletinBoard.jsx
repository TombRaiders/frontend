import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { vw } from '../../utils/style';
import { get, post, put } from '../../api/apiClient';

import OrangeHeader from '../../components/BulletinBoard/OrangeHeader';
import CommunitySidebar from '../../components/BulletinBoard/BulletinBoardSidebar';
import SearchBar from '../../components/BulletinBoard/SearchBar';
import PostCard from '../../components/BulletinBoard/PostCard';
import RightSideBar from '../../components/BulletinBoard/RightSideBar';
import WriteView from '../../components/BulletinBoard/WriteView';
import DetailView from '../../components/BulletinBoard/DetailView';
import CustomAlertModal from '../../components/Common/CustomAlertModal';

import { getLoginId, getUserRole, getToken } from '../../utils/authUtils.js';

const BOARD_TYPES = ['FREE_BOARD', 'BRAGGING_BOARD', 'ADMIN_BOARD'];
const DEFAULT_BOARD_TYPE = 'FREE_BOARD';
const PAGE_SIZE = 10;
const BOARD_TYPE_ALIASES = {
  FREE: 'FREE_BOARD',
  BRAGGING: 'BRAGGING_BOARD',
  NOTICE: 'ADMIN_BOARD',
  ADMIN: 'ADMIN_BOARD',
};

const getCurrentUser = () => ({
  loginId: getLoginId(),
  role: getUserRole(),
  nickname: Cookies.get('nickname') || getLoginId(),
});

const getBoardType = (type) =>
  BOARD_TYPE_ALIASES[type] || (BOARD_TYPES.includes(type) ? type : DEFAULT_BOARD_TYPE);

const getWriteBoardType = (type) =>
  type === 'BRAGGING_BOARD' ? 'BRAGGING_BOARD' : DEFAULT_BOARD_TYPE;

const createEmptyPost = (type = DEFAULT_BOARD_TYPE) => ({
  boardId: null,
  title: '',
  content: '',
  assetId: null,
  type: getWriteBoardType(type),
  commissionId: null,
  images: [],
});

const getPageNumber = (page) => {
  const parsedPage = Number(page);
  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
};

const getVisiblePages = (currentPage, totalPages) => {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

function BulletinBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlBoardId = searchParams.get('boardId');
  const urlView = searchParams.get('view');
  const selectedBoardType = getBoardType(searchParams.get('type'));
  const selectedPage = getPageNumber(searchParams.get('page'));

  let currentView = 'list';
  if (urlBoardId) {
    currentView = 'detail';
  } else if (urlView === 'write') {
    currentView = 'write';
  }

  const view = currentView;
  const selectedBoardId = urlBoardId ? Number(urlBoardId) : null;

  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPopularLoading, setIsPopularLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [newPost, setNewPost] = useState(() => createEmptyPost());

  const currentUser = getCurrentUser();

  const setListSearchParams = useCallback(
    (type = selectedBoardType, page = 1) => {
      const nextParams = { type };
      if (page > 1) nextParams.page = String(page);
      setSearchParams(nextParams);
    },
    [selectedBoardType, setSearchParams],
  );

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: selectedBoardType,
        page: String(selectedPage - 1),
        size: String(PAGE_SIZE),
        sort: 'createdAt,desc',
      });
      const response = await get(`/v1/bulletin-boards?${params.toString()}`);
      if (response?.data?.isSuccess) {
        const pageData = response.data.data || {};
        const pageMeta = pageData.page || pageData;
        const content = pageData.content || [];
        const totalPages = Math.max(pageMeta.totalPages || 1, 1);
        setPosts(content);
        setPageInfo({
          currentPage: (pageMeta.number ?? selectedPage - 1) + 1,
          totalPages,
          totalElements: pageMeta.totalElements || content.length,
          first: pageMeta.first ?? selectedPage <= 1,
          last: pageMeta.last ?? selectedPage >= totalPages,
        });
      }
    } catch (error) {
      console.error('목록 로드 실패:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBoardType, selectedPage]);

  const fetchPopularPosts = useCallback(async () => {
    setIsPopularLoading(true);
    try {
      const response = await get('/v1/bulletin-boards/popular');
      if (response?.data?.isSuccess) {
        setPopularPosts(response.data.data || []);
      } else {
        setPopularPosts([]);
      }
    } catch (error) {
      console.error('인기글 로드 실패:', error);
      setPopularPosts([]);
    } finally {
      setIsPopularLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.state?.boardId) {
      setSearchParams({ boardId: location.state.boardId, type: selectedBoardType });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, setSearchParams, location.pathname, selectedBoardType]);

  useEffect(() => {
    if (view === 'list') fetchPosts();
  }, [view, fetchPosts]);

  useEffect(() => {
    fetchPopularPosts();
  }, [fetchPopularPosts]);

  const handleCreateOrUpdatePost = async () => {
    if (isSubmitting) return;
    if (!newPost.title.trim() || !newPost.content.trim()) {
      globalThis.alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const requestDto = {
        title: newPost.title,
        content: newPost.content,
        type: getWriteBoardType(newPost.type),
      };

      if (newPost.assetId) requestDto.assetId = newPost.assetId;
      if (newPost.commissionId) requestDto.commissionId = newPost.commissionId;

      formData.append(
        'request',
        new Blob([JSON.stringify(requestDto)], { type: 'application/json' }),
      );

      if (newPost.images && newPost.images.length > 0) {
        newPost.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const isEdit = !!newPost.boardId;

      const response = isEdit
        ? await put(`/v1/bulletin-boards/${newPost.boardId}`, formData, config)
        : await post('/v1/bulletin-boards', formData, config);

      if (response?.data?.isSuccess) {
        globalThis.alert(`게시글이 ${isEdit ? '수정' : '등록'}되었습니다.`);
        const nextType = getWriteBoardType(newPost.type);
        setNewPost(createEmptyPost(nextType));
        if (isEdit) {
          setSearchParams({ boardId: String(newPost.boardId), type: nextType });
        } else {
          setListSearchParams(nextType, 1);
        }
      }
    } catch (error) {
      globalThis.alert(
        error?.response?.status === 409 ? '중복 요청입니다.' : '저장에 실패했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToList = () => {
    setNewPost(createEmptyPost(selectedBoardType));
    setListSearchParams(selectedBoardType, selectedPage);
  };

  const handleBoardTypeSelect = (type) => {
    setNewPost(createEmptyPost(type));
    setListSearchParams(type, 1);
  };

  const handleWriteClick = () => {
    if (!getToken()) return setShowLoginAlert(true);
    const writeType = getWriteBoardType(selectedBoardType);
    setNewPost(createEmptyPost(writeType));
    setSearchParams({ view: 'write', type: writeType });
    return null;
  };

  const handlePageChange = (page) => {
    const nextPage = Math.min(Math.max(page, 1), pageInfo.totalPages);
    setListSearchParams(selectedBoardType, nextPage);
  };

  const handlePopularPostClick = (post) => {
    const boardId = post.bulletinBoardId || post.boardId;
    if (!boardId) return;
    setSearchParams({
      boardId: String(boardId),
      type: selectedBoardType,
      page: String(selectedPage),
    });
  };

  return (
    <div
      data-testid="bulletinboard-page"
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
      }}
    >
      <OrangeHeader onLogoClick={handleBackToList} onProfileClick={() => {}} />
      <div
        data-testid="bulletinboard-scroll-area"
        style={{
          height: `calc(100vh - ${vw(60)})`,
          marginTop: vw(60),
          overflowY: 'auto',
          display: 'flex',
          paddingTop: vw(20),
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: vw(30),
          boxSizing: 'border-box',
        }}
      >
        <CommunitySidebar
          onWriteClick={handleWriteClick}
          selectedBoardType={selectedBoardType}
          onBoardTypeSelect={handleBoardTypeSelect}
        />
        <main style={{ width: vw(850), display: 'flex', flexDirection: 'column', gap: vw(20) }}>
          {view === 'list' && (
            <div
              style={{
                backgroundColor: 'white',
                padding: vw(40),
                borderRadius: vw(15),
                border: `${vw(1)} solid #E0E0E0`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                boxSizing: 'border-box',
              }}
            >
              <SearchBar />
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: vw(25), marginTop: vw(20) }}
              >
                {isLoading && <div>로딩 중...</div>}
                {!isLoading && posts.length === 0 && <div>게시글이 없습니다.</div>}
                {!isLoading &&
                  posts.map((p) => (
                    <PostCard
                      key={p.boardId}
                      post={p}
                      onClick={() =>
                        setSearchParams({
                          boardId: String(p.boardId),
                          type: selectedBoardType,
                          page: String(selectedPage),
                        })
                      }
                    />
                  ))}
              </div>

              {!isLoading && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: vw(8),
                    marginTop: vw(30),
                  }}
                >
                  <button
                    type="button"
                    disabled={pageInfo.first}
                    onClick={() => handlePageChange(pageInfo.currentPage - 1)}
                    style={{
                      padding: `${vw(8)} ${vw(12)}`,
                      border: '1px solid #D9D9D9',
                      backgroundColor: 'white',
                      borderRadius: vw(6),
                      cursor: pageInfo.first ? 'not-allowed' : 'pointer',
                    }}
                  >
                    이전
                  </button>
                  {getVisiblePages(pageInfo.currentPage, pageInfo.totalPages).map((page) => {
                    const isCurrent = page === pageInfo.currentPage;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        style={{
                          minWidth: vw(36),
                          height: vw(36),
                          border: '1px solid #D9D9D9',
                          backgroundColor: isCurrent ? '#2C9753' : 'white',
                          color: isCurrent ? 'white' : '#333',
                          borderRadius: vw(6),
                          cursor: 'pointer',
                          fontWeight: isCurrent ? '700' : '500',
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={pageInfo.last}
                    onClick={() => handlePageChange(pageInfo.currentPage + 1)}
                    style={{
                      padding: `${vw(8)} ${vw(12)}`,
                      border: '1px solid #D9D9D9',
                      backgroundColor: 'white',
                      borderRadius: vw(6),
                      cursor: pageInfo.last ? 'not-allowed' : 'pointer',
                    }}
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
          {view === 'write' && <WriteView newPost={newPost} setNewPost={setNewPost} />}

          {view === 'detail' && Boolean(selectedBoardId) && (
            <div
              style={{
                backgroundColor: 'white',
                padding: vw(40),
                borderRadius: vw(15),
                border: `${vw(1)} solid #E0E0E0`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                boxSizing: 'border-box',
              }}
            >
              <DetailView
                boardId={selectedBoardId}
                onBack={handleBackToList}
                onEditPost={(d) => {
                  setNewPost({ ...d, type: getWriteBoardType(selectedBoardType), images: [] });
                  setSearchParams({ view: 'write', type: selectedBoardType });
                }}
                currentUser={currentUser}
              />
            </div>
          )}
        </main>
        <RightSideBar
          view={view}
          onSubmit={handleCreateOrUpdatePost}
          isSubmitting={isSubmitting}
          popularPosts={popularPosts}
          isPopularLoading={isPopularLoading}
          onPopularPostClick={handlePopularPostClick}
        />
      </div>
      <CustomAlertModal
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        icon="!"
        title="로그인이 필요합니다"
        description="로그인 후 이용 가능합니다."
        leftBtnText="닫기"
        rightBtnText="로그인"
        onRightBtnClick={() => navigate('/login')}
      />
    </div>
  );
}

export default BulletinBoard;
