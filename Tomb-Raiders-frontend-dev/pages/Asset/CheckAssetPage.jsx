import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { commissionapi } from '../../api/commissionapi';
import { orderapi } from '../../api/orderapi';
import { convertToSafeImage } from '../../utils/imageUtils';
import CommissionHeader from '../../components/Commission/CommissionHeader';
import CheckListActions from '../../components/Commission/CheckListActions';
import CheckListContent from '../../components/Commission/CheckListContent';
import {
  PAGE_SIZE,
  createCheckListStyles,
  getCommissionPreviewImage,
  getCommissionStatus,
  getCommissionTitle,
  getVisiblePageNumbers,
  getVw,
  isPaymentCompleted,
  normalizeStatusValue,
} from '../../components/Commission/checkListShared';

const ASSET_CREATING_STATUS = 'AI_ASSET_CREATING';
const ASSET_STATUS_DISPLAY = {
  AI_ASSET_CREATING: { label: '에셋 생성 중', color: '#F59E0B', bgColor: '#FEF3C7' },
  AI_ASSET_CREATED: { label: '에셋 생성 완료', color: '#2C9753', bgColor: '#E6F4EA' },
  AI_ASSET_RECREATING: { label: '에셋 재생성 중', color: '#F59E0B', bgColor: '#FEF3C7' },
  AI_ASSET_RECREATED: { label: '에셋 재생성 완료', color: '#2C9753', bgColor: '#E6F4EA' },
  ORDER_QUOTING: { label: '견적 진행 중', color: '#6E4AFF', bgColor: '#F0EFFF' },
  ORDER_QUOTED: { label: '견적 완료', color: '#6E4AFF', bgColor: '#F0EFFF' },
  PAYMENT_QUEUED: { label: '결제 대기', color: '#6E4AFF', bgColor: '#F0EFFF' },
  PAYMENT_PAID: { label: '결제 완료', color: '#2C9753', bgColor: '#E6F4EA' },
  FAILED: { label: '작업 실패', color: '#FF4D4F', bgColor: '#FEE2E2' },
  ERROR: { label: '시스템 오류', color: '#FF4D4F', bgColor: '#FEE2E2' },
  CANCELED: { label: '취소됨', color: '#777777', bgColor: '#F3F4F6' },
};

const isAssetPaymentCompleted = (item) =>
  [item?.assetStatus, item?.status, item?.paymentStatus, item?.orderStatus].some(
    isPaymentCompleted,
  );

const getAssetStatus = (item) => {
  const assetStatus = normalizeStatusValue(item?.assetStatus);

  if (isPaymentCompleted(assetStatus))
    return { label: '결제 완료', color: '#2C9753', bgColor: '#E6F4EA' };

  return ASSET_STATUS_DISPLAY[assetStatus] || getCommissionStatus(item?.status);
};

const isAssetCreating = (item) =>
  [item?.assetStatus, item?.status].some(
    (status) => normalizeStatusValue(status) === ASSET_CREATING_STATUS,
  );

const buildEstimateOrderState = (item, fetchedOrder = {}) => {
  const orderId = fetchedOrder.orderId ?? fetchedOrder.id ?? item.orderId;
  const commissionId = fetchedOrder.commissionId ?? item.commissionId;
  const quotations = fetchedOrder.quotations ?? fetchedOrder.quotationList ?? item.quotations;

  return {
    ...fetchedOrder,
    orderId,
    id: orderId,
    commissionId,
    assetId: fetchedOrder.assetId ?? item.assetId,
    title: fetchedOrder.title || fetchedOrder.requirements || getCommissionTitle(item),
    style: fetchedOrder.style || item.style,
    img:
      fetchedOrder.img ||
      fetchedOrder.imageUrl ||
      fetchedOrder.assetImageUrl ||
      fetchedOrder.assetImagePath ||
      item.aiImageUrl ||
      item.imageUrl ||
      item.inputImageUrl,
    quantity: fetchedOrder.quantity || item.quantity || 1,
    status: fetchedOrder.status || item.status,
    assetStatus: fetchedOrder.assetStatus || item.assetStatus,
    paymentStatus: fetchedOrder.paymentStatus || item.paymentStatus,
    orderStatus: fetchedOrder.orderStatus || item.orderStatus,
    quotations,
  };
};

