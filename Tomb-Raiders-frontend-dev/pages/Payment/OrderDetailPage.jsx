import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { orderapi } from '../../api/orderapi';
import { S } from '../../components/Payment/OrderDetail.style';
import OrderInfoSection from '../../components/Payment/OrderInfoSection';
import CommissionHeader from '../../components/Commission/CommissionHeader';

const pad = (value) => String(value).padStart(2, '0');

const formatPaymentDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const normalizeData = (payload) => payload?.data || payload || null;

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  const data = normalizeData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

// 💡 [SonarLint S7755 해결] 배열의 마지막 요소에 .at(-1) 사용
const extractCommissionIdFromText = (text) => {
  const matches = String(text || '').match(/\d+/g);
  return matches?.length ? matches.at(-1) : null;
};

const getOrderCommissionId = (order) =>
  order?.commissionId ||
  order?.commission?.commissionId ||
  order?.asset?.commissionId ||
  extractCommissionIdFromText(order?.requirements || order?.title);

const getSelectedQuotation = (order) => {
  const quotations = Array.isArray(order?.quotations) ? order.quotations : [];
  return quotations.find((quotation) => quotation?.selected) || quotations[0] || null;
};

const formatAddress = (order) => {
  const addressCode = order?.addressCode || order?.zipCode;
  const baseAddress = order?.address || '';
  const detailAddress = order?.detailAddress || '';
  const fullAddress = [addressCode ? `(${addressCode})` : '', baseAddress, detailAddress]
    .filter(Boolean)
    .join(' ');

  return fullAddress || '-';
};

const normalizeOrderForDetail = (order) => {
  const normalized = normalizeData(order) || {};
  const quotation = getSelectedQuotation(normalized);
  const price = Number(
    quotation?.price || normalized.price || normalized.itemPrice || normalized.amount || 0,
  );
  const shippingFee = Number(normalized.shippingFee || normalized.deliveryFee || 0);
  const orderId = normalized.orderId || normalized.id || normalized.paymentId || '';
  const commissionId = getOrderCommissionId(normalized);
  const title =
    normalized.title ||
    normalized.itemName ||
    normalized.requirements ||
    (commissionId ? `Commission #${commissionId}` : '') ||
    (normalized.assetId ? `Asset #${normalized.assetId}` : '') ||
    (commissionId ? `의뢰 대상: ${commissionId}` : `주문 #${orderId}`);

  return {
    ...normalized,
    id: orderId,
    orderId,
    commissionId,
    title,
    img:
      normalized.img ||
      normalized.imageUrl ||
      normalized.assetImageUrl ||
      normalized.assetImagePath ||
      normalized.asset?.assetUrl ||
      normalized.asset?.imageUrl ||
      '',
    status: ['PAID', 'PAYMENT_PAID', 'PAYMENT_PAYED'].includes(
      String(
        normalized.status || normalized.paymentStatus || normalized.orderStatus || '',
      ).toUpperCase(),
    )
      ? '결제 완료'
      : normalized.status ||
        normalized.paymentStatus ||
        normalized.orderStatus ||
        normalized.commissionStatus ||
        normalized.assetStatus ||
        '-',
    orderDate:
      normalized.paymentDate ||
      normalized.paidAt ||
      normalized.approvedAt ||
      normalized.orderDate ||
      normalized.updatedAt ||
      normalized.createdAt ||
      '',
    price,
    shippingFee,
    totalPrice: Number(normalized.totalPrice || price + shippingFee),
    paymentMethod: normalized.paymentMethod || normalized.pgProvider || '토스페이 / 일시불',
    buyerName: normalized.buyerName || normalized.memberName || normalized.sender || '-',
    buyerPhone:
      normalized.buyerPhone || normalized.memberPhone || normalized.senderContactInfo || '-',
    receiver:
      normalized.receiver ||
      normalized.receiverName ||
      normalized.recipientName ||
      normalized.recipient ||
      '-',
    phone: normalized.phone || normalized.recipientPhone || normalized.recipientContactInfo || '-',
    address: normalized.fullAddress || normalized.recipientAddress || formatAddress(normalized),
    memo: normalized.memo || normalized.deliveryMemo || normalized.recipientRequirements || '-',
  };
};

const findMatchingOrder = (orders, routeId) =>
  orders.find((order) => String(order?.orderId || order?.id || '') === String(routeId)) ||
  orders.find((order) => String(getOrderCommissionId(order) || '') === String(routeId)) ||
  null;

