import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect, vi, describe, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PasswordFindPage from './PasswordChangePage';
import { post } from '../../api/apiClient';

const mockNavigate = vi.hoisted(() => vi.fn());

// 💡 1. apiClient 모킹 (post 메서드만 사용하므로 post만 모킹)
vi.mock('../../api/apiClient', () => ({
  post: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PasswordFindPage 컴포넌트 테스트', () => {
  // 각 테스트가 실행되기 전에 모킹된 함수들을 초기화합니다.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('초기 화면(1단계)이 정상적으로 렌더링되어야 합니다', () => {
    render(
      <MemoryRouter>
        <PasswordFindPage />
      </MemoryRouter>,
    );

    // 1단계의 핵심 텍스트와 버튼이 있는지 확인
    expect(screen.getByPlaceholderText('이메일 입력*')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '인증번호 전송' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인 화면으로 돌아가기' })).toBeInTheDocument();
  });

  test('이메일 입력 후 인증번호 전송 시 이메일 확인 안내를 보여줘야 합니다', async () => {
    // 💡 1단계 요청 API 성공 모킹
    post.mockResolvedValueOnce({ data: { isSuccess: true } });

    render(
      <MemoryRouter>
        <PasswordFindPage />
      </MemoryRouter>,
    );

    // 이메일 입력
    const emailInput = screen.getByPlaceholderText('이메일 입력*');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // [인증번호 전송] 버튼 클릭
    const sendButton = screen.getByRole('button', { name: '인증번호 전송' });
    fireEvent.click(sendButton);

    // API 호출 확인
    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/v1/member/password-reset/request', {
        email: 'test@example.com',
      });
    });

    // 성공 모달 확인 및 닫기
    await waitFor(() => {
      expect(screen.getByText('입력하신 이메일로 인증번호가 발송되었습니다.')).toBeInTheDocument();
    });

    // 모달창의 [확인] 버튼 클릭하여 모달 닫기
    const modalConfirmBtn = screen.getByRole('button', { name: '확인' });
    fireEvent.click(modalConfirmBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/');

    // 리다이렉트 링크를 통해 돌아오기 전까지 비밀번호 입력 화면으로 넘어가지 않습니다.
    expect(screen.queryByPlaceholderText('인증번호 (인증코드)*')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('새 비밀번호*')).not.toBeInTheDocument();
  });

  test('URL code가 있으면 인증번호 입력칸 없이 새 비밀번호 입력 화면이 나타나야 합니다', async () => {
    render(
      <MemoryRouter initialEntries={['/password-reset?code=reset-code-123']}>
        <PasswordFindPage />
      </MemoryRouter>,
    );

    expect(screen.queryByPlaceholderText('인증번호 (인증코드)*')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('새 비밀번호*')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('새 비밀번호 확인*')).toBeInTheDocument();
  });

  test('URL code로 비밀번호 재설정 요청을 보내고 성공 모달이 나타나야 합니다', async () => {
    post.mockResolvedValueOnce({ data: { isSuccess: true } });

    render(
      <MemoryRouter initialEntries={['/password-reset?code=reset-code-123']}>
        <PasswordFindPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('새 비밀번호*'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('새 비밀번호 확인*'), {
      target: { value: 'newPassword123' },
    });

    // [비밀번호 재설정] 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '비밀번호 재설정' }));

    // 2단계 API 호출 데이터 검증
    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/v1/member/password-reset/confirm', {
        email: '',
        verificationCode: 'reset-code-123',
        newPassword: 'newPassword123',
        newPasswordConfirm: 'newPassword123',
      });
    });

    // 최종 성공 모달 확인
    await waitFor(() => {
      expect(screen.getByText(/비밀번호가 성공적으로 변경되었습니다/)).toBeInTheDocument();
    });
  });
});
