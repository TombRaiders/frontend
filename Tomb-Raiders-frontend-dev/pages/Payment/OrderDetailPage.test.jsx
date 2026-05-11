import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import PropTypes from 'prop-types';
import OrderDetailPage from './OrderDetailPage';
import { orderapi } from '../../api/orderapi';

// 📍 1. useNavigate Spy 설정 (모든 이동 테스트의 해결사)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate, // navigate 호출 시 mockNavigate가 실행됨
  };
});

vi.mock('../../api/orderapi', () => ({
  orderapi: {
    getPaymentDetail: vi.fn(),
    getOrderDetail: vi.fn(),
    getOrders: vi.fn(),
  },
}));

// 2. 스타일 및 하위 컴포넌트 모킹 (기존과 동일)
vi.mock('../../components/Payment/OrderDetail.style', () => ({
  S: {
    vw: (size) => `${size}px`,
    container: {},
    header: {},
    backBtn: {},
    contentWrapper: {},
    whiteBox: {},
    row: {},
    label: {},
    value: {},
    hr: {},
    productSummary: {},
    summaryImg: {},
    btnWhite: {},
    btnOrange: {},
    bottomBtnArea: {},
  },
}));

vi.mock('../../components/Payment/OrderInfoSection', () => {
  function MockOrderInfoSection({ title, rows = [], total }) {
    return (
      <div data-testid="info-section">
        <h3>{title}</h3>
        {rows.map((r) => (
          <div key={r.label}>
            {r.label}: {r.value}
          </div>
        ))}
        {total && <div>합계: {total}</div>}
      </div>
    );
  }
  MockOrderInfoSection.propTypes = {
    title: PropTypes.string,
    rows: PropTypes.array.isRequired,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };
  return { default: MockOrderInfoSection };
});