const normalizeOrderLookupResult = (result) => {
  if (result?.isSuccess === false) {
    throw new Error(result?.errorDetail?.message || '주문 정보를 불러오지 못했습니다.');
  }

  const order = Object.prototype.hasOwnProperty.call(result || {}, 'data') ? result.data : result;
  if (!order) throw new Error('주문 정보를 찾을 수 없습니다.');

  return order;
};

const normalizeAssetItem = (item) => {
  const commission = item?.commission || {};
  const order = item?.order || {};
  const assetId = item?.assetId ?? item?.id ?? null;
  const commissionId = item?.commissionId ?? commission?.commissionId ?? commission?.id ?? null;
  const orderId = item?.orderId ?? order?.orderId ?? order?.id ?? null;
  const assetImageUrl =
    item?.assetImageUrl ||
    item?.imageUrl ||
    commission?.assetImageUrl ||
    commission?.imageUrl ||
    '';
  let quotations = [];

  if (Array.isArray(item?.quotations)) {
    quotations = item.quotations;
  } else if (Array.isArray(order?.quotations)) {
    quotations = order.quotations;
  }

  return {
    ...commission,
    ...item,
    id: assetId ?? commissionId,
    assetId,
    commissionId,
    orderId,
    title: item?.title || commission?.title || (assetId ? `Asset #${assetId}` : ''),
    style: item?.style || commission?.style,
    assetStatus: item?.assetStatus || commission?.assetStatus || order?.assetStatus,
    status: item?.status || commission?.status || order?.status,
    paymentStatus: item?.paymentStatus || order?.paymentStatus,
    orderStatus: item?.orderStatus || order?.orderStatus,
    createdAt: item?.createdAt || commission?.createdAt || order?.createdAt,
    imageUrl: assetImageUrl,
    inputImageUrl: item?.inputImageUrl || commission?.inputImageUrl || '',
    aiImageUrl: item?.aiImageUrl || commission?.aiImageUrl || assetImageUrl,
    quotations,
  };
};

const normalizeAssetPage = (payload) => {
  let content = [];

  if (Array.isArray(payload?.content)) {
    content = payload.content;
  } else if (Array.isArray(payload)) {
    content = payload;
  }

  const page = payload?.page || {};
  const number = Number(page.number ?? payload?.number ?? 0);
  const totalPages = Number(page.totalPages ?? payload?.totalPages ?? 0);

  return {
    content: content.map(normalizeAssetItem),
    number,
    size: Number(page.size ?? payload?.size ?? PAGE_SIZE),
    totalPages,
    totalElements: Number(page.totalElements ?? payload?.totalElements ?? content.length),
    first: number <= 0,
    last: totalPages === 0 || number >= totalPages - 1,
  };
};

