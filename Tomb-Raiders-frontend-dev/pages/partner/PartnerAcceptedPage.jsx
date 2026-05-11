import React, { useState, useEffect } from 'react';
import PartnerSidebar from '../../components/Partner/PartnerSidebar';
import PartnerFilterDropdown from '../../components/Partner/PartnerFilterDropdown';
import AcceptedTable from '../../components/Partner/AcceptedTable';
import AcceptedOrderDetail from '../../components/Partner/AcceptedOrderDetail';
import { vw } from '../../utils/style';
import { post } from '../../api/apiClient';
import { partnerapi } from '../../api/partnerapi';
import { usePartnerModals } from '../../hooks/usePartnerModals';

const PAGE_SIZE = 20;

const normalizeData = (payload) => {
  if (!payload) return null;
  return payload.data !== undefined ? payload.data : payload;
};

const normalizeAcceptedOrders = (payload) => {
  const data = normalizeData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const normalizePageInfo = (payload, fallbackPage = 0, fallbackSize = PAGE_SIZE) => {
  const data = normalizeData(payload);
  const page = data?.page || payload?.page || data || {};
  const content = normalizeAcceptedOrders(payload);
  const currentPage = Number(page.number ?? fallbackPage);
  const totalPages = Number(page.totalPages ?? (content.length > 0 ? 1 : 0));

  return {
    page: currentPage,
    size: Number(page.size ?? fallbackSize),
    totalPages,
    totalElements: Number(page.totalElements ?? content.length),
  };
};

function PartnerAcceptedPage() {
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
  });

  const { showAlert, showConfirm, PartnerModals } = usePartnerModals();

  // 💡 마찬가지로 useCallback 삭제!
  const fetchAcceptedOrders = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const result = await partnerapi.getSelectedOrders({
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
      });
      if (result?.isSuccess === false) {
        throw new Error(result?.errorDetail?.message || 'Failed to load accepted partner orders.');
      }

      const data = normalizeAcceptedOrders(result);
      const nextPageInfo = normalizePageInfo(result, page, PAGE_SIZE);
      setAcceptedOrders(data);
      setFilteredOrders(data);
      setPageInfo(nextPageInfo);
      setSelectedOrderIds([]);
      setSelectedOrder(null);
    } catch (error) {
      console.error('조회 실패:', error);
      showAlert('🚨', '조회 실패', '수락된 의뢰 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 빈 배열을 강제하여 무한 호출 원천 차단!
  useEffect(() => {
    fetchAcceptedOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (nextPageNumber) => {
    const nextPage = Number(nextPageNumber) - 1;
    const totalPages = Math.max(Number(pageInfo.totalPages || 0), 1);
    if (isLoading || nextPage < 0 || nextPage >= totalPages || nextPage === currentPage) return;
    setCurrentPage(nextPage);
  };

  const handleFilterChange = (status) => {
    if (!status) setFilteredOrders(acceptedOrders);
    else setFilteredOrders(acceptedOrders.filter((order) => order.status === status));
  };

  const handleCancelOrders = () => {
    if (selectedOrderIds.length === 0)
      return showAlert('⚠️', '선택 필요', '취소할 의뢰를 먼저 체크해주세요.');
    showConfirm(
      '❓',
      '의뢰 취소',
      `${selectedOrderIds.length}건의 의뢰를 정말 취소하시겠습니까?`,
      async () => {
        try {
          await Promise.all(
            selectedOrderIds.map((orderId) => post(`/v1/partners/orders/${orderId}/reject`)),
          );
          showAlert('✅', '취소 완료', '선택한 의뢰가 취소되었습니다.');
          fetchAcceptedOrders();
        } catch (error) {
          console.error('의뢰 취소 실패:', error);
          showAlert('🚨', '오류 발생', '일부 의뢰를 취소하지 못했습니다.');
        }
      },
    );
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
        className="flex-1 flex flex-col items-center relative"
        style={{ padding: `${vw(50)} ${vw(80)}` }}
      >
        <div className="w-full relative" style={{ maxWidth: vw(1400) }}>
          <h2 className="font-bold text-left" style={{ fontSize: vw(20), marginBottom: vw(40) }}>
            의뢰 수락 목록
          </h2>

          <div style={{ marginBottom: vw(32) }}>
            <PartnerFilterDropdown onFilterChange={handleFilterChange} />
          </div>

          <div className="flex justify-between items-end" style={{ marginBottom: vw(12) }}>
            <div className="font-medium text-gray-800" style={{ fontSize: vw(14) }}>
              의뢰 내역 : {filteredOrders.length}건
            </div>
            <button
              type="button"
              onClick={() => fetchAcceptedOrders(currentPage)}
              disabled={isLoading}
              className="text-[#2C9753] flex items-center hover:underline cursor-pointer border-none bg-transparent p-0 disabled:opacity-50 disabled:cursor-wait"
              style={{ fontSize: vw(14), gap: vw(4) }}
            >
              새로고침{' '}
              <span
                className={`inline-block ${isLoading ? 'animate-spin' : ''}`}
                style={{ fontSize: vw(16) }}
              >
                ↻
              </span>
            </button>
          </div>

          <section style={{ marginBottom: vw(64), paddingBottom: vw(60), position: 'relative' }}>
            <AcceptedTable
              orders={filteredOrders}
              isLoading={isLoading}
              selectedOrder={selectedOrder}
              selectedOrderIds={selectedOrderIds}
              onSelectOrder={handleSelectOrder}
              onSelectionChange={setSelectedOrderIds}
              pagination={{
                currentPage: Number(pageInfo.page ?? currentPage) + 1,
                totalPages: Math.max(Number(pageInfo.totalPages || 0), 1),
                onPageChange: handlePageChange,
              }}
            />

            <div className="absolute right-0 flex" style={{ bottom: 0, gap: vw(12) }}>
              <button
                type="button"
                onClick={handleCancelOrders}
                className="bg-[#757575] text-white transition-colors hover:bg-gray-600 border-none cursor-pointer"
                style={{ padding: `${vw(8)} ${vw(24)}`, fontSize: vw(13), borderRadius: vw(4) }}
              >
                의뢰 취소
              </button>
            </div>
          </section>

          <section>
            <AcceptedOrderDetail selectedOrder={selectedOrder} />
          </section>
        </div>
      </main>

      {PartnerModals}
    </div>
  );
}

export default PartnerAcceptedPage;
