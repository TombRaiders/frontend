/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ShippingAddressModal from './ShippingAddressModal';
import { addressService } from '../../../api/addressService';

expect.extend(matchers);

vi.mock('../../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

vi.mock('../../../api/addressService', () => ({
  addressService: {
    createAddress: vi.fn(),
  },
}));

vi.mock('./ShippingAddressOverlay', () => ({
  default: ({ children }) => <div data-testid="mock-overlay">{children}</div>,
}));

describe('ShippingAddressModal 테스트', () => {
  const mockOnClose = vi.fn();
  const mockSetAddresses = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.alert = vi.fn(); // alert 모킹
  });

  afterEach(() => {
    cleanup();
  });

  it('입력값 필터링: 이름과 받는 분 입력 시 숫자와 특수문자가 제거되어야 한다', () => {
    const { container } = render(
      <ShippingAddressModal isOpen onClose={mockOnClose} setAddresses={mockSetAddresses} />,
    );

    // [해결] name 속성을 사용하여 중복 없이 정확한 input 요소를 선택합니다.
    const nameInput = container.querySelector('input[name="name"]');

    // '우리집123!' 입력 시도
    fireEvent.change(nameInput, { target: { name: 'name', value: '우리집123!' } });

    // 정규식에 의해 '우리집'만 남아야 함
    expect(nameInput.value).toBe('우리집');
  });

  it('주소 정보 미입력 후 등록 클릭 시 alert이 발생해야 한다', async () => {
    render(<ShippingAddressModal isOpen onClose={mockOnClose} setAddresses={mockSetAddresses} />);

    const registerButton = screen.getByText('등록');
    fireEvent.click(registerButton);

    expect(globalThis.alert).toHaveBeenCalledWith('주소 정보를 정확히 입력해주세요.');
    expect(addressService.createAddress).not.toHaveBeenCalled();
  });

  it('API 성공 시 alert을 띄우고 모달을 닫아야 한다', async () => {
    // API 성공 응답 모킹
    addressService.createAddress.mockResolvedValue({ isSuccess: true });

    const { container } = render(
      <ShippingAddressModal isOpen onClose={mockOnClose} setAddresses={mockSetAddresses} />,
    );

    // 필수 정보 입력
    fireEvent.change(container.querySelector('input[name="receiver"]'), {
      target: { name: 'receiver', value: '홍길동' },
    });
    fireEvent.change(container.querySelector('input[name="postcode"]'), {
      target: { name: 'postcode', value: '12345' },
    });
    fireEvent.change(container.querySelector('input[name="address"]'), {
      target: { name: 'address', value: '서울시 강남구' },
    });
    fireEvent.change(container.querySelector('input[name="phone"]'), {
      target: { name: 'phone', value: '01012345678' },
    });

    const registerButton = screen.getByText('등록');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(addressService.createAddress).toHaveBeenCalled();
      expect(globalThis.alert).toHaveBeenCalledWith('배송지가 성공적으로 등록되었습니다.');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
