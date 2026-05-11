import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect, vi, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import EditProfilePage from './EditProfilePage';
import { post, put, get } from '../../api/apiClient';

// 💡 1. 모든 API 통신 모킹
vi.mock('../../api/apiClient', () => ({
  post: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
  patch: vi.fn(),
}));

// 💡 2. JSDOM에서 지원하지 않는 dialog API 모킹 (성공/실패 모달용)
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

test('변경사항 저장 버튼 클릭 시 비밀번호를 확인하고 성공 모달이 나타나야 합니다', async () => {
  // 💡 3. API 응답값 설정
  post.mockResolvedValue({ data: { isSuccess: true } });
  put.mockResolvedValue({ data: { isSuccess: true } });
  get.mockResolvedValue({
    data: {
      isSuccess: true,
      data: { nickname: '기존닉네임', email: 'test@test.com', bio: '기존소개' },
    },
  });

  const mockUser = {
    nickname: '기존닉네임',
    email: 'test@test.com',
    introduce: '기존소개',
  };
  const mockSetUser = vi.fn();

  render(
    <MemoryRouter>
      <EditProfilePage user={mockUser} setUser={mockSetUser} />
    </MemoryRouter>,
  );

  // 💡 4. [중요] findBy를 사용하여 "정보를 불러오는 중입니다..." 로딩이 끝날 때까지 기다립니다.
  // Placeholder 대신 더 안정적인 LabelText를 사용합니다.
  const nicknameInput = await screen.findByLabelText('닉네임');

  // 닉네임 변경 시뮬레이션
  fireEvent.change(nicknameInput, { target: { name: 'nickname', value: '새로운닉네임' } });

  // 5. [변경사항 저장] 버튼 클릭
  const saveButton = screen.getByText('변경사항 저장');
  fireEvent.click(saveButton);

  // 6. 비밀번호 확인 모달이 뜨면 비밀번호 입력 (findBy로 모달 나타남 대기)
  const passwordInput = await screen.findByPlaceholderText('비밀번호 입력');
  expect(passwordInput).toBeInTheDocument();
  fireEvent.change(passwordInput, { target: { value: 'myPassword123!' } });

  // 7. 모달 창 안의 [확인] 버튼 클릭
  const confirmButton = screen.getByRole('button', { name: '확인' });
  fireEvent.click(confirmButton);

  // 8. API 통신 후, 성공 메시지가 포함된 모달이 나타나는지 검증
  // 정규표현식(/.../)을 쓰면 텍스트가 살짝 달라도 유연하게 체크 가능합니다.
  await waitFor(() => {
    expect(screen.getByText(/성공적으로 변경되었습니다/)).toBeInTheDocument();
  });
});
