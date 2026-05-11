import React from 'react';
import { render, screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import OrderPrintingPage from './OrderPrintingPage';
import { orderapi } from '../../api/orderapi';
import { addressService } from '../../api/addressService';
import { mockNavigate } from '../../setupTests';

vi.mock('../../utils/style', () => ({
  vw: (px) => `${px}px`,
}));

vi.mock('../../components/Commission/CommissionHeader', () => ({
  default: ({ title }) => <header data-testid="commission-header">{title}</header>,
}));

vi.mock('../../components/OrderPrinting/ModelPreview', () => ({
  default: ({ file }) => (
    <section data-testid="model-preview">
      <h3>3D 미리보기</h3>
      <p>{file.name}</p>
    </section>
  ),
}));

vi.mock('../../api/orderapi', () => ({
  orderapi: {
    uploadAsset: vi.fn(),
    createOrder: vi.fn(),
  },
}));

vi.mock('../../api/addressService', () => ({
  addressService: {
    getAddresses: vi.fn(),
  },
}));

const createModelFile = (name = 'order-model.stl') =>
  new File(['solid cube\nendsolid cube'], name, { type: 'model/stl' });

const renderOrderPrintingPage = () => render(<OrderPrintingPage />);

const selectModelFile = (file = createModelFile()) => {
  fireEvent.change(screen.getByLabelText('파일 선택'), { target: { files: [file] } });
  return file;
};

const selectPrintType = (value) => {
  fireEvent.change(screen.getByRole('combobox'), { target: { value } });
};

const enterRequirements = (requirements) => {
  fireEvent.change(screen.getByPlaceholderText(/색상 및 수량을 입력해 주세요/), {
    target: { value: requirements },
  });
};

const clickCreateOrder = () => {
  fireEvent.click(screen.getByRole('button', { name: '주문 생성하기' }));
};

describe('OrderPrintingPage', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    vi.mocked(orderapi.uploadAsset).mockResolvedValue({ data: { assetId: 88 } });
    vi.mocked(orderapi.createOrder).mockResolvedValue({ data: { orderId: 99 } });
    vi.mocked(addressService.getAddresses).mockResolvedValue({
      data: [{ addressId: 5, isDefault: true }],
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('renders the base order-printing form', () => {
    renderOrderPrintingPage();

    expect(screen.getByTestId('commission-header')).toHaveTextContent('모델 파일 선택');
    expect(screen.getByText('파일 업로드')).toBeInTheDocument();
    expect(screen.getByText('출력 종류 선택')).toBeInTheDocument();
    expect(screen.getByText('선택된 파일 없음')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '파일 전송하기' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '주문 생성하기' })).toBeDisabled();
  });

  it('shows the selected model file name and enables the order button', () => {
    renderOrderPrintingPage();

    const orderButton = screen.getByRole('button', { name: '주문 생성하기' });
    selectModelFile(createModelFile('test-model.stl'));

    expect(screen.getAllByText('test-model.stl').length).toBeGreaterThan(0);
    expect(orderButton).not.toBeDisabled();
  });

  it('shows a 3D model preview after selecting a supported model file', () => {
    renderOrderPrintingPage();

    selectModelFile(createModelFile('cube.stl'));

    const preview = screen.getByTestId('model-preview');

    expect(preview).toBeInTheDocument();
    expect(screen.getByText('3D 미리보기')).toBeInTheDocument();
    expect(within(preview).getByText(/cube\.stl/)).toBeInTheDocument();
  });

  it('allows changing the print type', () => {
    renderOrderPrintingPage();

    const selectBox = screen.getByRole('combobox');

    expect(selectBox).toHaveValue('FDM(플라스틱)');

    selectPrintType('레진');

    expect(selectBox).toHaveValue('레진');
  });

  it('allows entering additional print requirements', () => {
    renderOrderPrintingPage();

    const textarea = screen.getByPlaceholderText(/색상 및 수량을 입력해 주세요/);
    const testText = '검정색 2개, 내부 채움 20%로 부탁드립니다.';

    enterRequirements(testText);

    expect(textarea).toHaveValue(testText);
  });

  it('uploads the selected file and creates an order from the order button', async () => {
    renderOrderPrintingPage();

    const mockFile = createModelFile('direct-order-model.stl');
    const requirements = '검정색으로 출력해 주세요.';

    selectModelFile(mockFile);
    selectPrintType('레진');
    enterRequirements(requirements);

    const orderButton = screen.getByRole('button', { name: '주문 생성하기' });
    expect(orderButton).not.toBeDisabled();

    clickCreateOrder();

    await waitFor(() => {
      expect(orderapi.uploadAsset).toHaveBeenCalledWith(mockFile);
      expect(orderapi.createOrder).toHaveBeenCalledWith({
        assetId: 88,
        addressId: 5,
        manufacturingMethod: 'SLA',
        quantity: 1,
        requirements,
      });
    });
    expect(orderapi.uploadAsset.mock.invocationCallOrder[0]).toBeLessThan(
      orderapi.createOrder.mock.invocationCallOrder[0],
    );
  });

  it('creates an order from the selected file and default address', async () => {
    renderOrderPrintingPage();

    const requirements = '검정색으로 출력해 주세요.';

    selectModelFile();
    selectPrintType('레진');
    enterRequirements(requirements);
    clickCreateOrder();

    await waitFor(() => {
      expect(orderapi.createOrder).toHaveBeenCalledWith({
        assetId: 88,
        addressId: 5,
        manufacturingMethod: 'SLA',
        quantity: 1,
        requirements,
      });
    });
  });

  it('returns to the asset page after creating an order', async () => {
    renderOrderPrintingPage();

    selectModelFile();
    clickCreateOrder();

    await waitFor(() => {
      expect(orderapi.createOrder).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/asset');
    });
  });

  it('does not create an order when asset upload fails', async () => {
    vi.mocked(orderapi.uploadAsset).mockRejectedValue(new Error('업로드 실패'));
    renderOrderPrintingPage();

    selectModelFile(createModelFile('broken-model.stl'));
    clickCreateOrder();

    await waitFor(() => {
      expect(orderapi.uploadAsset).toHaveBeenCalled();
      expect(orderapi.createOrder).not.toHaveBeenCalled();
      expect(globalThis.alert).toHaveBeenCalledWith('업로드 실패');
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/asset');
  });

  it('shows address-management actions when no default address exists', async () => {
    vi.mocked(addressService.getAddresses).mockResolvedValue({ data: [] });
    renderOrderPrintingPage();

    selectModelFile();
    clickCreateOrder();

    expect(await screen.findByText('기본 배송지를 먼저 등록해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '이동하기' }));

    expect(mockNavigate).toHaveBeenCalledWith('/member/edit', {
      state: { activeMenu: '배송지 관리' },
    });
  });
});
