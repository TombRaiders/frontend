import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Admin/Sidebar';
import AdminTable from '../../components/Admin/AdminTable';
import NoticeForm from '../../components/Admin/NoticeForm';
import PinpointForm from '../../components/Admin/PinpointForm';
import MainImageForm from '../../components/Admin/MainImageForm';
import { vw } from '../../utils/style';
import { del, get, patch, post, put } from '../../api/apiClient';
import { getUserRoleFromToken } from '../../utils/authUtils';

const createEmptyNoticeForm = () => ({
  boardId: null,
  title: '',
  content: '',
  images: [],
  retainedImages: [],
});

const createEmptyPinpointBoardIds = () => [''];

const createEmptyMainImageForm = () => ({
  imageId: null,
  altText: '',
  displayOrder: '',
  image: null,
});

const ADMIN_VIEW_MODES = ['list', 'edit', 'notice', 'pinpoint', 'image'];
const ADMIN_ONLY_VIEW_MODES = ['list', 'edit'];
const BULLETINBOARD_ADMIN_DEFAULT_VIEW_MODE = 'notice';

const NOTICE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const NOTICE_IMAGE_MAX_COUNT = 10;
const NOTICE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const MAIN_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAIN_IMAGE_MAX_SIZE = 20 * 1024 * 1024;
const PINPOINT_MAX_COUNT = 8;

const getPinpointBoardIdsFromMainBoards = (boards) => {
  const boardIds = boards
    .map((board) => board.boardId)
    .filter((boardId) => Number.isInteger(boardId) && boardId > 0)
    .slice(0, PINPOINT_MAX_COUNT)
    .map(String);

  return boardIds.length > 0 ? boardIds : createEmptyPinpointBoardIds();
};

const getNoticeErrorMessage = (error) =>
  error?.response?.data?.errorDetail?.message ||
  error?.response?.data?.message ||
  '공지 등록 중 오류가 발생했습니다.';

const getPinpointErrorMessage = (error) => {
  if (error?.response?.status === 405) {
    return '현재 연결된 백엔드에 pinpoint API가 아직 반영되지 않았습니다. 백엔드 최신 버전을 실행하거나 배포 상태를 확인해 주세요.';
  }

  return (
    error?.response?.data?.errorDetail?.message ||
    error?.response?.data?.message ||
    'pinpoint 저장 중 오류가 발생했습니다.'
  );
};

const getMainImageErrorMessage = (error) =>
  error?.response?.data?.errorDetail?.message ||
  error?.response?.data?.message ||
  '메인 이미지 등록 중 오류가 발생했습니다.';

const getAdminViewMode = (view) => (ADMIN_VIEW_MODES.includes(view) ? view : 'list');

const getAccessibleAdminViewMode = (view, canManageAdmins) => {
  const nextView = getAdminViewMode(view);
  if (!canManageAdmins && ADMIN_ONLY_VIEW_MODES.includes(nextView)) {
    return BULLETINBOARD_ADMIN_DEFAULT_VIEW_MODE;
  }

  return nextView;
};

function AdminPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userRole = getUserRoleFromToken();
  const canManageAdmins = userRole === 'ADMIN';
  const [viewMode, setViewMode] = useState(() =>
    getAccessibleAdminViewMode(searchParams.get('view'), canManageAdmins),
  );
  const [admins, setAdmins] = useState([]);

  // 💡 관리자 추가 모달창 상태 관리
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [noticeForm, setNoticeForm] = useState(createEmptyNoticeForm);
  const [isNoticeSubmitting, setIsNoticeSubmitting] = useState(false);
  const [notices, setNotices] = useState([]);
  const [isNoticesLoading, setIsNoticesLoading] = useState(false);
  const [noticesError, setNoticesError] = useState('');
  const [deletingNoticeId, setDeletingNoticeId] = useState(null);
  const [pinpointBoardIds, setPinpointBoardIds] = useState(createEmptyPinpointBoardIds);
  const [mainImageForm, setMainImageForm] = useState(createEmptyMainImageForm);
  const [isMainImageSubmitting, setIsMainImageSubmitting] = useState(false);
  const [mainImages, setMainImages] = useState([]);
  const [isMainImagesLoading, setIsMainImagesLoading] = useState(false);
  const [mainImagesError, setMainImagesError] = useState('');
  const [deletingMainImageId, setDeletingMainImageId] = useState(null);
  const [mainBoards, setMainBoards] = useState([]);
  const [isMainBoardsLoading, setIsMainBoardsLoading] = useState(false);
  const [mainBoardsError, setMainBoardsError] = useState('');
  const [isPinpointSubmitting, setIsPinpointSubmitting] = useState(false);

  const setAdminView = useCallback(
    (nextViewMode) => {
      const nextView = getAccessibleAdminViewMode(nextViewMode, canManageAdmins);
      setViewMode(nextView);
      if (nextView === 'list') {
        setSearchParams({});
      } else {
        setSearchParams({ view: nextView });
      }
    },
    [canManageAdmins, setSearchParams],
  );

  // --- 1. 데이터 로드 (GET) ---
  const fetchData = useCallback(async () => {
    if (!canManageAdmins) {
      setAdmins([]);
      return;
    }

    try {
      const adminsRes = await get('/admin/v1/admins');

      if (adminsRes?.data?.isSuccess) {
        const rawAdmins = adminsRes.data.data.content || [];
        const adminData = rawAdmins.map((admin) => ({
          id: admin.memberId || admin.id,
          nickname: admin.nickname,
          role: admin.role,
          status: admin.status === 'ACTIVE' ? '활성' : '비활성',
          permissions: {
            request: admin.role === 'ADMIN' || admin.role === 'SUPER_ADMIN',
            business: admin.role === 'ADMIN' || admin.role === 'SUPER_ADMIN',
            finance: admin.role === 'ADMIN' || admin.role === 'SUPER_ADMIN',
            delivery: admin.role === 'ADMIN' || admin.role === 'SUPER_ADMIN',
          },
        }));
        setAdmins(adminData);
      }
    } catch (error) {
      console.error('어드민 데이터 로드 실패:', error);
    }
  }, [canManageAdmins]);

  const fetchNotices = useCallback(async () => {
    setIsNoticesLoading(true);
    setNoticesError('');
    try {
      const params = new URLSearchParams({
        type: 'ADMIN_BOARD',
        page: '0',
        size: '20',
        sort: 'createdAt,desc',
      });
      const response = await get(`/v1/bulletin-boards?${params.toString()}`);
      if (response?.data?.isSuccess) {
        const pageData = response.data.data || {};
        setNotices(Array.isArray(pageData.content) ? pageData.content : []);
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      setNotices([]);
      setNoticesError(getNoticeErrorMessage(error));
    } finally {
      setIsNoticesLoading(false);
    }
  }, []);

  const fetchMainBoards = useCallback(async () => {
    setIsMainBoardsLoading(true);
    setMainBoardsError('');
    try {
      const response = await get('/v1/main/bulletin-boards');
      if (response?.data?.isSuccess && Array.isArray(response.data.data)) {
        const boards = response.data.data;
        setMainBoards(boards);
        return boards;
      }

      setMainBoards([]);
      return [];
    } catch (error) {
      console.error('메인 게시글 조회 실패:', error);
      setMainBoards([]);
      setMainBoardsError('메인 노출 목록을 불러오지 못했습니다.');
      return [];
    } finally {
      setIsMainBoardsLoading(false);
    }
  }, []);

  const fetchMainImages = useCallback(async () => {
    setIsMainImagesLoading(true);
    setMainImagesError('');
    try {
      const response = await get('/admin/v1/main/rail-images');
      if (response?.data?.isSuccess && Array.isArray(response.data.data)) {
        setMainImages(response.data.data);
      } else {
        setMainImages([]);
      }
    } catch (error) {
      console.error('레일 이미지 조회 실패:', error);
      setMainImages([]);
      setMainImagesError(getMainImageErrorMessage(error));
    } finally {
      setIsMainImagesLoading(false);
    }
  }, []);

  const handleRefreshPinpointBoards = useCallback(async () => {
    const boards = await fetchMainBoards();
    setPinpointBoardIds(getPinpointBoardIdsFromMainBoards(boards));
  }, [fetchMainBoards]);

  useEffect(() => {
    const nextViewMode = getAccessibleAdminViewMode(searchParams.get('view'), canManageAdmins);
    if (nextViewMode !== viewMode) {
      setViewMode(nextViewMode);
    }
  }, [canManageAdmins, searchParams, viewMode]);

  useEffect(() => {
    if (viewMode === 'list' || viewMode === 'edit') {
      fetchData();
    }
  }, [fetchData, viewMode]);

  useEffect(() => {
    if (viewMode === 'notice') {
      fetchNotices();
    }
  }, [fetchNotices, viewMode]);

  useEffect(() => {
    if (viewMode === 'pinpoint') {
      handleRefreshPinpointBoards();
    }
  }, [handleRefreshPinpointBoards, viewMode]);

  useEffect(() => {
    if (viewMode === 'image') {
      fetchMainImages();
    }
  }, [fetchMainImages, viewMode]);

  // --- 2. 권한 변경 토글 ---
  const handlePermissionChange = useCallback((id, key) => {
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) => {
        if (admin.id === id) {
          return {
            ...admin,
            permissions: { ...admin.permissions, [key]: !admin.permissions[key] },
          };
        }
        return admin;
      }),
    );
  }, []);

  // --- 3. 수정된 권한 서버로 전송 (PATCH) ---
  const handleSavePermissions = async () => {
    if (!globalThis.confirm('수정된 관리자 권한을 저장하시겠습니까?')) return;

    try {
      for (const admin of admins) {
        await patch(`/admin/v1/members/${admin.id}/role?newRole=ADMIN`);
      }

      globalThis.alert('권한이 성공적으로 수정되었습니다.');
      setAdminView('list');
    } catch (error) {
      console.error('권한 저장 실패:', error);
      globalThis.alert('권한 저장 중 오류가 발생했습니다.');
    }
  };

  const handleReload = () => {
    fetchData();
  };

  // --- 4. 관리자 추가 버튼 액션 (UI 전용) ---
  const handleAddAdmin = () => {
    if (!newMemberId.trim()) {
      globalThis.alert('멤버 아이디를 입력해 주세요.');
      return;
    }
    globalThis.alert(
      `입력하신 멤버 아이디 [${newMemberId}]를 관리자로 추가하는 API를 호출할 예정입니다!`,
    );
    setShowAddModal(false);
    setNewMemberId(''); // 입력창 초기화
  };

  const handleOpenNoticeForm = () => {
    setAdminView('notice');
    setNoticeForm(createEmptyNoticeForm());
  };

  const handleOpenPinpointForm = () => {
    setAdminView('pinpoint');
    setPinpointBoardIds(createEmptyPinpointBoardIds());
  };

  const handleOpenMainImageForm = () => {
    setAdminView('image');
    setMainImageForm(createEmptyMainImageForm());
  };

  const handleCancelNoticeForm = () => {
    setAdminView('list');
    setNoticeForm(createEmptyNoticeForm());
  };

  const handleCancelPinpointForm = () => {
    setAdminView('list');
    setPinpointBoardIds(createEmptyPinpointBoardIds());
  };

  const handleCancelMainImageForm = () => {
    if (
      mainImageForm.imageId ||
      mainImageForm.altText ||
      mainImageForm.displayOrder ||
      mainImageForm.image
    ) {
      setMainImageForm(createEmptyMainImageForm());
      return;
    }

    setAdminView('list');
    setMainImageForm(createEmptyMainImageForm());
  };

  const handleAddPinpointBoardId = (boardId) => {
    const nextBoardId = String(boardId);
    setPinpointBoardIds((prev) => {
      if (prev.includes(nextBoardId) || prev.length >= PINPOINT_MAX_COUNT) return prev;
      if (prev.length === 1 && prev[0] === '') return [nextBoardId];
      return [...prev, nextBoardId];
    });
  };

  const handleEditNotice = (notice) => {
    setNoticeForm({
      boardId: notice.boardId,
      title: notice.title || '',
      content: notice.content || '',
      images: [],
      retainedImages: Array.isArray(notice.images) ? notice.images : [],
    });
  };

  const handleDeleteNotice = async (boardId) => {
    if (deletingNoticeId) return;
    if (!globalThis.confirm(`공지사항 #${boardId}를 삭제하시겠습니까?`)) return;

    setDeletingNoticeId(boardId);
    try {
      const response = await del(`/admin/v1/bulletin-boards/${boardId}`);
      if (response?.data?.isSuccess) {
        globalThis.alert('공지사항이 삭제되었습니다.');
        if (noticeForm.boardId === boardId) {
          setNoticeForm(createEmptyNoticeForm());
        }
        fetchNotices();
      }
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      globalThis.alert(getNoticeErrorMessage(error));
    } finally {
      setDeletingNoticeId(null);
    }
  };

  const handleSubmitNotice = async () => {
    if (isNoticeSubmitting) return;

    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      globalThis.alert('공지 제목과 내용을 모두 입력해 주세요.');
      return;
    }

    if (noticeForm.title.trim().length > 512) {
      globalThis.alert('공지 제목은 최대 512자까지 입력할 수 있습니다.');
      return;
    }

    if (noticeForm.content.trim().length > 4096) {
      globalThis.alert('공지 내용은 최대 4096자까지 입력할 수 있습니다.');
      return;
    }

    if (noticeForm.retainedImages.length + noticeForm.images.length > NOTICE_IMAGE_MAX_COUNT) {
      globalThis.alert(`이미지는 최대 ${NOTICE_IMAGE_MAX_COUNT}개까지 첨부할 수 있습니다.`);
      return;
    }

    const invalidImage = noticeForm.images.find(
      (image) =>
        image.size > NOTICE_IMAGE_MAX_SIZE || !NOTICE_IMAGE_MIME_TYPES.includes(image.type),
    );
    if (invalidImage) {
      globalThis.alert('이미지는 jpg, jpeg, png, webp, gif 형식이고 파일당 5MB 이하여야 합니다.');
      return;
    }

    setIsNoticeSubmitting(true);
    try {
      const formData = new FormData();
      const requestDto = {
        title: noticeForm.title.trim(),
        content: noticeForm.content.trim(),
        assetId: null,
        type: 'ADMIN_BOARD',
        commissionId: null,
        retainedImageIds: noticeForm.boardId
          ? noticeForm.retainedImages.map((image) => image.imageId)
          : null,
      };

      formData.append(
        'request',
        new Blob([JSON.stringify(requestDto)], { type: 'application/json' }),
      );

      noticeForm.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = noticeForm.boardId
        ? await put(`/v1/bulletin-boards/${noticeForm.boardId}`, formData)
        : await post('/admin/v1/bulletin-boards', formData);

      if (response?.data?.isSuccess) {
        const boardId = response.data.data;
        let successMessage = '공지사항이 등록되었습니다.';
        if (noticeForm.boardId) {
          successMessage = '공지사항이 수정되었습니다.';
        } else if (boardId) {
          successMessage = `공지사항이 등록되었습니다. (ID: ${boardId})`;
        }

        globalThis.alert(successMessage);
        setNoticeForm(createEmptyNoticeForm());
        fetchNotices();
      }
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      globalThis.alert(getNoticeErrorMessage(error));
    } finally {
      setIsNoticeSubmitting(false);
    }
  };

  const handleSubmitPinpoint = async () => {
    if (isPinpointSubmitting) return;

    const trimmedBoardIds = pinpointBoardIds.map((boardId) => boardId.trim());
    if (trimmedBoardIds.length === 0) {
      globalThis.alert('게시글 ID를 하나 이상 입력해 주세요.');
      return;
    }

    if (trimmedBoardIds.some((boardId) => !boardId)) {
      globalThis.alert('게시글 ID를 모두 입력해 주세요.');
      return;
    }

    const boardIds = trimmedBoardIds.map(Number);
    if (boardIds.some((boardId) => !Number.isInteger(boardId) || boardId <= 0)) {
      globalThis.alert('게시글 ID는 양수만 입력할 수 있습니다.');
      return;
    }

    if (new Set(boardIds).size !== boardIds.length) {
      globalThis.alert('중복된 게시글 ID는 등록할 수 없습니다.');
      return;
    }

    if (boardIds.length > PINPOINT_MAX_COUNT) {
      globalThis.alert(`pinpoint는 최대 ${PINPOINT_MAX_COUNT}개까지 등록할 수 있습니다.`);
      return;
    }

    setIsPinpointSubmitting(true);
    try {
      const response = await put('/admin/v1/main/bulletin-boards/pinpoints', { boardIds });

      if (response?.data?.isSuccess) {
        globalThis.alert('pinpoint가 저장되었습니다.');
        fetchMainBoards();
        handleCancelPinpointForm();
      }
    } catch (error) {
      console.error('pinpoint 저장 실패:', error);
      globalThis.alert(getPinpointErrorMessage(error));
    } finally {
      setIsPinpointSubmitting(false);
    }
  };

  const handleEditMainImage = (image) => {
    setMainImageForm({
      imageId: image.imageId,
      altText: image.altText || '',
      displayOrder: String(image.displayOrder || ''),
      image: null,
    });
  };

  const handleDeleteMainImage = async (imageId) => {
    if (deletingMainImageId) return;
    if (!globalThis.confirm(`레일 이미지 #${imageId}를 삭제하시겠습니까?`)) return;

    setDeletingMainImageId(imageId);
    try {
      const response = await del(`/admin/v1/main/rail-images/${imageId}`);
      if (response?.data?.isSuccess) {
        globalThis.alert('레일 이미지가 삭제되었습니다.');
        if (mainImageForm.imageId === imageId) {
          setMainImageForm(createEmptyMainImageForm());
        }
        fetchMainImages();
      }
    } catch (error) {
      console.error('레일 이미지 삭제 실패:', error);
      globalThis.alert(getMainImageErrorMessage(error));
    } finally {
      setDeletingMainImageId(null);
    }
  };

  const handleSubmitMainImage = async () => {
    if (isMainImageSubmitting) return;

    const displayOrder = Number(mainImageForm.displayOrder);
    if (!Number.isInteger(displayOrder) || displayOrder <= 0) {
      globalThis.alert('노출 순서는 1 이상의 정수로 입력해 주세요.');
      return;
    }

    if (!mainImageForm.imageId && !mainImageForm.image) {
      globalThis.alert('등록할 이미지를 선택해 주세요.');
      return;
    }

    if (
      mainImageForm.image &&
      (mainImageForm.image.size > MAIN_IMAGE_MAX_SIZE ||
        !MAIN_IMAGE_MIME_TYPES.includes(mainImageForm.image.type))
    ) {
      globalThis.alert('이미지는 jpg, jpeg, png, webp 형식이며 파일당 20MB 이하여야 합니다.');
      return;
    }

    setIsMainImageSubmitting(true);
    try {
      const formData = new FormData();
      if (mainImageForm.image) {
        formData.append('image', mainImageForm.image);
      }
      formData.append('altText', mainImageForm.altText.trim());
      formData.append('displayOrder', String(displayOrder));

      const response = mainImageForm.imageId
        ? await patch(`/admin/v1/main/rail-images/${mainImageForm.imageId}`, formData)
        : await post('/admin/v1/main/rail-images', formData);

      if (response?.data?.isSuccess) {
        globalThis.alert(
          mainImageForm.imageId ? '레일 이미지가 수정되었습니다.' : '레일 이미지가 등록되었습니다.',
        );
        setMainImageForm(createEmptyMainImageForm());
        fetchMainImages();
      }
    } catch (error) {
      console.error('레일 이미지 저장 실패:', error);
      globalThis.alert(getMainImageErrorMessage(error));
    } finally {
      setIsMainImageSubmitting(false);
    }
  };

  let pageTitle = '관리자 권한 수정';
  if (viewMode === 'notice') {
    pageTitle = '공지사항 관리';
  } else if (viewMode === 'pinpoint') {
    pageTitle = 'pinpoint 등록';
  } else if (viewMode === 'image') {
    pageTitle = '레일 이미지 관리';
  } else if (viewMode === 'list') {
    pageTitle = '관리자 목록';
  }

  let mainContent;
  if (viewMode === 'notice') {
    mainContent = (
      <NoticeForm
        noticeForm={noticeForm}
        setNoticeForm={setNoticeForm}
        notices={notices}
        isLoading={isNoticesLoading}
        errorMessage={noticesError}
        onRefresh={fetchNotices}
        onEdit={handleEditNotice}
        onDelete={handleDeleteNotice}
        deletingNoticeId={deletingNoticeId}
        onSubmit={handleSubmitNotice}
        onCancel={handleCancelNoticeForm}
        isSubmitting={isNoticeSubmitting}
      />
    );
  } else if (viewMode === 'pinpoint') {
    mainContent = (
      <PinpointForm
        boardIds={pinpointBoardIds}
        setBoardIds={setPinpointBoardIds}
        mainBoards={mainBoards}
        isMainBoardsLoading={isMainBoardsLoading}
        mainBoardsError={mainBoardsError}
        onRefreshMainBoards={handleRefreshPinpointBoards}
        onAddBoardId={handleAddPinpointBoardId}
        onSubmit={handleSubmitPinpoint}
        onCancel={handleCancelPinpointForm}
        isSubmitting={isPinpointSubmitting}
      />
    );
  } else if (viewMode === 'image') {
    mainContent = (
      <MainImageForm
        mainImageForm={mainImageForm}
        setMainImageForm={setMainImageForm}
        railImages={mainImages}
        isLoading={isMainImagesLoading}
        errorMessage={mainImagesError}
        onRefresh={fetchMainImages}
        onEdit={handleEditMainImage}
        onDelete={handleDeleteMainImage}
        deletingImageId={deletingMainImageId}
        onSubmit={handleSubmitMainImage}
        onCancel={handleCancelMainImageForm}
        isSubmitting={isMainImageSubmitting}
      />
    );
  } else {
    mainContent = (
      <section
        className="w-full bg-white border border-[#EEE] shadow-sm mb-[3vw]"
        style={{ borderRadius: vw(10), padding: vw(24) }}
      >
        <div className="flex justify-between items-center mb-[1.5vw]">
          <div className="flex items-center gap-[1vw]">
            <select
              className="border border-[#DDD] bg-white outline-none cursor-pointer"
              style={{ fontSize: vw(14), padding: vw(6), borderRadius: vw(4) }}
            >
              <option>모든 관리자</option>
            </select>
            <span className="text-[#666]" style={{ fontSize: vw(13) }}>
              관리자 : {admins.length}명
            </span>
          </div>

          <div className="flex gap-[1vw] items-center">
            {/* 💡 요청하신 대로 글씨는 text-white 유지, 배경만 bg-[#ffffff] 적용 */}
            {viewMode === 'list' && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="bg-[#ffffff] text-white font-bold hover:bg-gray-100 transition-all cursor-pointer border-none shadow-sm"
                style={{
                  fontSize: vw(14),
                  padding: `${vw(8)} ${vw(16)}`,
                  borderRadius: vw(4),
                }}
              >
                + 관리자 추가
              </button>
            )}

            {viewMode === 'list' && (
              <button
                type="button"
                onClick={() => setAdminView('edit')}
                className="bg-[#2C9753] text-white font-bold hover:bg-[#257F46] transition-all cursor-pointer border-none shadow-sm"
                style={{
                  fontSize: vw(14),
                  padding: `${vw(8)} ${vw(16)}`,
                  borderRadius: vw(4),
                }}
              >
                선택된 관리자 권한 수정
              </button>
            )}
            <button
              type="button"
              className="text-[#999] flex items-center gap-1 hover:text-[#2C9753] cursor-pointer bg-transparent border-none outline-none transition-colors"
              style={{ fontSize: vw(13) }}
              onClick={handleReload}
            >
              새로고침 <span style={{ fontSize: vw(16) }}>🔄</span>
            </button>
          </div>
        </div>

        <AdminTable
          viewMode={viewMode}
          admins={admins}
          onPermissionChange={handlePermissionChange}
        />

        {viewMode === 'edit' && (
          <div className="flex justify-center gap-[1.5vw]" style={{ marginTop: vw(40) }}>
            <button
              type="button"
              onClick={handleSavePermissions}
              className="bg-[#2C9753] text-white font-bold cursor-pointer border-none shadow-md hover:bg-[#257F46] transition-colors"
              style={{
                fontSize: vw(16),
                padding: `${vw(12)} ${vw(60)}`,
                borderRadius: vw(4),
              }}
            >
              수정된 권한 저장하기
            </button>
            {/* 💡 배경만 #ffffff, 글씨는 text-white 그대로 */}
            <button
              type="button"
              onClick={() => {
                setAdminView('list');
              }}
              className="bg-[#ffffff] text-white font-bold cursor-pointer border-none shadow-md hover:bg-gray-100 transition-colors"
              style={{
                fontSize: vw(16),
                padding: `${vw(12)} ${vw(60)}`,
                borderRadius: vw(4),
              }}
            >
              취소
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9F9F9] font-sans overflow-x-hidden relative">
      <Sidebar
        onNoticeClick={handleOpenNoticeForm}
        onPinpointClick={handleOpenPinpointForm}
        onImageClick={handleOpenMainImageForm}
      />
      <main className="flex-1 overflow-y-auto" style={{ padding: vw(40) }}>
        <div className="w-full max-w-[1300px] flex flex-col items-start ml-0">
          <h1
            className="font-bold text-[#1A1A1A] text-left"
            style={{ fontSize: vw(20), marginBottom: vw(30) }}
          >
            {pageTitle}
          </h1>

          {mainContent}
        </div>
      </main>

      {/* 💡 관리자 추가 모달창 (UI) */}
      {showAddModal && (
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex justify-center items-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white flex flex-col shadow-2xl overflow-hidden"
            style={{ width: vw(400), borderRadius: vw(8), border: '1px solid #EEE' }}
          >
            {/* 헤더: 💡 배경만 #ffffff, 글씨는 text-white 유지 */}
            <div
              className="bg-[#ffffff] text-white flex justify-between items-center"
              style={{ padding: `${vw(15)} ${vw(25)}` }}
            >
              <h2 className="font-bold m-0" style={{ fontSize: vw(18) }}>
                신규 관리자 추가
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setNewMemberId('');
                }}
                className="text-white hover:text-gray-200 bg-transparent border-none cursor-pointer transition-colors"
                style={{ fontSize: vw(20) }}
              >
                ✕
              </button>
            </div>

            {/* 입력 영역 */}
            <div className="flex flex-col bg-white" style={{ padding: vw(30), gap: vw(15) }}>
              <label
                htmlFor="memberId"
                className="font-bold text-[#333]"
                style={{ fontSize: vw(14) }}
              >
                추가할 멤버 아이디 (Member ID)
              </label>
              <input
                id="memberId"
                type="text"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                placeholder="예: 123"
                className="border border-[#DDD] outline-none transition-colors focus:border-[#2C9753]"
                style={{ padding: vw(12), fontSize: vw(14), borderRadius: vw(4) }}
              />
              <p className="text-[#888]" style={{ fontSize: vw(12), marginTop: vw(-5) }}>
                * 멤버 아이디를 입력하여 권한을 승격시킵니다.
              </p>
            </div>

            {/* 버튼 영역 */}
            <div
              className="bg-[#F9F9F9] border-t border-[#EEE] flex justify-center items-center gap-3"
              style={{ padding: `${vw(15)} 0` }}
            >
              <button
                type="button"
                onClick={handleAddAdmin}
                className="bg-[#2C9753] text-white font-bold cursor-pointer transition-colors shadow-sm hover:bg-[#257F46] border-none"
                style={{ padding: `${vw(10)} ${vw(30)}`, fontSize: vw(14), borderRadius: vw(4) }}
              >
                추가하기
              </button>
              {/* 💡 취소 버튼: 배경만 #ffffff, 글씨는 text-white 유지 */}
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setNewMemberId('');
                }}
                className="bg-[#ffffff] text-white font-bold cursor-pointer transition-colors border-none shadow-sm hover:bg-gray-100"
                style={{ padding: `${vw(10)} ${vw(30)}`, fontSize: vw(14), borderRadius: vw(4) }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
