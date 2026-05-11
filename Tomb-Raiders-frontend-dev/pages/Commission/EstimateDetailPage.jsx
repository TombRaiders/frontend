import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { orderapi } from '../../api/orderapi';
import { commissionapi } from '../../api/commissionapi';
import CommissionHeader from '../../components/Commission/CommissionHeader';
import { getCookie, setCookie } from '../../utils/authUtils';
import { convertToSafeImage } from '../../utils/imageUtils';

// --- 유틸리티 및 헬퍼 함수 ---
const getVw = (size) => {
  const width = globalThis.innerWidth || 1920;
  return (size / 1920) * width;
};

const normalizeData = (payload) => payload?.data || payload || null;

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
};

const ASSET_PAGE_SIZE = 20;

const extractCommissionIdFromText = (value) => {
  if (!value) return null;
  const matches = String(value).match(/\d+/g);
  return matches?.at(-1) || null;
};

const getOrderCommissionId = (order) =>
  order?.commissionId ||
  order?.commission?.commissionId ||
  order?.commission?.id ||
  order?.asset?.commissionId ||
  order?.asset?.commission?.commissionId ||
  order?.asset?.commission?.id ||
  extractCommissionIdFromText(order?.requirements) ||
  extractCommissionIdFromText(order?.title) ||
  null;

const getAssetImagePath = (source = {}) => {
  const asset = source?.asset || {};

  return (
    source?.asset_image_path ||
    source?.assetImagePath ||
    source?.assetImageUrl ||
    asset?.asset_image_path ||
    asset?.assetImagePath ||
    asset?.assetImageUrl ||
    ''
  );
};

const getAssetId = (source = {}) => {
  const asset = source?.asset || {};

  return (
    source?.assetId || source?.asset_id || asset?.assetId || asset?.asset_id || asset?.id || null
  );
};

const normalizeStatusValue = (status) =>
  String(status || '')
    .trim()
    .toUpperCase();

const isCanceledStatus = (status) =>
  ['CANCELED', 'CANCELLED'].includes(normalizeStatusValue(status));

const hasCanceledStatus = (source = {}) => {
  const asset = source?.asset || {};
  const commission = source?.commission || {};

  return [
    source?.assetStatus,
    source?.status,
    source?.orderStatus,
    source?.paymentStatus,
    asset?.assetStatus,
    asset?.status,
    asset?.orderStatus,
    asset?.paymentStatus,
    commission?.assetStatus,
    commission?.status,
  ].some(isCanceledStatus);
};

const getAssetCommissionId = (asset = {}) => {
  const commission = asset?.commission || {};

  return asset?.commissionId || asset?.commission_id || commission?.commissionId || commission?.id;
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
  const totalPages = Number(page.totalPages ?? payload?.totalPages ?? 1);

  return {
    content,
    number,
    last: Boolean(payload?.last) || totalPages === 0 || number >= totalPages - 1,
  };
};

const normalizeOrder = (order, fallbackOrder = {}) => {
  const normalized = normalizeData(order) || {};
  const orderId = normalized.orderId || normalized.id || fallbackOrder.orderId || fallbackOrder.id;

  return {
    ...fallbackOrder,
    ...normalized,
    id: orderId,
    orderId,
    commissionId:
      getOrderCommissionId(normalized) || fallbackOrder.commissionId || fallbackOrder.id,
    title: normalized.title || normalized.requirements || fallbackOrder.title || '',
    img:
      getAssetImagePath(normalized) ||
      normalized.img ||
      normalized.imageUrl ||
      getAssetImagePath(fallbackOrder) ||
      fallbackOrder.img ||
      '',
    style: normalized.style || fallbackOrder.style || '',
    status: normalized.status || fallbackOrder.status || '',
    assetStatus:
      normalized.assetStatus || normalized.asset?.assetStatus || fallbackOrder.assetStatus || '',
    orderStatus:
      normalized.orderStatus || normalized.asset?.orderStatus || fallbackOrder.orderStatus || '',
    paymentStatus:
      normalized.paymentStatus ||
      normalized.asset?.paymentStatus ||
      fallbackOrder.paymentStatus ||
      '',
    quantity: Number(normalized.quantity || fallbackOrder.quantity || 1),
    createdAt: normalized.createdAt || fallbackOrder.createdAt || fallbackOrder.date || '',
    quotations: normalized.quotations || normalized.quotationList || fallbackOrder.quotations || [],
  };
};