function CommissionListPage() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  const totalPages = Math.max(Number(pageInfo.totalPages || 0), 1);
  const visiblePageNumbers = getVisiblePageNumbers(
    Number(pageInfo.page ?? currentPage),
    totalPages,
  );

  const loadAssets = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);

    try {
      const result = await orderapi.getAssets({
        page,
        size: PAGE_SIZE,
        sort: ['createdAt,desc'],
        commission: false,
      });

      if (!result?.isSuccess) {
        throw new Error(result?.errorDetail?.message || 'Failed to load assets.');
      }

      const normalizedPage = normalizeAssetPage(result.data);
      setAssets(normalizedPage.content);
      setPageInfo({
        page: normalizedPage.number,
        size: normalizedPage.size,
        totalPages: normalizedPage.totalPages,
        totalElements: normalizedPage.totalElements,
        isFirst: normalizedPage.first,
        isLast: normalizedPage.last,
      });

      return normalizedPage.content;
    } catch (err) {
      setAssets([]);
      setPageInfo({
        page,
        size: PAGE_SIZE,
        totalPages: 0,
        totalElements: 0,
        isFirst: page === 0,
        isLast: true,
      });
      setError(err.message || 'Failed to load assets.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets(currentPage);
  }, [currentPage, loadAssets]);

  const assetItems = assets;

  const handleNewCommission = () => navigate('/order-printing');

  // 💡 [핵심 복구!] 견적서가 있는 의뢰만 남았으므로 바로 견적 디테일로 보내줍니다.
  const handleOpenCommission = async (item) => {
    if (isAssetCreating(item)) return;

    const openPaymentDetail = (order) => {
      const paymentOrderId = order.orderId || item.orderId || item.commissionId || item.assetId;

      navigate(`/payments/${encodeURIComponent(paymentOrderId)}`, {
        state: {
          commissionId: order.commissionId,
          orderId: order.orderId,
          order,
        },
      });
    };

    if (isAssetPaymentCompleted(item) && item.orderId) {
      openPaymentDetail(buildEstimateOrderState(item));
      return;
    }

    if (!item.assetId) {
      setError('주문을 조회할 에셋 ID가 없습니다.');
      return;
    }

    try {
      const result = await orderapi.getOrderByAsset(item.assetId);
      const fetchedOrder = normalizeOrderLookupResult(result);
      const order = buildEstimateOrderState(item, fetchedOrder || {});

      if (isAssetPaymentCompleted(item) || isAssetPaymentCompleted(order)) {
        openPaymentDetail(order);
        return;
      }

      const detailPath = order.orderId
        ? `/orders/estimate-detail/${order.orderId}`
        : '/orders/estimate-detail';

      navigate(detailPath, {
        state: {
          returnTo,
          commissionId: order.commissionId,
          orderId: order.orderId,
          order,
        },
      });
    } catch (err) {
      setError(err.message || '주문 정보를 불러오지 못했습니다.');
    }
  };

  const handleDeleteCommission = async (e, item) => {
    e.stopPropagation();
    const shouldDelete = globalThis.confirm?.('이 의뢰를 삭제하시겠습니까?') ?? false;
    if (!shouldDelete) return;

    await commissionapi.deleteCommission(item.commissionId);

    const previousPage = currentPage > 0 && assets.length === 1 ? currentPage - 1 : currentPage;
    if (previousPage !== currentPage) {
      setLoading(true);
      setCurrentPage(previousPage);
      return;
    }

    await loadAssets(currentPage);
  };

  const handlePageChange = (nextPage) => {
    if (loading || nextPage < 0 || nextPage >= totalPages || nextPage === currentPage) return;
    setLoading(true);
    setCurrentPage(nextPage);
  };

  const getAssetCardActionStyle = (item) =>
    isAssetCreating(item)
      ? { ...S.cardActionBtn, cursor: 'not-allowed', opacity: 0.7 }
      : S.cardActionBtn;

  return (
    <div style={S.pageStyle}>
      <CommissionHeader
        title=""
        compactTitleSection
        backButtonLeft={S.assetBackButtonLeft}
        backButtonTop={S.assetBackButtonTop}
        backButtonTransform="translateX(-100%)"
      />
      <main style={S.mainStyle}>
        <CheckListActions
          styles={S}
          onNewProject={handleNewCommission}
          menuItems={[
            { label: '주문 목록', onClick: () => navigate('/payments/history') },
            { label: 'Commissions 목록', onClick: () => navigate('/commissions') },
            {
              label: '다른 모델 보러가기',
              description: '(게시판으로 연결)',
              onClick: () => navigate('/bulletinboard'),
            },
          ]}
        />

        <section style={S.listSection}>
          <h2 style={S.listHeaderTitle}>목록 ({assetItems.length})</h2>
          <CheckListContent
            styles={S}
            items={assetItems}
            loading={loading}
            error={error}
            emptyMessage="도착한 견적서가 없습니다."
            totalPages={totalPages}
            currentPage={currentPage}
            visiblePageNumbers={visiblePageNumbers}
            onPageChange={handlePageChange}
            getKey={(item) => item.assetId ?? item.commissionId}
            getTitle={getCommissionTitle}
            getStatus={getAssetStatus}
            getImageSrc={(item) => convertToSafeImage(getCommissionPreviewImage(item))}
            isDisabled={isAssetCreating}
            getCardActionStyle={getAssetCardActionStyle}
            onOpen={handleOpenCommission}
            onDelete={handleDeleteCommission}
          />
        </section>
      </main>
    </div>
  );
}

// --- 스타일 정의 (회원님이 수정한 디자인 100% 유지) ---
const S = createCheckListStyles({
  assetBackButtonLeft: `calc((100% - ${getVw(1200)}) / 2 - ${getVw(160)})`,
  assetBackButtonTop: `calc(100% + ${getVw(28)})`,
});

export default CommissionListPage;