function OrderDetailPage() {
  const navigate = useNavigate();
  const { id: routeOrderId } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(() =>
    state?.order ? normalizeOrderForDetail(state.order) : null,
  );
  const [isLoading, setIsLoading] = useState(!state?.order && Boolean(routeOrderId));
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!routeOrderId) return undefined;

    let cancelled = false;

    const loadOrder = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const paymentResult = await orderapi.getPaymentDetail(routeOrderId).catch(() => null);
        let nextOrder = paymentResult ? normalizeOrderForDetail(paymentResult) : null;

        if (!nextOrder?.orderId) {
          const detailResult = await orderapi.getOrderDetail(routeOrderId).catch(() => null);
          nextOrder = detailResult ? normalizeOrderForDetail(detailResult) : null;
        }

        if (!nextOrder?.orderId) {
          const ordersResult = await orderapi.getOrders();
          nextOrder = normalizeOrderForDetail(
            findMatchingOrder(normalizeList(ordersResult), routeOrderId),
          );
        }

        if (cancelled) return;

        if (!nextOrder?.orderId) {
          setOrder(null);
          setLoadError('주문 정보를 찾을 수 없습니다.');
          return;
        }

        setOrder(nextOrder);
      } catch (error) {
        if (!cancelled) {
          console.error('주문 상세 조회 실패:', error);
          setOrder(null);
          setLoadError('주문 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [routeOrderId, state?.order]);

  if (isLoading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <p>주문 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <p>{loadError || '주문 정보를 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate('/check')}>주문목록으로 가기</button>
      </div>
    );
  }
  const safePrice = (val) => (Number(val) || 0).toLocaleString();
  const paymentDate = formatPaymentDate(order.orderDate);

  return (
    <div style={S.container}>
      <CommissionHeader title="주문 상세" />

      <div style={S.contentWrapper}>
        <div style={S.whiteBox}>
          {/* 1. 기본 정보 */}
          <div style={S.row}>
            <span style={S.label}>주문번호</span>
            <span style={S.value}>{order.id || '-'}</span>
          </div>
          <div style={S.row}>
            <span style={S.label}>결제날짜</span>
            <span style={S.value}>{paymentDate}</span>
          </div>
          <hr style={S.hr} />

          {/* 2. 상품 요약 */}
          <div style={S.productSummary}>
            <div style={{ display: 'flex', alignItems: 'center', gap: S.vw?.(20) || '20px' }}>
              <img src={order.img || ''} alt="product" style={S.summaryImg} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 'bold', margin: 0 }}>{order.status || '배송 준비중'}</p>
                <p style={{ fontSize: S.vw?.(14) || '14px', color: '#666' }}>
                  {order.title || '의뢰 상품'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: S.vw?.(10) || '10px' }}>
              <button
                style={{
                  padding: `${S.vw?.(5) || '5px'} ${S.vw?.(20) || '20px'}`,
                  backgroundColor: '#fff',
                  border: '1px solid #2C9753',
                  color: '#2C9753',
                  borderRadius: S.vw?.(5) || '5px',
                  cursor: 'pointer',
                }}
              >
                배송조회
              </button>
              <button
                style={{
                  ...S.btnWhite,
                  width: 'auto',
                  padding: `${S.vw?.(5) || '5px'} ${S.vw?.(20) || '20px'}`,
                }}
              >
                결제 취소
              </button>
            </div>
          </div>

          {/* 3. 정보 섹션들 */}
          <OrderInfoSection
            title="사업자 정보"
            rows={[
              { label: '보내는 사람', value: order.buyerName || order.memberName || '-' },
              { label: '연락처', value: order.buyerPhone || order.memberPhone || '-' },
            ]}
          />

          <OrderInfoSection
            title="결제 정보"
            rows={[
              { label: '결제 방법', value: order.paymentMethod || '토스페이 / 일시불' },
              { label: '상품 금액', value: `${safePrice(order.price)}원` },
              { label: '배송비', value: `${safePrice(order.shippingFee)}원` },
            ]}
            total={order.totalPrice}
          />

          <OrderInfoSection
            title="배송 정보"
            rows={[
              { label: '받는 분', value: order.receiver || '정보 없음' },
              { label: '연락처', value: order.phone || '정보 없음' },
              { label: '받는 주소', value: order.address || '정보 없음' },
              { label: '배송 요청사항', value: order.memo || '-' },
            ]}
          />
        </div>

        {/* 4. 하단 버튼 영역 */}
        <div style={S.bottomBtnArea}>
          <button onClick={() => navigate('/payments/history')} style={S.btnWhite}>
            주문목록 돌아가기
          </button>
          <button onClick={() => navigate('/')} style={S.btnOrange}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