const normalizeEstimate = (estimate, order, index) => ({
  id:
    estimate?.quotationId ||
    estimate?.id ||
    estimate?.estimateId ||
    `quotation-${order?.orderId || order?.id || index}`,
  quotationId: estimate?.quotationId || estimate?.id || estimate?.estimateId || null,
  sender:
    estimate?.partnerName ||
    estimate?.sender ||
    estimate?.writerName ||
    (estimate?.partnerId ? `비즈니스 멤버 ${estimate.partnerId}` : '비즈니스 멤버 1'),
  price: Number(estimate?.price || estimate?.amount || estimate?.totalPrice || 0),
  qty: Number(estimate?.quantity || estimate?.qty || order?.quantity || 1),
  title: estimate?.title || order?.title || '',
  img: estimate?.imageUrl || estimate?.img || estimate?.thumbnailUrl || order?.img || '',
  style: estimate?.style || order?.style || '',
});

const findMatchingOrder = (orders, { orderId, commissionId }) =>
  orders.find((order) => String(order?.orderId || order?.id || '') === String(orderId || '')) ||
  orders.find(
    (order) => String(getOrderCommissionId(order) || '') === String(commissionId || ''),
  ) ||
  null;

const hasQuotations = (order) => Array.isArray(order?.quotations) && order.quotations.length > 0;

// 💡 [S2486 해결] catch 블록에서 에러를 콘솔에 명시적으로 출력합니다.
const fetchDetailOrder = async (fallbackOrderId, stateOrder) => {
  try {
    const detailResult = await orderapi.getOrderDetail(fallbackOrderId);
    return normalizeOrder(detailResult, stateOrder || {});
  } catch (detailError) {
    console.error('상세 주문 정보를 불러오는데 실패했습니다:', detailError);
    return null;
  }
};

const fetchMatchingOrderList = async (fallbackOrderId, fallbackCommissionId, stateOrder) => {
  try {
    const ordersResult = await orderapi.getOrders();
    const matchedOrder = findMatchingOrder(normalizeList(ordersResult), {
      orderId: fallbackOrderId,
      commissionId: fallbackCommissionId,
    });
    return matchedOrder ? normalizeOrder(matchedOrder, stateOrder || {}) : null;
  } catch (error) {
    console.error('주문 목록에서 매칭되는 정보를 찾는데 실패했습니다:', error);
    return null;
  }
};

// 💡 [S3776 해결] 복잡도를 낮추기 위해 의뢰 API 조회 로직을 헬퍼 함수로 분리했습니다.
const fetchCommissionData = async (commissionId) => {
  if (!commissionId) return null;
  try {
    const res = await commissionapi.getCommissionDetail(commissionId);
    return res?.data || res || null;
  } catch (error) {
    console.error('의뢰 상세 정보를 불러오는데 실패했습니다:', error);
    return null;
  }
};

// 💡 [S3776 해결] 주문 및 견적서 탐색 로직을 헬퍼 함수로 분리했습니다.
const fetchAssetDetail = async (assetId) => {
  if (!assetId) return null;
  try {
    const res = await orderapi.getAssetDetail(assetId);
    return res?.data || res || null;
  } catch (error) {
    console.error('에셋 상세 정보를 불러오는 데 실패했습니다:', error);
    return null;
  }
};

