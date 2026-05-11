import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UnbanModal from './UnbanModal';

vi.mock('../../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('UnbanModal', () => {
  const mockData = { isOpen: true, searchLoginId: 'user1', memberId: 123 };

  it('해제하기 버튼 클릭 시 onSubmit이 호출된다', () => {
    const onSubmit = vi.fn();
    render(
      <UnbanModal
        modalData={mockData}
        onSubmit={onSubmit}
        setModalData={vi.fn()}
        onSearch={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('해제하기'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
