import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import ReportPromptModal from './ReportPromptModal';

vi.mock('../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('ReportPromptModal', () => {
  // 💡 핵심: dialog API 모킹 추가
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  const mockData = { isOpen: true, title: '신고하기', reason: '' };
  const setModalData = vi.fn();

  it('신고 사유를 입력하면 setModalData가 호출된다', () => {
    render(
      <ReportPromptModal modalData={mockData} setModalData={setModalData} onSubmit={vi.fn()} />,
    );
    const textarea = screen.getByPlaceholderText('신고 사유를 구체적으로 적어주세요.');
    fireEvent.change(textarea, { target: { value: '불법 광고' } });
    expect(setModalData).toHaveBeenCalled();
  });

  it('사유가 비어있으면 접수하기 버튼이 비활성화된다', () => {
    render(
      <ReportPromptModal modalData={mockData} setModalData={setModalData} onSubmit={vi.fn()} />,
    );
    const btn = screen.getByText('접수하기');
    expect(btn).toBeDisabled(); // 💡 .hasAttribute('disabled') 대신 .toBeDisabled() 권장
  });
});
