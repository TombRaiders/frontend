import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderapi } from '../../api/orderapi';
import OrderFilter from '../../components/OrderList/OrderFilter';
import OrderTable from '../../components/OrderList/OrderTable';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;
const itemsPerPage = 5;

const mapPaymentToOrderRow = (payment) => ({
  id: payment.paymentId,
  title: payment.commissionId ? `Commission #${payment.commissionId}` : `Asset #${payment.assetId}`,
  img: payment.assetImagePath || '',
  status: payment.paymentStatus || payment.orderStatus,
  price: payment.itemPrice ?? 0,
  qty: payment.itemQuantity ?? 1,
  paymentId: payment.paymentId,
  assetImagePath: payment.assetImagePath || '',
  assetId: payment.assetId,
  commissionId: payment.commissionId,
  orderStatus: payment.orderStatus,
  paymentStatus: payment.paymentStatus,
});

function OrderListPage() {
  const [filter, setFilter] = useState('오늘');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const fetchPayments = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await orderapi.getPayments({
          page: currentPage - 1,
          size: itemsPerPage,
          sort: 'createdAt,desc',
        });
        const pageData = result?.data || {};
        const content = Array.isArray(pageData.content) ? pageData.content : [];
        const page = pageData.page || {};

        if (ignore) return;

        setOrders(content.map(mapPaymentToOrderRow));
        setTotalCount(Number(page.totalElements ?? content.length));
        setTotalPages(Number(page.totalPages ?? Math.ceil(content.length / itemsPerPage)) || 1);
      } catch (error) {
        if (ignore) return;
        console.error('Failed to fetch payments:', error);
        setOrders([]);
        setTotalCount(0);
        setTotalPages(1);
        setErrorMessage('결제 내역을 불러오지 못했습니다.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchPayments();

    return () => {
      ignore = true;
    };
  }, [currentPage]);

  const handleOrderClick = (order) => {
    navigate(`/payments/${order.id}`, { state: { order } });
  };

  const pageNumbers = new Array(totalPages).fill(null);
  let tableContent = (
    <div style={{ padding: vw(100), textAlign: 'center', color: '#999' }}>
      결제 내역이 없습니다.
    </div>
  );

  if (isLoading) {
    tableContent = (
      <div style={{ padding: vw(100), textAlign: 'center', color: '#999' }}>Loading...</div>
    );
  } else if (errorMessage) {
    tableContent = (
      <div style={{ padding: vw(100), textAlign: 'center', color: '#999' }}>{errorMessage}</div>
    );
  } else if (orders.length > 0) {
    tableContent = <OrderTable orders={orders} onOrderClick={handleOrderClick} />;
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <button type="button" onClick={() => navigate('/')} style={backBtnStyle}>
          &lt; 뒤로가기
        </button>
        <span style={{ fontSize: vw(20), fontWeight: 'bold', color: '#fff' }}>결제 목록</span>
        <div style={{ width: vw(80) }} />
      </header>

      <h2 style={titleStyle}>결제 목록/배송 조회</h2>
      <OrderFilter filter={filter} setFilter={setFilter} />

      <div style={tableWrapper}>
        <p style={subTitle}>결제 조회 : {totalCount}</p>
        {tableContent}
      </div>

      <div style={paginationStyle}>
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          style={pageArrowStyle}
          aria-label="이전 페이지"
        >
          &lt;
        </button>

        {pageNumbers.map((_, i) => (
          <button
            type="button"
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              ...pageBtnBaseStyle,
              fontWeight: currentPage === i + 1 ? 'bold' : 'normal',
              color: currentPage === i + 1 ? '#2C9753' : '#666',
              borderBottom: currentPage === i + 1 ? `2px solid #2C9753` : 'none',
            }}
          >
            {i + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          style={pageArrowStyle}
          aria-label="다음 페이지"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

const pageBtnBaseStyle = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  padding: `${vw(5)} ${vw(10)}`,
  fontSize: vw(18),
  margin: `0 ${vw(5)}`,
  transition: 'all 0.2s ease',
};
const pageArrowStyle = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: vw(20),
  padding: `0 ${vw(10)}`,
  color: '#666',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const headerStyle = {
  height: vw(70),
  backgroundColor: '#2C9753',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `0 ${vw(100)}`,
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1000,
  boxSizing: 'border-box',
};
const backBtnStyle = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: vw(16),
  color: '#fff',
};
const containerStyle = {
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#fff',
  padding: `${vw(120)} ${vw(100)} ${vw(50)}`,
  boxSizing: 'border-box',
};
const titleStyle = {
  textAlign: 'left',
  fontSize: vw(24),
  fontWeight: 'bold',
  marginBottom: vw(40),
};
const subTitle = { textAlign: 'left', fontSize: vw(18), marginBottom: vw(15) };
const tableWrapper = { marginTop: vw(40) };
const paginationStyle = {
  marginTop: vw(40),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: vw(18),
};

export default OrderListPage;
