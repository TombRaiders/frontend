import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommissionPage from './CommissionPage';
import { useCommission } from './useCommission';

// 1. 라우터 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 2. useCommission 훅 모킹
vi.mock('./useCommission', () => ({
  useCommission: vi.fn(),
}));

describe('CommissionPage', () => {
  let mockUploadImage;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadImage = vi.fn();
    useCommission.mockReturnValue({
      uploadImage: mockUploadImage,
      isLoading: false,
      error: null,
    });
    globalThis.alert = vi.fn();
  });

  // 💡 WebLogo의 Link 태그 에러를 막기 위해 MemoryRouter로 감쌉니다.
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <CommissionPage />
      </MemoryRouter>,
    );

  it('renders the upload page shell', () => {
    renderComponent();
    expect(screen.getByText('이미지 의뢰')).toBeInTheDocument();
  });

  it('rejects non-image files', () => {
    const { container } = renderComponent();
    // type="file" 인 input 요소를 가져옵니다.
    const fileInput =
      container.querySelector('input[type="file"]') || screen.getByTestId('file-input');

    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(globalThis.alert).toHaveBeenCalledWith(
      '이미지 파일(jpg, png, webp)만 업로드할 수 있습니다.',
    );
  });

  it('requires a selected file before submit', () => {
    renderComponent();
    // 폼 제출 버튼 클릭 시뮬레이션
    const submitBtns = screen.getAllByRole('button');
    // 💡 [SonarLint 해결] .at(-1) 사용
    const submitBtn = submitBtns.at(-1);

    fireEvent.click(submitBtn);
    expect(globalThis.alert).toHaveBeenCalledWith('이미지를 업로드해주세요.');
  });

  it('submits the selected file through useCommission and navigates to the result page', async () => {
    mockUploadImage.mockResolvedValue({ commissionId: 123, aiImageUrl: 'http://test.com/ai.png' });
    const { container } = renderComponent();

    const fileInput =
      container.querySelector('input[type="file"]') || screen.getByTestId('file-input');
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitBtns = screen.getAllByRole('button');
    // 💡 [SonarLint 해결] .at(-1) 사용
    const submitBtn = submitBtns.at(-1);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalled();
      expect(globalThis.alert).toHaveBeenCalledWith('이미지가 성공적으로 업로드되었습니다!');
      expect(mockNavigate).toHaveBeenCalledWith('/commissions');
    });
  });

  it('renders an upload error from the hook', () => {
    useCommission.mockReturnValue({
      uploadImage: mockUploadImage,
      isLoading: false,
      error: '업로드 중 오류가 발생했습니다.', // 테스트용 에러 메시지
    });
    renderComponent();
    expect(screen.getByText('업로드 중 오류가 발생했습니다.')).toBeInTheDocument();
  });
});