describe('OrderDetailPage 통합 테스트', () => {
  const mockOrderData = {
    id: 'ORD-2026-0310',
    orderDate: '2026-03-10T14:05:30',
    title: '나만의 고양이 피규어',
    img: 'cat.jpg',
    status: '배송중',
    buyerName: '테스터',
    price: 50000,
    shippingFee: 3000,
    receiver: '받는사람',
    address: '서울시 강남구',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderapi.getPaymentDetail).mockResolvedValue(null);
    vi.mocked(orderapi.getOrderDetail).mockResolvedValue(null);
    vi.mocked(orderapi.getOrders).mockResolvedValue({ data: { content: [] } });
  });

  // 📍 Routes 없이 단독 렌더링 (이동은 mockNavigate로 확인)
  const renderPage = (state) => {
    const pageState = state === undefined ? { order: mockOrderData } : state;
    return render(
      <MemoryRouter initialEntries={[{ pathname: '/order-detail', state: pageState }]}>
        <OrderDetailPage />
      </MemoryRouter>,
    );
  };

  const renderRoutePage = (initialPath = '/order-detail/40') =>
    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/order-detail/:id" element={<OrderDetailPage />} />
          <Route path="/payments/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

  test('/payments/:id route loads payment detail by payment id', async () => {
    vi.mocked(orderapi.getPaymentDetail).mockResolvedValue({
      data: {
        orderId: 1,
        paymentDate: '2026-05-07T10:20:30',
        commissionId: 101,
        commissionStatus: 'COMPLETED',
        commissionImagePath: 'https://cdn.example.com/commissions/101.png',
        assetId: 201,
        assetStatus: 'PRINTED',
        itemPrice: 12000,
        itemQuantity: 2,
        deliveryFee: 3000,
        assetImagePath: 'https://cdn.example.com/assets/payment-1.png',
        sender: 'Partner A',
        senderContactInfo: '02-111-2222',
        pgProvider: 'TOSS',
        recipient: 'Recipient A',
        recipientContactInfo: '010-1111-2222',
        recipientAddress: 'Seoul Gangnam 101',
        recipientRequirements: 'Leave at the door',
      },
    });

    renderRoutePage('/payments/1');

    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(screen.getByText('Commission #101')).toBeInTheDocument();
    expect(screen.getByText('2026-05-07 10:20')).toBeInTheDocument();
    expect(screen.getByText(/Partner A/)).toBeInTheDocument();
    expect(screen.getByText(/02-111-2222/)).toBeInTheDocument();
    expect(screen.getByText(/TOSS/)).toBeInTheDocument();
    expect(screen.getByText(/12,000/)).toBeInTheDocument();
    expect(screen.getByText(/3,000/)).toBeInTheDocument();
    expect(screen.getByText(/Recipient A/)).toBeInTheDocument();
    expect(screen.getByText(/010-1111-2222/)).toBeInTheDocument();
    expect(screen.getByText(/Seoul Gangnam 101/)).toBeInTheDocument();
    expect(screen.getByText(/Leave at the door/)).toBeInTheDocument();
    await waitFor(() => {
      expect(orderapi.getPaymentDetail).toHaveBeenCalledWith('1');
      expect(orderapi.getOrderDetail).not.toHaveBeenCalled();
    });
  });

  test('/payments/:id route refreshes payment detail even when navigation state exists', async () => {
    vi.mocked(orderapi.getPaymentDetail).mockResolvedValue({
      data: {
        paymentId: 1,
        commissionId: 999,
        itemPrice: 15000,
        paymentStatus: 'PAID',
      },
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/payments/1',
            state: { order: { paymentId: 1, title: 'Cached payment', itemPrice: 1000 } },
          },
        ]}
      >
        <Routes>
          <Route path="/payments/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Commission #999')).toBeInTheDocument();
    expect(orderapi.getPaymentDetail).toHaveBeenCalledWith('1');
  });

  test('전달된 주문 데이터가 화면에 노출되는가?', () => {
    renderPage();
    expect(screen.getByText('ORD-2026-0310')).toBeInTheDocument();
    expect(screen.getByText('2026-03-10 14:05')).toBeInTheDocument();
  });

  test('결제 날짜는 paidAt 값을 우선 yyyy-mm-dd hh:mm 형식으로 표시한다', () => {
    renderPage({
      order: {
        ...mockOrderData,
        orderDate: '2026-03-10T14:05:30',
        paidAt: '2026-04-27T20:31:45',
      },
    });

    expect(screen.getByText('2026-04-27 20:31')).toBeInTheDocument();
  });

  test('URL 주문 상세 진입 시 주문 목록에서 실제 주문 정보를 복구한다', async () => {
    vi.mocked(orderapi.getOrders).mockResolvedValue({
      data: {
        content: [
          {
            orderId: 24,
            status: 'PAID',
            requirements: '의뢰 대상: 40',
            quantity: 1,
            updatedAt: '2026-04-27T20:31:45',
            addressCode: '26406',
            address: '원문로 100번길 90',
            detailAddress: '덕원아파트 101동 908호',
            quotations: [{ quotationId: 14, price: 11000, selected: true }],
          },
        ],
      },
    });

    renderRoutePage('/order-detail/40');

    expect(await screen.findByText('24')).toBeInTheDocument();
    expect(screen.getByText('의뢰 대상: 40')).toBeInTheDocument();
    expect(screen.getByText('2026-04-27 20:31')).toBeInTheDocument();
    expect(screen.getByText('상품 금액: 11,000원')).toBeInTheDocument();
    expect(
      screen.getByText('받는 주소: (26406) 원문로 100번길 90 덕원아파트 101동 908호'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(orderapi.getOrderDetail).toHaveBeenCalledWith('40');
      expect(orderapi.getOrders).toHaveBeenCalled();
    });
  });

  test('하단 버튼 클릭 시 /payments/history 경로로 이동하는가?', async () => {
    renderPage();

    const backBtn = screen.getByText('주문목록 돌아가기');

    await act(async () => {
      fireEvent.click(backBtn);
    });

    // 📍 DOM이 바뀌었는지 확인하는 대신, 함수 호출을 확인
    expect(mockNavigate).toHaveBeenCalledWith('/payments/history');
  });

  test('홈으로 버튼 클릭 시 / 경로로 이동하는가?', async () => {
    renderPage();

    const homeBtn = screen.getByText('홈으로');

    await act(async () => {
      fireEvent.click(homeBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('order 데이터가 없을 경우 예외 문구가 보이고 목록 이동이 작동하는가?', async () => {
    renderPage(null); // order: null 전달

    expect(screen.getByText('주문 정보를 찾을 수 없습니다.')).toBeInTheDocument();

    const listBtn = screen.getByRole('button', { name: '주문목록으로 가기' });

    await act(async () => {
      fireEvent.click(listBtn);
    });

    // 컴포넌트 로직에 따라 '/check' 또는 '/' 등 호출 확인
    expect(mockNavigate).toHaveBeenCalled();
  });
});
