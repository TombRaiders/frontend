import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BanModal from './BanModal';

vi.mock('../../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('BanModal', () => {
  const mockData = { isOpen: true, searchLoginId: '', memberId: '', reason: '', day: '' };

  it('조회 버튼 클릭 시 onSearch가 호출된다', () => {
    const onSearch = vi.fn();
    render(
      <BanModal
        modalData={mockData}
        onSearch={onSearch}
        setModalData={vi.fn()}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('조회'));
    expect(onSearch).toHaveBeenCalled();
  });

  it('차단하기 버튼 클릭 시 onSubmit이 호출된다', () => {
    const onSubmit = vi.fn();
    render(
      <BanModal
        modalData={mockData}
        onSubmit={onSubmit}
        setModalData={vi.fn()}
        onSearch={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('차단하기'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
