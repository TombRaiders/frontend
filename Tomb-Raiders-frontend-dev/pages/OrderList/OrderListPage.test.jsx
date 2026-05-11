// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PropTypes from 'prop-types';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';
import { orderapi } from '../../api/orderapi';
import OrderListPage from './OrderListPage';

vi.mock('../../api/orderapi', () => ({
  orderapi: {
    getPayments: vi.fn(),
  },
}));

vi.mock('../../components/OrderList/OrderFilter', () => {
  function MockOrderFilter({ filter, setFilter }) {
    return (
      <div data-testid="order-filter">
        <span>Current filter: {filter}</span>
        <button type="button" onClick={() => setFilter('1 month')}>
          Change filter
        </button>
      </div>
    );
  }

  MockOrderFilter.propTypes = {
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
  };

  return { default: MockOrderFilter };
});

vi.mock('../../components/OrderList/OrderTable', () => {
  function MockOrderTable({ orders }) {
    return (
      <div data-testid="order-table">
        {orders.map((order) => (
          <div key={order.id}>
            <img src={order.assetImagePath || order.img} alt="thumb" />
            <span>{order.title}</span>
          </div>
        ))}
      </div>
    );
  }

  MockOrderTable.propTypes = {
    orders: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        img: PropTypes.string,
        assetImagePath: PropTypes.string,
      }),
    ).isRequired,
  };

  return { default: MockOrderTable };
});

describe('OrderListPage payment history', () => {
  const payments = [
    {
      paymentId: 1,
      commissionId: 101,
      assetId: 201,
      itemQuantity: 1,
      itemPrice: 10000,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
      assetImagePath: 'https://cdn.example.com/assets/payment-1.png',
    },
    {
      paymentId: 2,
      commissionId: 102,
      assetId: 202,
      itemQuantity: 2,
      itemPrice: 20000,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
    },
    {
      paymentId: 3,
      commissionId: 103,
      assetId: 203,
      itemQuantity: 3,
      itemPrice: 30000,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
    },
    {
      paymentId: 4,
      commissionId: 104,
      assetId: 204,
      itemQuantity: 4,
      itemPrice: 40000,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
    },
    {
      paymentId: 5,
      commissionId: 105,
      assetId: 205,
      itemQuantity: 5,
      itemPrice: 50000,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
    },
    {
      paymentId: 6,
      commissionId: 106,
      assetId: 206,
      itemQuantity: 6,
      itemPrice: 60000,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.innerWidth = 1920;
    vi.mocked(orderapi.getPayments).mockImplementation(({ page, size }) =>
      Promise.resolve({
        isSuccess: true,
        data: {
          content: payments.slice(page * size, page * size + size),
          page: {
            size,
            number: page,
            totalElements: payments.length,
            totalPages: Math.ceil(payments.length / size),
          },
        },
      }),
    );
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<OrderListPage />} />
        </Routes>
      </MemoryRouter>,
    );

  test('loads the first payment page from the payments API', async () => {
    renderPage();

    expect(await screen.findByText('Commission #101')).toBeInTheDocument();
    expect(screen.getByTestId('order-table').children).toHaveLength(5);
    expect(screen.getAllByAltText('thumb')[0]).toHaveAttribute(
      'src',
      'https://cdn.example.com/assets/payment-1.png',
    );
    expect(screen.getByText('결제 조회 : 6')).toBeInTheDocument();
    expect(orderapi.getPayments).toHaveBeenCalledWith({
      page: 0,
      size: 5,
      sort: 'createdAt,desc',
    });
  });

  test('loads the next server page when page 2 is selected', async () => {
    renderPage();

    await screen.findByText('Commission #101');
    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(await screen.findByText('Commission #106')).toBeInTheDocument();
    expect(screen.getByTestId('order-table').children).toHaveLength(1);
    expect(orderapi.getPayments).toHaveBeenLastCalledWith({
      page: 1,
      size: 5,
      sort: 'createdAt,desc',
    });
  });

  test('shows an empty state when there are no payments', async () => {
    vi.mocked(orderapi.getPayments).mockResolvedValueOnce({
      isSuccess: true,
      data: {
        content: [],
        page: {
          size: 5,
          number: 0,
          totalElements: 0,
          totalPages: 0,
        },
      },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('결제 내역이 없습니다.')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('order-table')).not.toBeInTheDocument();
  });
});
