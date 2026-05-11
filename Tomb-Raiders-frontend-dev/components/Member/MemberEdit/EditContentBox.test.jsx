import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import EditContentBox from './EditContentBox';
import { get, put } from '../../../api/apiClient';
import { saveCurrentUserProfile } from '../../../utils/currentUserProfile';

/**
 * EditContentBox 컴포넌트 유닛 테스트
 */

// 💡 핵심: 컴포넌트 내부에서 사용하는 post API 모킹 (Network Error 방지)
vi.mock('../../../api/apiClient', () => ({
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock('../../../utils/currentUserProfile', () => ({
  saveCurrentUserProfile: vi.fn(),
}));

const mockVw = (size) => `${size}px`;

describe('EditContentBox 컴포넌트 테스트', () => {
  const mockFormData = {
    nickname: '테스트유저',
    email: 'test@example.com',
    bio: '안녕하세요 테스트입니다.',
    profileImageUrl: '',
  };

  const mockProps = {
    vw: mockVw,
    formData: mockFormData,
    onChange: vi.fn(),
    onSave: vi.fn(),
    setFormData: vi.fn(),
    onProfileImageUploadSuccess: vi.fn(),
  };

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('정보 관리 제목과 닉네임, 읽기 전용 이메일, 자기소개 입력 필드가 정상적으로 렌더링되어야 합니다', () => {
    render(<EditContentBox {...mockProps} />);

    expect(screen.getByText('정보 관리')).toBeInTheDocument();

    // 💡 Placeholder 대신 Label로 찾는 것이 웹 접근성 및 테스트 안정성 측면에서 더 좋습니다.
    expect(screen.getByLabelText('닉네임')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('자기소개')).toBeInTheDocument();
  });

  it('각 입력 필드에 전달된 formData의 초기값이 정확하게 표시되어야 합니다', () => {
    render(<EditContentBox {...mockProps} />);

    expect(screen.getByDisplayValue(mockFormData.nickname)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockFormData.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockFormData.bio)).toBeInTheDocument();
  });

  it('입력 필드의 값이 변경될 때 부모 컴포넌트의 onChange 함수가 호출되어야 합니다', () => {
    render(<EditContentBox {...mockProps} />);

    // Label로 input 요소를 정확히 찾아냅니다.
    const nicknameInput = screen.getByLabelText('닉네임');
    fireEvent.change(nicknameInput, { target: { value: '새닉네임', name: 'nickname' } });

    expect(mockProps.onChange).toHaveBeenCalled();
  });

  it('변경사항 저장 버튼 클릭 시 부모 컴포넌트의 onSave 함수가 호출되어야 합니다', () => {
    render(<EditContentBox {...mockProps} />);

    const saveButton = screen.getByRole('button', { name: /변경사항 저장/i });
    fireEvent.click(saveButton);

    expect(mockProps.onSave).toHaveBeenCalled();
  });

  it('프로필 사진 변경 텍스트가 노출되어야 하며, 클릭 가능한 스타일이 적용되어야 합니다', () => {
    render(<EditContentBox {...mockProps} />);

    const photoChangeText = screen.getByText('프로필 사진 변경');
    expect(photoChangeText).toBeInTheDocument();
    // 컴포넌트에 적용된 인라인 스타일 cursor: pointer 검증
    expect(photoChangeText).toHaveStyle({ cursor: 'pointer' });
  });

  it('uses the shared API client for profile image uploads', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:profile-preview');
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    put.mockResolvedValueOnce({ data: { isSuccess: true } });

    render(<EditContentBox {...mockProps} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['profile'], 'profile.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(put).toHaveBeenCalledWith('/v1/member/profile-image', expect.any(FormData));
    });

    const [, body] = put.mock.calls[0];
    expect(body.get('image')).toBe(file);
  });

  it('treats a 2xx profile image upload response without a body as success', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:profile-preview');
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    put.mockResolvedValueOnce({ status: 204, data: null });

    render(<EditContentBox {...mockProps} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['profile'], 'profile.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(put).toHaveBeenCalledWith('/v1/member/profile-image', expect.any(FormData));
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('성공'));
    });
  });

  it('treats a rejected upload as success when the refreshed profile image changed', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:profile-preview');
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    put.mockRejectedValueOnce({ response: { status: 500 } });
    get.mockResolvedValueOnce({
      data: {
        isSuccess: true,
        data: {
          profileImageUrl: 'https://cdn.example.com/new-profile.png',
        },
      },
    });

    render(
      <EditContentBox
        {...mockProps}
        formData={{
          ...mockFormData,
          profileImageUrl: 'https://cdn.example.com/old-profile.png',
        }}
      />,
    );

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['profile'], 'profile.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/v1/member/me');
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('성공'));
    });
    expect(mockProps.onProfileImageUploadSuccess).toHaveBeenCalled();
  });

  it('updates the local profile state after upload success instead of relying on a page reload', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:profile-preview');
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    put.mockResolvedValueOnce({
      data: {
        isSuccess: true,
        data: {
          profileImageUrl: 'https://cdn.example.com/new-profile.png',
        },
      },
    });

    render(<EditContentBox {...mockProps} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['profile'], 'profile.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(saveCurrentUserProfile).toHaveBeenCalledWith({
        ...mockFormData,
        profileImageUrl: 'https://cdn.example.com/new-profile.png',
      });
    });
    expect(mockProps.setFormData).toHaveBeenCalledWith(expect.any(Function));
  });
});
