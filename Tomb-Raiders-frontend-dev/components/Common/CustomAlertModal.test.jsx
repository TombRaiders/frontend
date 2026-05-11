import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomAlertModal from './CustomAlertModal';

// vw 모킹
vi.mock('../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('CustomAlertModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: '테스트 알림',
    description: '테스트 설명입니다.',
  };

  it('isOpen이 false면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<CustomAlertModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('제목과 설명을 올바르게 표시한다', () => {
    render(<CustomAlertModal {...defaultProps} />);
    expect(screen.getByText('테스트 알림')).toBeDefined();
    expect(screen.getByText('테스트 설명입니다.')).toBeDefined();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    render(<CustomAlertModal {...defaultProps} />);
    fireEvent.click(screen.getByText('닫기'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('우측 버튼 클릭 시 onRightBtnClick이 호출된다', () => {
    const onRightClick = vi.fn();
    render(
      <CustomAlertModal {...defaultProps} rightBtnText="확인" onRightBtnClick={onRightClick} />,
    );
    fireEvent.click(screen.getByText('확인'));
    expect(onRightClick).toHaveBeenCalled();
  });
});
