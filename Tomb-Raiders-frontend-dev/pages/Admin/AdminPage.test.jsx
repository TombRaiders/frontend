import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';
import { del, get, patch, post, put } from '../../api/apiClient';
import { getUserRoleFromToken } from '../../utils/authUtils';

/**
 * AdminPage 페이지 통합 테스트
 * 관리자 목록의 기본 렌더링, 신규 관리자 추가 모달의 개폐 동작,
 * 그리고 API 호출을 통해 데이터를 가져오는 로직을 검증함
 */

// 1. 외부 스타일 및 레이아웃 유틸리티 모킹
vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}vw`,
}));

// 2. API 클라이언트 모킹: 실제 백엔드 연동 대신 약속된 데이터 구조를 반환함
vi.mock('../../api/apiClient', () => ({
  get: vi.fn(),
  del: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('../../utils/authUtils', () => ({
  getUserRoleFromToken: vi.fn(() => 'ADMIN'),
}));

// 3. 네비게이션 사이드바 모킹: 페이지 내 레이아웃 구조 유지를 위함
vi.mock('../../components/Admin/Sidebar', () => ({
  default: ({ onNoticeClick, onPinpointClick, onImageClick }) => (
    <div data-testid="mock-sidebar">
      Sidebar
      <button type="button" onClick={onNoticeClick}>
        공지등록
      </button>
      <button type="button" onClick={onPinpointClick}>
        pinpoint 등록
      </button>
      <button type="button" onClick={onImageClick}>
        레일 이미지 관리
      </button>
    </div>
  ),
}));

// 4. 관리자 테이블 모킹: 테이블 렌더링 자체보다는 페이지 수준의 기능을 테스트하기 위해 단순화함
vi.mock('../../components/Admin/AdminTable', () => ({
  default: () => (
    <table>
      <thead>
        <tr>
          <th>관리자 번호</th>
          <th>관리자 닉네임</th>
        </tr>
      </thead>
    </table>
  ),
}));

const readBlobText = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

const renderAdminPage = (initialEntries = ['/admin']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <AdminPage />
    </MemoryRouter>,
  );

const successResponse = (data) => ({
  data: {
    isSuccess: true,
    data,
  },
});

const noticeFixture = {
  boardId: 7,
  title: '기존 공지',
  content: '기존 공지 내용',
  nickname: '관리자',
  createdAt: '2026-05-04T00:00:00',
  images: [{ imageId: 11, imageUrl: 'https://cdn.example.com/notice.png' }],
};

const mockNoticeList = (notices = [noticeFixture]) => {
  get.mockImplementation((url) => {
    if (url.startsWith('/v1/bulletin-boards?')) {
      return Promise.resolve(successResponse({ content: notices }));
    }

    return Promise.resolve(successResponse({ content: [] }));
  });
};

const openNoticeEditForm = async () => {
  mockNoticeList();
  renderAdminPage(['/admin?view=notice']);

  await waitFor(() => {
    expect(screen.getByText('#7 기존 공지')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: '수정' }));
};

describe('AdminPage 페이지 테스트', () => {
  // 각 테스트 실행 전 모킹 기록을 초기화하고 기본 API 응답을 설정함
  beforeEach(() => {
    vi.clearAllMocks();
    getUserRoleFromToken.mockReturnValue('ADMIN');
    // 조회 API 성공 응답(빈 목록) 기본 세팅
    get.mockImplementation((url) => {
      if (url === '/v1/main/bulletin-boards') {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [
              {
                imageUrl: null,
                title: '메인 노출 게시글',
                authorNickname: '관리자',
                authorProfileImageUrl: null,
                boardId: 3,
              },
            ],
          },
        });
      }

      if (url === '/admin/v1/main/rail-images') {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [
              {
                imageId: 1,
                imageUrl: 'https://cdn.example.com/rail-1.png',
                altText: 'Main rail one',
                displayOrder: 1,
              },
            ],
          },
        });
      }

      return Promise.resolve({ data: { isSuccess: true, data: { content: [] } } });
    });
    post.mockResolvedValue({ data: { isSuccess: true } });
    patch.mockResolvedValue({ data: { isSuccess: true } });
    put.mockResolvedValue({ data: { isSuccess: true, data: null } });
    del.mockResolvedValue({ data: { isSuccess: true } });
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    vi.spyOn(globalThis, 'confirm').mockImplementation(() => true);
  });

  it('페이지 초기 로드 시 관리자 목록 타이틀과 주요 액션 버튼들이 화면에 표시되어야 합니다', async () => {
    renderAdminPage();

    // 헤더 타이틀 확인
    expect(screen.getByText('관리자 목록')).toBeInTheDocument();

    // 주요 기능 버튼 존재 여부 확인
    expect(screen.getByText('+ 관리자 추가')).toBeInTheDocument();
    expect(screen.getByText('선택된 관리자 권한 수정')).toBeInTheDocument();
    expect(screen.getByText(/새로고침/)).toBeInTheDocument();
  });

  it('"+ 관리자 추가" 버튼 클릭 시 신규 멤버를 관리자로 등록하는 모달창이 열려야 합니다', async () => {
    renderAdminPage();

    // 클릭 전 모달 부재 확인
    expect(screen.queryByText('신규 관리자 추가')).not.toBeInTheDocument();

    // 추가 버튼 클릭 시뮬레이션
    fireEvent.click(screen.getByText('+ 관리자 추가'));

    // 모달창 내 주요 텍스트 렌더링 확인
    expect(screen.getByText('신규 관리자 추가')).toBeInTheDocument();
    expect(screen.getByText('추가할 멤버 아이디 (Member ID)')).toBeInTheDocument();
  });

  it('모달창 내의 "취소" 버튼을 누르면 열려있던 관리자 추가 모달이 닫혀야 합니다', async () => {
    renderAdminPage();

    // 모달 열기 시뮬레이션
    fireEvent.click(screen.getByText('+ 관리자 추가'));
    expect(screen.getByText('신규 관리자 추가')).toBeInTheDocument();

    // 취소 버튼 클릭 시뮬레이션
    fireEvent.click(screen.getByText('취소'));

    // 모달 요소가 화면에서 사라졌는지 확인
    expect(screen.queryByText('신규 관리자 추가')).not.toBeInTheDocument();
  });

  it('"공지등록" 버튼 클릭 시 공지 등록 UI가 열리고 제출할 수 있어야 합니다', async () => {
    renderAdminPage();

    fireEvent.click(screen.getByText('공지등록'));

    expect(
      screen.getByText('커뮤니티 공지사항을 등록, 조회, 수정, 삭제합니다.'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('공지 제목을 입력해 주세요'), {
      target: { value: '점검 안내' },
    });
    fireEvent.change(screen.getByPlaceholderText('공지 내용을 입력해 주세요'), {
      target: { value: '오늘 밤 서비스 점검이 진행됩니다.' },
    });
    const image = new File(['notice-image'], 'notice.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('이미지 첨부'), {
      target: { files: [image] },
    });
    fireEvent.click(screen.getByRole('button', { name: '공지 등록' }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/admin/v1/bulletin-boards', expect.any(FormData));
    });

    const submittedFormData = post.mock.calls[0][1];
    const request = JSON.parse(await readBlobText(submittedFormData.get('request')));
    expect(request).toEqual({
      title: '점검 안내',
      content: '오늘 밤 서비스 점검이 진행됩니다.',
      assetId: null,
      type: 'ADMIN_BOARD',
      commissionId: null,
      retainedImageIds: null,
    });
    expect(submittedFormData.getAll('images')).toEqual([image]);
  });

  it('등록된 공지사항을 조회하고 수정, 삭제할 수 있어야 합니다', async () => {
    await openNoticeEditForm();
    expect(screen.getByDisplayValue('기존 공지')).toBeInTheDocument();
    expect(screen.getByText('기존 이미지 #11')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('기존 공지'), {
      target: { value: '수정된 공지' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공지 수정' }));

    await waitFor(() => {
      expect(put).toHaveBeenCalledWith('/v1/bulletin-boards/7', expect.any(FormData));
    });

    const updateFormData = put.mock.calls[0][1];
    const updateRequest = JSON.parse(await readBlobText(updateFormData.get('request')));
    expect(updateRequest).toEqual({
      title: '수정된 공지',
      content: '기존 공지 내용',
      assetId: null,
      type: 'ADMIN_BOARD',
      commissionId: null,
      retainedImageIds: [11],
    });

    fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[0]);

    await waitFor(() => {
      expect(del).toHaveBeenCalledWith('/admin/v1/bulletin-boards/7');
    });
  });

  it('공지 수정 취소 시 기존 이미지가 있어도 관리자 목록으로 돌아가야 합니다', async () => {
    await openNoticeEditForm();
    expect(screen.getByText('기존 이미지 #11')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '목록으로' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '관리자 목록', level: 1 })).toBeInTheDocument();
    });
    expect(screen.queryByText('기존 이미지 #11')).not.toBeInTheDocument();
  });

  it('"pinpoint 등록" 버튼 클릭 시 pinpoint 등록 UI가 열리고 저장할 수 있어야 합니다', async () => {
    renderAdminPage();

    fireEvent.click(screen.getByText('pinpoint 등록'));

    expect(
      screen.getByText('현재 설정을 불러온 뒤 게시글 ID를 추가, 수정, 삭제하고 순서를 저장합니다.'),
    ).toBeInTheDocument();
    expect(screen.getByText('조회된 메인 노출 목록')).toBeInTheDocument();
    expect(screen.getByText('조회')).toBeInTheDocument();
    expect(screen.getByText('추가')).toBeInTheDocument();
    expect(screen.getByText('수정')).toBeInTheDocument();
    expect(screen.getByText('삭제')).toBeInTheDocument();

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/v1/main/bulletin-boards');
    });

    fireEvent.change(screen.getByPlaceholderText('예: 3'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByText('+ 게시글 추가'));
    fireEvent.change(screen.getAllByPlaceholderText('예: 3')[1], {
      target: { value: '8' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'pinpoint 저장' }));

    await waitFor(() => {
      expect(put).toHaveBeenCalledWith('/admin/v1/main/bulletin-boards/pinpoints', {
        boardIds: [3, 8],
      });
    });
  });

  it('pinpoint 게시글은 API 제한인 최대 8개까지만 추가할 수 있어야 합니다', async () => {
    renderAdminPage();

    fireEvent.click(screen.getByText('pinpoint 등록'));

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/v1/main/bulletin-boards');
    });

    const addButton = screen.getByRole('button', { name: '+ 게시글 추가' });
    for (let index = 1; index < 8; index += 1) {
      fireEvent.click(addButton);
    }

    expect(screen.getAllByPlaceholderText('예: 3')).toHaveLength(8);
    expect(addButton).toBeDisabled();
  });

  it('pinpoint 조회 결과를 편집 목록으로 불러오고 삭제할 수 있어야 합니다', async () => {
    renderAdminPage(['/admin?view=pinpoint']);

    await waitFor(() => {
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '1번째 pinpoint 삭제' }));

    expect(screen.getAllByPlaceholderText('예: 3')).toHaveLength(1);
    expect(screen.getByPlaceholderText('예: 3')).toHaveValue('');
  });

  it('"레일 이미지 관리" 버튼 클릭 시 레일 이미지 관리 UI가 열리고 저장, 수정, 삭제할 수 있어야 합니다', async () => {
    renderAdminPage();

    fireEvent.click(screen.getByText('레일 이미지 관리'));

    expect(screen.getByRole('heading', { name: '레일 이미지 관리', level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText('메인 페이지 이미지 레일에 노출할 이미지를 등록, 수정, 삭제합니다.'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/admin/v1/main/rail-images');
    });

    expect(screen.getByText('Main rail one')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('메인 레일 이미지 대체 텍스트'), {
      target: { value: '새 레일 이미지' },
    });
    fireEvent.change(screen.getByPlaceholderText('1'), {
      target: { value: '2' },
    });

    const image = new File(['main-image'], 'main.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('이미지 파일 선택'), {
      target: { files: [image] },
    });
    fireEvent.click(screen.getByRole('button', { name: '레일 이미지 등록' }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/admin/v1/main/rail-images', expect.any(FormData));
    });

    const submittedFormData = post.mock.calls[0][1];
    expect(submittedFormData.get('image')).toBe(image);
    expect(submittedFormData.get('altText')).toBe('새 레일 이미지');
    expect(submittedFormData.get('displayOrder')).toBe('2');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '수정' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    expect(screen.getByDisplayValue('Main rail one')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('Main rail one'), {
      target: { value: '수정된 레일 이미지' },
    });
    fireEvent.click(screen.getByRole('button', { name: '레일 이미지 수정' }));

    await waitFor(() => {
      expect(patch).toHaveBeenCalledWith('/admin/v1/main/rail-images/1', expect.any(FormData));
    });

    const updateFormData = patch.mock.calls[0][1];
    expect(updateFormData.get('image')).toBeNull();
    expect(updateFormData.get('altText')).toBe('수정된 레일 이미지');
    expect(updateFormData.get('displayOrder')).toBe('1');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '삭제' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(del).toHaveBeenCalledWith('/admin/v1/main/rail-images/1');
    });
  });

  it('레일 이미지 등록 시 백엔드가 허용하지 않는 파일 형식은 API 호출 전에 차단합니다', async () => {
    renderAdminPage(['/admin?view=image']);

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/admin/v1/main/rail-images');
    });

    fireEvent.change(screen.getByPlaceholderText('1'), {
      target: { value: '1' },
    });

    const image = new File(['main-image'], 'main.gif', { type: 'image/gif' });
    fireEvent.change(screen.getByLabelText('이미지 파일 선택'), {
      target: { files: [image] },
    });
    fireEvent.click(screen.getByRole('button', { name: '레일 이미지 등록' }));

    expect(globalThis.alert).toHaveBeenCalledWith(
      '이미지는 jpg, jpeg, png, webp 형식이며 파일당 20MB 이하여야 합니다.',
    );
    expect(post).not.toHaveBeenCalled();
  });

  it('pinpoint 쿼리로 바로 진입하면 관리자 목록 API 없이 pinpoint 화면을 렌더링해야 합니다', async () => {
    renderAdminPage(['/admin?view=pinpoint']);

    expect(screen.getByRole('heading', { name: 'pinpoint 등록', level: 1 })).toBeInTheDocument();
    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/v1/main/bulletin-boards');
    });
    expect(get).not.toHaveBeenCalledWith('/admin/v1/admins');
  });

  it.each(['/admin', '/admin?view=list', '/admin?view=edit'])(
    'BULLETINBOARD_ADMIN이 %s로 직접 진입하면 공지사항 관리 화면으로 보정해야 합니다',
    async (initialEntry) => {
      getUserRoleFromToken.mockReturnValue('BULLETINBOARD_ADMIN');

      renderAdminPage([initialEntry]);

      expect(screen.getByRole('heading', { name: '공지사항 관리', level: 1 })).toBeInTheDocument();
      await waitFor(() => {
        expect(get).toHaveBeenCalledWith(expect.stringMatching(/^\/v1\/bulletin-boards\?/));
      });
      expect(get).not.toHaveBeenCalledWith('/admin/v1/admins');
    },
  );
});