const fetchAssetByCommissionId = async (commissionId) => {
  if (!commissionId) return null;

  try {
    let page = 0;
    let shouldContinue = true;

    while (shouldContinue) {
      const result = await orderapi.getAssets({
        page,
        size: ASSET_PAGE_SIZE,
        sort: ['createdAt,desc'],
        commission: true,
      });

      if (result?.isSuccess === false) {
        throw new Error(result?.errorDetail?.message || 'Failed to load assets.');
      }

      const assetPage = normalizeAssetPage(result?.data || result);
      const matchedAsset = assetPage.content.find(
        (asset) => String(getAssetCommissionId(asset) || '') === String(commissionId),
      );

      if (matchedAsset) return matchedAsset;

      shouldContinue = !assetPage.last;
      page = assetPage.number + 1;
    }
  } catch (error) {
    console.error('커미션 ID로 에셋 정보를 불러오는 데 실패했습니다:', error);
  }

  return null;
};

const resolveAssetData = async (commissionData, orderData, fallbackData, commissionId) => {
  if (
    getAssetImagePath(commissionData) ||
    getAssetImagePath(orderData) ||
    getAssetImagePath(fallbackData)
  ) {
    return null;
  }

  const assetId = getAssetId(commissionData) || getAssetId(orderData) || getAssetId(fallbackData);
  const assetDetail = await fetchAssetDetail(assetId);

  if (getAssetImagePath(assetDetail)) return assetDetail;

  return fetchAssetByCommissionId(commissionId);
};

const resolveOrderData = async (targetOrderId, fallbackCommissionId, stateOrder) => {
  let fetchedOrder = targetOrderId ? await fetchDetailOrder(targetOrderId, stateOrder) : null;

  if (!fetchedOrder || !hasQuotations(fetchedOrder)) {
    const matched = await fetchMatchingOrderList(targetOrderId, fallbackCommissionId, stateOrder);
    if (matched) {
      fetchedOrder = hasQuotations(matched) ? matched : fetchedOrder || matched;
    }
  }
  return fetchedOrder;
};

const normalizeCombinedData = (commissionData, orderData, fallbackData, assetData) => {
  const cId = commissionData?.commissionId || orderData?.commissionId || fallbackData?.commissionId;
  const oId = commissionData?.orderId || orderData?.orderId || fallbackData?.orderId;

  // 💡 실서버 응답에서 의뢰(commission) 혹은 주문(order) 레벨 어디서든 견적서 목록을 안전하게 파싱할 수 있도록 후보군을 전부 확보합니다.
  const quotationsCandidates =
    commissionData?.quotations ||
    commissionData?.quotationList ||
    commissionData?.partnerQuotations ||
    orderData?.quotations ||
    orderData?.quotationList ||
    orderData?.partnerQuotations ||
    fallbackData?.quotations ||
    [];

  return {
    id: oId || cId,
    commissionId: cId,
    orderId: oId,
    img:
      getAssetImagePath(assetData) ||
      getAssetImagePath(commissionData) ||
      getAssetImagePath(orderData) ||
      getAssetImagePath(fallbackData) ||
      commissionData?.aiImageUrl ||
      commissionData?.inputImageUrl ||
      orderData?.img ||
      fallbackData?.img ||
      '',
    title:
      commissionData?.title || orderData?.title || fallbackData?.title || `의뢰 건 #${cId || oId}`,
    createdAt: commissionData?.createdAt || orderData?.createdAt || fallbackData?.createdAt || '',
    status: commissionData?.status || orderData?.status || fallbackData?.status || '',
    assetStatus:
      assetData?.assetStatus ||
      commissionData?.assetStatus ||
      orderData?.assetStatus ||
      fallbackData?.assetStatus ||
      orderData?.asset?.assetStatus ||
      '',
    orderStatus:
      assetData?.orderStatus ||
      orderData?.orderStatus ||
      fallbackData?.orderStatus ||
      orderData?.asset?.orderStatus ||
      '',
    paymentStatus:
      assetData?.paymentStatus ||
      orderData?.paymentStatus ||
      fallbackData?.paymentStatus ||
      orderData?.asset?.paymentStatus ||
      '',
    quantity: commissionData?.quantity || orderData?.quantity || fallbackData?.quantity || 1,
    style: commissionData?.style || orderData?.style || fallbackData?.style || '지브리',
    quotations: Array.isArray(quotationsCandidates) ? quotationsCandidates : [],
  };
};

