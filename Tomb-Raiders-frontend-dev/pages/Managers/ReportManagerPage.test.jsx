import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportManagerPage from './ReportManagerPage';

// 💡 1. API 호출을 가로채기 위해 모킹(Mocking)합니다.
import { get } from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

// 💡 2. 자식 컴포넌트들을 가짜 컴포넌트로 만듭니다. (내부 로직 테스트 분리)
vi.mock('../../components/Admin/Sidebar', () => ({
  default: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));
vi.mock('../../components/Admin/Report/ReportTable', () => ({
  default: ({ reports }) => (
    <div data-testid="mock-report-table">Reports Count: {reports.length}</div>
  ),
}));
vi.mock('../../components/Admin/Report/BannedUserTable', () => ({
  default: ({ bannedUsers }) => (
    <div data-testid="mock-banned-table">Banned Count: {bannedUsers.length}</div>
  ),
}));
vi.mock('../../components/Admin/Report/BanModal', () => ({
  default: ({ modalData }) =>
    modalData.isOpen ? <div data-testid="mock-ban-modal">Ban Modal Open</div> : null,
}));
vi.mock('../../components/Admin/Report/UnbanModal', () => ({
  default: ({ modalData }) =>
    modalData.isOpen ? <div data-testid="mock-unban-modal">Unban Modal Open</div> : null,
}));
vi.mock('../../components/Common/CustomAlertModal', () => ({
  default: ({ isOpen, description }) =>
    isOpen ? <div data-testid="mock-alert-modal">{description}</div> : null,
}));

// --- 본격적인 테스트 케이스 시작 ---
describe('ReportManagerPage 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // 각 테스트 실행 전 모킹 기록 초기화
  });

  it('1. 초기 렌더링 시 "신고 접수 내역" 탭이 활성화되고 API를 호출해야 합니다.', async () => {
    // API 응답 가짜 데이터 설정
    get.mockResolvedValueOnce({
      data: { isSuccess: true, data: { content: [{ reportId: 1 }, { reportId: 2 }] } },
    });

    render(<ReportManagerPage />);

    // 제목 및 사이드바 렌더링 확인
    expect(screen.getByText('신고 및 제재 관리')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();

    // 기본 탭인 ReportTable이 보이는지 확인
    expect(screen.getByTestId('mock-report-table')).toBeInTheDocument();

    // 신고 내역 API가 정상적으로 1번 호출되었는지 검증
    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/admin/v1/bulletin-boards/reports');
      expect(get).toHaveBeenCalledTimes(1);
    });

    // 넘겨받은 데이터가 자식 컴포넌트에 잘 전달되었는지 확인
    expect(screen.getByText('Reports Count: 2')).toBeInTheDocument();
  });

  it('2. "차단된 회원 목록" 탭을 클릭하면 BannedUserTable을 보여주고 관련 API를 호출해야 합니다.', async () => {
    // 첫 렌더링(신고 내역) 응답
    get.mockResolvedValueOnce({ data: { isSuccess: true, data: { content: [] } } });

    // 탭 전환(차단 회원) 응답
    get.mockResolvedValueOnce({
      data: { isSuccess: true, data: [{ memberId: 100 }] },
    });

    render(<ReportManagerPage />);

    // 차단된 회원 목록 탭 클릭
    const bannedTabBtn = screen.getByText('차단된 회원 목록');
    fireEvent.click(bannedTabBtn);

    // BannedUserTable로 화면이 전환되었는지 확인
    await waitFor(() => {
      expect(screen.getByTestId('mock-banned-table')).toBeInTheDocument();
    });

    // 차단 회원 목록 API 호출 검증
    expect(get).toHaveBeenCalledWith('/v1/admin/members/banned');
    expect(screen.getByText('Banned Count: 1')).toBeInTheDocument();
  });

  it('3. "수동 회원 차단" 버튼을 누르면 BanModal이 열려야 합니다.', async () => {
    get.mockResolvedValueOnce({ data: { isSuccess: true, data: { content: [] } } });
    render(<ReportManagerPage />);

    // 수동 회원 차단 버튼 찾기 (텍스트 안에 아이콘이 포함되어 있으므로 정규식 사용)
    const banButton = screen.getByText(/수동 회원 차단/i);
    fireEvent.click(banButton);

    // 모달이 열렸는지 확인
    expect(screen.getByTestId('mock-ban-modal')).toBeInTheDocument();
  });

  it('4. "수동 차단 해제" 버튼을 누르면 UnbanModal이 열려야 합니다.', async () => {
    get.mockResolvedValueOnce({ data: { isSuccess: true, data: { content: [] } } });
    render(<ReportManagerPage />);

    const unbanButton = screen.getByText(/수동 차단 해제/i);
    fireEvent.click(unbanButton);

    // 모달이 열렸는지 확인
    expect(screen.getByTestId('mock-unban-modal')).toBeInTheDocument();
  });

  it('5. API 호출 실패 시 CustomAlertModal에 에러 메시지가 표시되어야 합니다.', async () => {
    // API 호출 시 에러가 발생하도록 모킹
    get.mockRejectedValueOnce(new Error('Network Error'));

    render(<ReportManagerPage />);

    // 에러 발생 후 Alert 모달이 뜨는지 확인
    await waitFor(() => {
      expect(screen.getByTestId('mock-alert-modal')).toBeInTheDocument();
      expect(screen.getByText('신고 내역을 불러오지 못했습니다.')).toBeInTheDocument();
    });
  });
});
