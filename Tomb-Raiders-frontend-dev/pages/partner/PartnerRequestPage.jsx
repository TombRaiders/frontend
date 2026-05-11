import React, { useCallback, useEffect, useState } from 'react';
import PartnerSidebar from '../../components/Partner/PartnerSidebar';
import RequestTable from '../../components/Partner/RequestTable';
import EstimateSection from '../../components/Partner/EstimateSection';
import { partnerapi } from '../../api/partnerapi';
import { vw } from '../../utils/style';
import { usePartnerModals } from '../../hooks/usePartnerModals';

const PAGE_SIZE = 10;

const ORDER_STATUS_FILTERS = [
  { value: '', label: '전체' },
  { value: 'REQUESTED', label: '견적대기' },
  { value: 'QUOTED', label: '견적 완료' },
  { value: 'PAID', label: '결제 완료' },
  { value: 'PRODUCING', label: '제작 중' },
  { value: 'PRODUCTION_COMPLETED', label: '제작 완료' },
  { value: 'SHIPPING', label: '배송 중' },
  { value: 'DELIVERED', label: '배송 완료' },
  { value: 'CANCELED', label: '주문 취소' },
];

const normalizeData = (payload) => {
  if (!payload) return null;
  return payload.data !== undefined ? payload.data : payload;
};

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  const data = normalizeData(payload);
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const normalizePageInfo = (payload, fallbackPage = 0, fallbackSize = PAGE_SIZE) => {
  const data = normalizeData(payload);
  const page = data?.page || payload?.page || data || {};
  const content = normalizeList(payload);
  const currentPage = Number(page.number ?? fallbackPage);
  const totalPages = Number(page.totalPages ?? (content.length > 0 ? 1 : 0));

  return {
    page: currentPage,
    size: Number(page.size ?? fallbackSize),
    totalPages,
    totalElements: Number(page.totalElements ?? content.length),
  };
};

function PartnerRequestPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('REQUESTED');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
  });

  const { showAlert, showConfirm, PartnerModals } = usePartnerModals();

  const fetchOrders = useCallback(
    async (page = currentPage, status = selectedStatus) => {
      setIsLoading(true);

      try {
        const [ordersResult, partnerInfoResult] = await Promise.all([
          partnerapi.getPartnerOrders({
            page,
            size: PAGE_SIZE,
            sort: ['createdAt,desc'],
            ...(status ? { status } : {}),
          }),
          partnerapi.getPartnerInfo().catch(() => null),
        ]);

        if (ordersResult?.isSuccess === false) {
          throw new Error(ordersResult?.errorDetail?.message || 'Failed to load partner orders.');
        }

        const nextOrders = normalizeList(ordersResult);
        const nextPageInfo = normalizePageInfo(ordersResult, page, PAGE_SIZE);
        const partnerInfo = normalizeData(partnerInfoResult);

        setOrders(nextOrders);
        setPageInfo(nextPageInfo);
        setPartnerName(partnerInfo?.name || '');

        setSelectedOrder((previousOrder) => {
          if (!previousOrder) return null;

          const matchedOrder = nextOrders.find(
            (order) => String(order?.orderId || '') === String(previousOrder?.orderId || ''),
          );

          return matchedOrder ? { ...matchedOrder, ...previousOrder } : null;
        });
      } catch (error) {
        console.error('주문 목록 조회 실패:', error);
        showAlert('오류', '조회 실패', '주문 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, selectedStatus, showAlert],
  );

  useEffect(() => {
    fetchOrders(currentPage, selectedStatus);
  }, [currentPage, selectedStatus, fetchOrders]);

  const handlePageChange = (nextPageNumber) => {
    const nextPage = Number(nextPageNumber) - 1;
    const totalPages = Math.max(Number(pageInfo.totalPages || 0), 1);
    if (isLoading || nextPage < 0 || nextPage >= totalPages || nextPage === currentPage) return;
    setCurrentPage(nextPage);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setSelectedOrder(null);
    setCurrentPage(0);
  };

  const handleSelectOrder = async (orderSummary) => {
    if (!orderSummary?.orderId) {
      setSelectedOrder(null);
      return;
    }

    setSelectedOrder(orderSummary);

    try {
      const detailResult = await partnerapi.getPartnerOrderDetail(orderSummary.orderId);
      const orderDetail = normalizeData(detailResult);

      setSelectedOrder((previousOrder) => {
        if (
          previousOrder &&
          String(previousOrder?.orderId || '') !== String(orderSummary.orderId || '')
        ) {
          return previousOrder;
        }

        return {
          ...orderSummary,
          ...(orderDetail || {}),
        };
      });
    } catch (error) {
      console.error('주문 상세 조회 실패:', error);
      showAlert('오류', '상세 조회 실패', '주문 상세 정보를 불러오지 못했습니다.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <PartnerSidebar />
      <main
        className="flex-1 flex flex-col items-center"
        style={{ padding: `${vw(50)} ${vw(80)}` }}
      >
        <div className="w-full" style={{ maxWidth: vw(1400) }}>
          <h2 className="font-bold text-left" style={{ fontSize: vw(20), marginBottom: vw(40) }}>
            주문 확인
          </h2>

          <div className="flex justify-end" style={{ marginBottom: vw(24) }}>
            <label
              htmlFor="partner-order-status-filter"
              className="flex items-center text-gray-800"
              style={{ gap: vw(10), fontSize: vw(14) }}
            >
              의뢰 상태
              <select
                id="partner-order-status-filter"
                value={selectedStatus}
                onChange={handleStatusChange}
                disabled={isLoading}
                className="bg-white border border-[#BDBDBD] text-gray-800 focus:outline-none shadow-sm disabled:opacity-60 disabled:cursor-wait"
                style={{
                  width: vw(180),
                  padding: `${vw(8)} ${vw(12)}`,
                  borderRadius: vw(4),
                }}
              >
                {ORDER_STATUS_FILTERS.map((filter) => (
                  <option key={filter.value || 'ALL'} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex justify-between items-end" style={{ marginBottom: vw(12) }}>
            <div className="font-medium text-gray-800" style={{ fontSize: vw(14) }}>
              주문 목록 : {pageInfo.totalElements || orders.length}건
            </div>
            <button
              type="button"
              onClick={() => fetchOrders(currentPage, selectedStatus)}
              disabled={isLoading}
              className="text-[#2C9753] flex items-center hover:underline cursor-pointer border-none bg-transparent p-0 disabled:opacity-50 disabled:cursor-wait"
              style={{ fontSize: vw(14), gap: vw(4) }}
            >
              새로고침
              <span
                className={`inline-block ${isLoading ? 'animate-spin' : ''}`}
                style={{ fontSize: vw(16) }}
              >
                ↻
              </span>
            </button>
          </div>

          <section style={{ marginBottom: vw(64) }}>
            <RequestTable
              orders={orders}
              isLoading={isLoading}
              selectedOrder={selectedOrder}
              onSelectOrder={handleSelectOrder}
              refreshOrders={fetchOrders}
              showAlert={showAlert}
              showConfirm={showConfirm}
              pagination={{
                currentPage: Number(pageInfo.page ?? currentPage) + 1,
                totalPages: Math.max(Number(pageInfo.totalPages || 0), 1),
                onPageChange: handlePageChange,
              }}
            />
          </section>

          <section>
            <EstimateSection
              selectedOrder={selectedOrder}
              refreshOrders={fetchOrders}
              showAlert={showAlert}
              partnerName={partnerName}
            />
          </section>
        </div>
      </main>

      {PartnerModals}
    </div>
  );
}

export default PartnerRequestPage;