// 💡 [S7773 및 no-restricted-globals 해결] isNaN 대신 안전한 Number.isNaN을 사용합니다.
const formatDate = (dateString) => {
  if (!dateString) return '0000.00.00';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '0000.00.00';

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

// --- 메인 페이지 컴포넌트 ---
const getCancelReturnPath = (locationState) => {
  const returnTo = locationState?.returnTo;
  return typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : '/orders/manage';
};

function EstimateDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: routeOrderId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const stateOrder = location.state?.order || null;

  const fallbackOrderId =
    routeOrderId ||
    location.state?.orderId ||
    queryParams.get('orderId') ||
    stateOrder?.orderId ||
    stateOrder?.id ||
    null;
  const fallbackCommissionId =
    location.state?.commissionId ||
    queryParams.get('commissionId') ||
    stateOrder?.commissionId ||
    null;

  const [order, setOrder] = useState(() => (stateOrder ? normalizeOrder(stateOrder) : null));
  const [isOrderLoading, setIsOrderLoading] = useState(
    !stateOrder && Boolean(fallbackOrderId || fallbackCommissionId),
  );
  const [selectedEstimateId, setSelectedEstimateId] = useState(null);

  const vw = (size) => `${getVw(size)}px`;

  useEffect(() => {
    const savedOrders = getCookie('myOrders');
    const savedOrderList = Array.isArray(savedOrders) ? savedOrders : [];
    const savedOrder =
      savedOrderList.find(
        (item) => String(item?.orderId || item?.id || '') === String(fallbackOrderId || ''),
      ) || null;

    const baseOrder = normalizeOrder(stateOrder || savedOrder || {});
    const shouldUseFallbackOnly =
      !fallbackOrderId && !fallbackCommissionId && (stateOrder || savedOrder);

    if (shouldUseFallbackOnly) {
      setOrder(baseOrder);
      setIsOrderLoading(false);
      return;
    }

    if (!fallbackOrderId && !fallbackCommissionId) {
      setOrder(null);
      setIsOrderLoading(false);
      return;
    }

    let isMounted = true;

    // 💡 [S3776 해결] 외부에 분리한 헬퍼 함수들을 사용해 로직이 훨씬 깔끔해졌습니다!
    const restoreOrder = async () => {
      setIsOrderLoading(true);

      try {
        const fetchedCommission = await fetchCommissionData(fallbackCommissionId);
        const targetOrderId = fetchedCommission?.orderId || fallbackOrderId;
        const fetchedOrder = await resolveOrderData(
          targetOrderId,
          fallbackCommissionId,
          stateOrder,
        );
        const assetData = await resolveAssetData(
          fetchedCommission,
          fetchedOrder,
          baseOrder,
          fallbackCommissionId,
        );

        if (!isMounted) return;

        const combinedOrder = normalizeCombinedData(
          fetchedCommission,
          fetchedOrder,
          baseOrder,
          assetData,
        );
        setOrder(combinedOrder);

        if (combinedOrder?.orderId) {
          const nextSavedOrders = [
            combinedOrder,
            ...savedOrderList.filter(
              (item) => String(item?.orderId || item?.id || '') !== String(combinedOrder.orderId),
            ),
          ];
          setCookie('myOrders', nextSavedOrders);
        }
      } catch (error) {
        console.error(
          '데이터 병합 중 에러 발생 -> 안전한 로컬/이전 데이터(baseOrder)로 대체합니다:',
          error,
        );
        // 💡 실서버 조회 실패 시 null 대신 이전 baseOrder를 살려서 화면 렌더링을 지켜냅니다.
        if (isMounted) setOrder(baseOrder);
      } finally {
        if (isMounted) setIsOrderLoading(false);
      }
    };

    restoreOrder();
    return () => {
      isMounted = false;
    };
  }, [fallbackCommissionId, fallbackOrderId, stateOrder]);

  const estimates = useMemo(() => {
    if (!order) return [];
    const source = Array.isArray(order.quotations) ? order.quotations : [];
    return source.map((estimate, index) => normalizeEstimate(estimate, order, index));
  }, [order]);

  useEffect(() => {
    if (estimates.length > 0 && !selectedEstimateId) {
      setSelectedEstimateId(estimates[0].id);
    }
  }, [estimates, selectedEstimateId]);

  const selectedEst = estimates.find((estimate) => estimate.id === selectedEstimateId) || null;
  const isCanceledOrder = hasCanceledStatus(order);

  const handleCancelOrder = async () => {
    if (!order || isCanceledOrder) return;
    const shouldCancel = globalThis.confirm('해당 의뢰를 취소하시겠습니까?');
    if (!shouldCancel) return;

    try {
      if (order.orderId) await orderapi.cancelOrder(order.orderId);
    } catch (error) {
      console.error('의뢰 취소에 실패했습니다:', error);
    }

    const saved = getCookie('myOrders');
    const savedArray = Array.isArray(saved) ? saved : [];
    const updated = savedArray.filter(
      (item) =>
        String(item?.orderId || item?.id || '') !== String(order?.orderId || order?.id || ''),
    );
    setCookie('myOrders', updated);
    globalThis.alert('의뢰가 취소되었습니다.');
    navigate(getCancelReturnPath(location.state), { replace: true });
  };

  const handleGoToPayment = () => {
    if (isCanceledOrder) return;
    if (!selectedEst) {
      globalThis.alert('결제할 견적서를 먼저 선택해주세요.');
      return;
    }
    navigate('/payment', {
      state: {
        order,
        item: {
          id: order?.commissionId || order?.orderId || order?.id,
          img: selectedEst.img || order?.img,
          title: selectedEst.title || order?.title,
        },
        estimateData: {
          quotationId: selectedEst.quotationId || selectedEst.id,
          itemName: selectedEst.title || order?.title,
          price: selectedEst.price,
          shippingFee: 0,
          commissionId: order?.commissionId || order?.id,
        },
      },
    });
  };

  // --- 시안 완벽 일치 스타일 ---
  const S = {
    pageContainer: { minHeight: '100vh', backgroundColor: '#F8F9FA', color: '#111' },
    mainWrapper: { width: vw(1280), margin: '0 auto', paddingTop: vw(40), paddingBottom: vw(100) },

    contentLayout: { display: 'flex', gap: vw(30), alignItems: 'flex-start' },

    // 왼쪽: 의뢰서 카드
    leftSection: { width: vw(420), flexShrink: 0 },
    sectionTitle: { fontSize: vw(26), fontWeight: '700', marginBottom: vw(20) },
    orderCard: {
      backgroundColor: '#FFF',
      border: '1px solid #E5E7EB',
      borderRadius: vw(12),
      padding: vw(30),
      display: 'flex',
      flexDirection: 'column',
      gap: vw(30),
    },
    orderImg: {
      width: '100%',
      aspectRatio: '1/1',
      objectFit: 'cover',
      borderRadius: vw(8),
      backgroundColor: '#F3F4F6',
    },
    orderInfoBlock: { display: 'flex', flexDirection: 'column', gap: vw(14) },
    infoRowHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: vw(10),
    },
    infoLabelLarge: { fontSize: vw(20), fontWeight: '700', color: '#000' },
    infoValueLarge: { fontSize: vw(20), fontWeight: '700', color: '#000' },
    infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    infoLabel: { fontSize: vw(16), fontWeight: '500', color: '#555' },
    infoValue: { fontSize: vw(16), fontWeight: '500', color: '#111' },

    // 오른쪽: 견적서 목록 테이블
    rightSection: { flex: 1 },
    tableContainer: {
      backgroundColor: '#FFF',
      border: '1px solid #ccc',
      borderRadius: vw(8),
      overflow: 'hidden',
    },
    tableHeader: {
      display: 'flex',
      borderBottom: '1px solid #ccc',
      padding: `${vw(15)} 0`,
      backgroundColor: '#FFF',
      alignItems: 'center',
      textAlign: 'center',
    },
    thCheck: { width: vw(80) },
    thInfo: { flex: 1, fontSize: vw(14), color: '#333', fontWeight: '500' },
    thQty: { width: vw(80), fontSize: vw(14), color: '#333', fontWeight: '500' },
    thPrice: { width: vw(140), fontSize: vw(14), color: '#333', fontWeight: '500' },
    thAuthor: { width: vw(140), fontSize: vw(14), color: '#333', fontWeight: '500' },

    tableRow: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #ccc',
      padding: `${vw(20)} 0`,
      backgroundColor: '#FFF',
      height: vw(140),
      boxSizing: 'border-box',
    },
    tableRowEmpty: {
      height: vw(140),
      borderBottom: '1px solid #ccc',
      display: 'flex',
      alignItems: 'center',
    }, // 빈 줄 높이 고정
    tdCheck: { width: vw(80), display: 'flex', justifyContent: 'center' },
    checkbox: { width: vw(20), height: vw(20), cursor: 'pointer', accentColor: '#2C9753' },
    tdInfo: { flex: 1, display: 'flex', gap: vw(20), alignItems: 'center' },
    estThumbnail: {
      width: vw(80),
      height: vw(80),
      objectFit: 'cover',
      borderRadius: vw(8),
      backgroundColor: '#F3F4F6',
    },
    estTextWrap: { display: 'flex', flexDirection: 'column', gap: vw(8) },
    estTitle: { fontSize: vw(18), fontWeight: '700', color: '#111' },
    estSubInfoWrap: { display: 'flex', gap: vw(20) },
    estSubInfoItem: { display: 'flex', flexDirection: 'column', gap: vw(4) },
    estSubLabel: { fontSize: vw(13), color: '#666' },
    estSubValue: { fontSize: vw(13), color: '#111', fontWeight: '500' },
    tdQty: { width: vw(80), textAlign: 'center', fontSize: vw(15), color: '#111' },
    tdPrice: { width: vw(140), textAlign: 'center', fontSize: vw(15), color: '#111' },
    tdAuthor: { width: vw(140), textAlign: 'center', fontSize: vw(14), color: '#111' },

    // 하단 버튼 영역
    bottomArea: { display: 'flex', justifyContent: 'center', gap: vw(16), marginTop: vw(60) },
    btnGreen: {
      width: vw(180),
      height: vw(50),
      backgroundColor: '#2C9753',
      color: '#FFF',
      fontSize: vw(16),
      fontWeight: '700',
      border: 'none',
      borderRadius: vw(8),
      cursor: 'pointer',
    },
    btnDisabled: {
      backgroundColor: '#C9CDD2',
      cursor: 'not-allowed',
      opacity: 0.7,
    },
  };

  if (isOrderLoading && !order) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>주문 정보를 불러오는 중입니다...</div>
    );
  }
  if (!order) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <p>주문 정보를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/check')}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const emptyRowsCount = Math.max(0, 4 - estimates.length);
  // 💡 [S6479 해결] 인덱스 대신 고유한 정적 문자열로 Key 값을 부여할 배열 생성
  const dummyKeys = ['empty-row-0', 'empty-row-1', 'empty-row-2', 'empty-row-3'].slice(
    0,
    emptyRowsCount,
  );

  return (
    <div style={S.pageContainer}>
      <CommissionHeader title="" />

      <main style={S.mainWrapper}>
        <div style={S.contentLayout}>
          {/* --- 왼쪽: 의뢰서 --- */}
          <section style={S.leftSection}>
            <h2 style={S.sectionTitle}>의뢰서</h2>
            <div style={S.orderCard}>
              <img src={convertToSafeImage(order.img)} alt="의뢰 썸네일" style={S.orderImg} />

              <div style={S.orderInfoBlock}>
                <div style={S.infoRowHeader}>
                  <span style={S.infoLabelLarge}>의뢰 명</span>
                  <span style={S.infoValueLarge}>{order.title}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>의뢰신청 날짜</span>
                  <span style={S.infoValue}>{formatDate(order.createdAt)}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>의뢰 번호</span>
                  <span style={S.infoValue}>
                    {order.commissionId
                      ? String(order.commissionId).padStart(10, '0')
                      : '0000000000'}
                  </span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>생성 파일</span>
                  <span style={S.infoValue}>이미지</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>스타일</span>
                  <span style={S.infoValue}>{order.style || '지브리'}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>수량</span>
                  <span style={S.infoValue}>{order.quantity || 1}</span>
                </div>
              </div>
            </div>
          </section>

          {/* --- 오른쪽: 견적서 목록 --- */}
          <section style={S.rightSection}>
            <h2 style={S.sectionTitle}>견적서 목록</h2>

            <div style={S.tableContainer}>
              <div style={S.tableHeader}>
                <div style={S.thCheck} />
                <div style={S.thInfo}>상품정보</div>
                <div style={S.thQty}>수량</div>
                <div style={S.thPrice}>상품 합계 금액</div>
                <div style={S.thAuthor}>견적서 작성자</div>
              </div>

              {estimates.map((est) => (
                <label key={est.id} style={{ ...S.tableRow, cursor: 'pointer' }}>
                  <div style={S.tdCheck}>
                    <input
                      type="radio"
                      name="estimateSelect"
                      checked={selectedEstimateId === est.id}
                      onChange={() => setSelectedEstimateId(est.id)}
                      style={S.checkbox}
                    />
                  </div>
                  <div style={S.tdInfo}>
                    <img
                      src={convertToSafeImage(est.img || order.img)}
                      alt="견적 썸네일"
                      style={S.estThumbnail}
                    />
                    <div style={S.estTextWrap}>
                      <span style={S.estTitle}>{est.title || order.title}</span>
                      <div style={S.estSubInfoWrap}>
                        <div style={S.estSubInfoItem}>
                          <span style={S.estSubLabel}>생성파일</span>
                          <span style={S.estSubValue}>이미지</span>
                        </div>
                        <div style={S.estSubInfoItem}>
                          <span style={S.estSubLabel}>스타일</span>
                          <span style={S.estSubValue}>{est.style || order.style || '지브리'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={S.tdQty}>{est.qty}</div>
                  <div style={S.tdPrice}>{est.price.toLocaleString()}원</div>
                  <div style={S.tdAuthor}>{est.sender}</div>
                </label>
              ))}

              {/* 💡 [S6479 해결] 정적 문자열 배열을 사용하여 렌더링 */}
              {dummyKeys.map((key) => (
                <div key={key} style={S.tableRowEmpty}>
                  <div style={S.tdCheck}>
                    <input
                      type="radio"
                      disabled
                      style={{ ...S.checkbox, opacity: 0.3, cursor: 'default' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* --- 하단 버튼 --- */}
        <div style={S.bottomArea}>
          <button
            style={isCanceledOrder ? { ...S.btnGreen, ...S.btnDisabled } : S.btnGreen}
            onClick={handleCancelOrder}
            disabled={isCanceledOrder}
          >
            의뢰 취소
          </button>
          <button
            style={isCanceledOrder ? { ...S.btnGreen, ...S.btnDisabled } : S.btnGreen}
            onClick={handleGoToPayment}
            disabled={isCanceledOrder}
          >
            선택한 견적서 결제
          </button>
        </div>
      </main>
    </div>
  );
}

export default EstimateDetailPage;
