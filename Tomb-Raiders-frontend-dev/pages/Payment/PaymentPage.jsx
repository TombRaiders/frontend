import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { orderapi } from '../../api/orderapi';
import { addressService } from '../../api/addressService';
import ShippingAddressModal from '../../components/Member/MemberShippingMg/ShippingAddressModal';
import PaymentAddress from '../../components/Payment/PaymentAddress';
import PaymentItemInfo from '../../components/Payment/PaymentItemInfo';
import { S, vw } from '../../components/Payment/PaymentPage.style';
import PaymentSummary from '../../components/Payment/PaymentSummary';
import { usePayment } from './usePayment';
import CommissionHeader from '../../components/Commission/CommissionHeader';

const PAYMENT_ENTRY_PREFIX = 'payment-entry:';
const PAYMENT_LAST_ENTRY_KEY = 'payment-entry:last';
const NON_PAYABLE_ORDER_STATUSES = new Set([
  'PAID',
  'PAYMENT_PAID',
  'PAYMENT_COMPLETED',
  'COMPLETED',
  'DONE',
  'CANCELED',
  'CANCELLED',
  '결제완료',
  '완료',
  '취소',
]);

const normalizeData = (payload) => payload?.data || payload || null;

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  const data = normalizeData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
};

// 💡 [SonarLint S7755 해결] .at(-1) 사용
const extractCommissionIdFromText = (text) => {
  const matches = String(text || '').match(/\d+/g);
  return matches?.length ? matches.at(-1) : null;
};

const isPayableOrderStatus = (status) => {
  if (!status) return true;
  return !NON_PAYABLE_ORDER_STATUSES.has(String(status).trim().toUpperCase());
};

const normalizeOrder = (order) => {
  const normalized = normalizeData(order) || {};
  const quotationCandidates =
    normalized.quotations ||
    normalized.quotationList ||
    normalized.partnerQuotations ||
    normalized.quotes ||
    normalized.estimateList ||
    normalized.estimates ||
    (normalized.quotation ? [normalized.quotation] : null) ||
    (normalized.estimate ? [normalized.estimate] : null);

  return {
    ...normalized,
    orderId: normalized.orderId || normalized.id || '',
    commissionId:
      normalized.commissionId ||
      normalized.commission?.commissionId ||
      normalized.asset?.commissionId ||
      extractCommissionIdFromText(normalized.requirements || normalized.title) ||
      null,
    title: normalized.title || normalized.requirements || '',
    img:
      normalized.img ||
      normalized.imageUrl ||
      normalized.assetImageUrl ||
      normalized.asset?.assetUrl ||
      normalized.asset?.imageUrl ||
      '',
    quotations: Array.isArray(quotationCandidates) ? quotationCandidates : [],
  };
};

const normalizeQuotation = (quotation, order) => ({
  quotationId: quotation?.quotationId || quotation?.id || null,
  itemName: order?.title || order?.requirements || `주문 #${order?.orderId || order?.id || ''}`,
  price: Number(quotation?.price || quotation?.amount || quotation?.totalPrice || 0),
  shippingFee: 0,
  commissionId: order?.commissionId || order?.id || null,
});

const normalizeAddress = (address) => {
  if (!address) return null;

  return {
    addressId: address.addressId,
    receiverName: address.receiverName || address.recipientName || '',
    zipCode: address.zipCode || address.addressCode || '',
    address: address.address || '',
    detailAddress: address.detailAddress || '',
    phone: address.phone || address.recipientPhone || '',
    isDefault: Boolean(address.isDefault),
  };
};

const findMatchingOrder = (orders, orderId) =>
  orders.find((order) => String(order?.orderId || order?.id || '') === String(orderId || '')) ||
  null;

const selectQuotation = (order, preferredQuotationId) => {
  const quotations = Array.isArray(order?.quotations) ? order.quotations : [];
  if (quotations.length === 0) return null;

  if (preferredQuotationId) {
    return (
      quotations.find(
        (quotation) =>
          String(quotation?.quotationId || quotation?.id || '') === String(preferredQuotationId),
      ) || quotations[0]
    );
  }

  return quotations.find((quotation) => quotation?.selected) || quotations[0];
};

// 💡 [SonarLint S3776 해결] 세션 정보 로딩 헬퍼 함수
const loadSessionEntry = (routeOrderId) => {
  const entryKey = routeOrderId ? `${PAYMENT_ENTRY_PREFIX}${routeOrderId}` : null;
  const savedEntryText =
    (entryKey ? sessionStorage.getItem(entryKey) : null) ||
    sessionStorage.getItem(PAYMENT_LAST_ENTRY_KEY);

  if (!savedEntryText) return null;

  try {
    const savedEntry = JSON.parse(savedEntryText);
    const savedOrder = savedEntry?.order ? normalizeOrder(savedEntry.order) : null;
    const savedEstimate = savedEntry?.estimateData || null;

    if (savedOrder && savedEstimate?.quotationId) {
      return { order: savedOrder, estimateData: savedEstimate };
    }
  } catch (error) {
    console.error('Failed to parse session entry:', error);
  }
  return null;
};

// 💡 [SonarLint S3776 해결] 주문 정보 페칭 헬퍼 함수
const fetchOrderData = async (routeOrderId) => {
  const detailResult = await orderapi.getOrderDetail(routeOrderId).catch(() => null);
  let nextOrder = detailResult ? normalizeOrder(detailResult) : null;

  if (!nextOrder?.orderId) {
    const ordersResult = await orderapi.getOrders();
    nextOrder = normalizeOrder(findMatchingOrder(normalizeList(ordersResult), routeOrderId));
  }
  return nextOrder;
};

function PaymentPage() {
  const location = useLocation();

  const { orderId: routeOrderId } = useParams();
  const { startPayment, isLoading } = usePayment();

  const stateOrder = location.state?.order || location.state?.item || null;
  const stateEstimateData = location.state?.estimateData || null;
  const initialOrder = stateOrder ? normalizeOrder(stateOrder) : null;

  const [agreed, setAgreed] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [restoredOrder, setRestoredOrder] = useState(initialOrder);
  const [restoredEstimateData, setRestoredEstimateData] = useState(stateEstimateData);
  const [isRestoring, setIsRestoring] = useState(!stateEstimateData);

  const currentOrder = useMemo(
    () => initialOrder || restoredOrder || {},
    [initialOrder, restoredOrder],
  );
  const estimateData = useMemo(
    () => stateEstimateData || restoredEstimateData || {},
    [restoredEstimateData, stateEstimateData],
  );
  const resolvedOrderId = currentOrder?.orderId || currentOrder?.id || routeOrderId || '';
  const resolvedQuotationId = estimateData?.quotationId || currentOrder?.quotationId || null;
  const resolvedCommissionId = estimateData?.commissionId || currentOrder?.commissionId || null;
  const price = Number(estimateData?.price || 0);
  const shippingFee = Number(estimateData?.shippingFee || 0);
  const totalPrice = price + shippingFee;
  const itemName =
    estimateData?.itemName ||
    currentOrder?.title ||
    `주문 #${resolvedOrderId || resolvedCommissionId || ''}`;
  const isOrderPayable = isPayableOrderStatus(currentOrder?.status);

  useEffect(() => {
    if (!resolvedOrderId || !resolvedQuotationId || !stateEstimateData) return;

    const entry = {
      order: currentOrder,
      estimateData,
    };

    sessionStorage.setItem(`${PAYMENT_ENTRY_PREFIX}${resolvedOrderId}`, JSON.stringify(entry));
    sessionStorage.setItem(PAYMENT_LAST_ENTRY_KEY, JSON.stringify(entry));
  }, [currentOrder, estimateData, resolvedOrderId, resolvedQuotationId, stateEstimateData]);

  const loadAddressList = useCallback(async () => {
    try {
      setIsAddressLoading(true);
      const result = await addressService.getAddresses();
      const addresses = normalizeList(result).map(normalizeAddress);
      const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;
      setSelectedAddress(defaultAddress);
    } catch (error) {
      console.error('배송지 조회 실패:', error);
      setSelectedAddress(null);
    } finally {
      setIsAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddressList();
  }, [loadAddressList]);

  // 💡 [SonarLint S3776 해결] 복잡한 useEffect 내부를 헬퍼 함수들을 사용하여 단순화
  useEffect(() => {
    if (stateEstimateData && initialOrder) {
      setIsRestoring(false);
      return undefined;
    }

    let cancelled = false;

    const restorePaymentEntry = async () => {
      setIsRestoring(true);

      try {
        const sessionData = loadSessionEntry(routeOrderId);

        if (sessionData && !cancelled) {
          setRestoredOrder(sessionData.order);
          setRestoredEstimateData(sessionData.estimateData);
          setIsRestoring(false);
          return;
        }

        if (!routeOrderId) {
          if (!cancelled) {
            setRestoredOrder(null);
            setRestoredEstimateData(null);
          }
          return;
        }

        const nextOrder = await fetchOrderData(routeOrderId);

        if (cancelled) return;

        if (!nextOrder?.orderId) {
          setRestoredOrder(null);
          setRestoredEstimateData(null);
          return;
        }

        const selectedQuotation = selectQuotation(nextOrder, stateEstimateData?.quotationId);
        const nextEstimate = selectedQuotation
          ? normalizeQuotation(selectedQuotation, nextOrder)
          : null;

        setRestoredOrder(nextOrder);
        setRestoredEstimateData(nextEstimate);

        if (nextEstimate) {
          const entry = { order: nextOrder, estimateData: nextEstimate };
          sessionStorage.setItem(
            `${PAYMENT_ENTRY_PREFIX}${nextOrder.orderId}`,
            JSON.stringify(entry),
          );
          sessionStorage.setItem(PAYMENT_LAST_ENTRY_KEY, JSON.stringify(entry));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('결제 정보 복구 실패:', error);
          setRestoredOrder(null);
          setRestoredEstimateData(null);
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    };

    restorePaymentEntry();

    return () => {
      cancelled = true;
    };
  }, [initialOrder, routeOrderId, stateEstimateData]);

  const displayInfo = useMemo(
    () => ({
      name: selectedAddress?.receiverName || '고객',
      phone: selectedAddress?.phone || '등록된 번호 없음',
    }),
    [selectedAddress],
  );

  const handlePayment = async () => {
    if (!agreed) {
      globalThis.alert('주문 내용과 결제 진행에 동의해주세요.');
      return;
    }

    if (!selectedAddress) {
      globalThis.alert('배송지를 먼저 등록해주세요.');
      return;
    }

    if (!resolvedOrderId || !resolvedQuotationId) {
      globalThis.alert('결제할 주문 또는 견적 정보가 없습니다.');
      return;
    }

    if (!isOrderPayable) {
      globalThis.alert('이미 결제되었거나 현재 결제를 진행할 수 없는 주문입니다.');
      return;
    }

    const result = await startPayment({
      orderId: resolvedOrderId,
      quotationId: resolvedQuotationId,
      amount: totalPrice,
      orderName: itemName,
      customerName: displayInfo.name,
      payMethod: 'CARD',
      successUrl: `${globalThis.location.origin}/payment-success`,
      failUrl: `${globalThis.location.origin}/payment-fail`,
      context: {
        orderId: resolvedOrderId,
        quotationId: resolvedQuotationId,
        commissionId: resolvedCommissionId,
        itemName,
        img: currentOrder?.img || '',
        price,
        shippingFee,
        totalPrice,
      },
    });

    if (result?.success === false) {
      globalThis.alert(result.message || '결제를 시작하지 못했습니다.');
    }
  };

  if (isRestoring) {
    return (
      <div style={S.container}>
        <CommissionHeader title="결제하기" />
        <div style={S.contentWrapper}>
          <section style={S.box}>
            <p style={{ margin: 0, fontSize: vw(16), color: '#333' }}>
              결제 정보를 불러오는 중입니다.
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (!resolvedOrderId || !resolvedQuotationId) {
    return (
      <div style={S.container}>
        <CommissionHeader title="결제하기" />
        <div style={S.contentWrapper}>
          <section style={S.box}>
            <p style={{ margin: 0, fontSize: vw(16), color: '#333' }}>
              결제할 주문 정보를 찾을 수 없습니다.
            </p>
          </section>
        </div>
      </div>
    );
  }

  let paymentButtonText = '결제할 수 없는 주문입니다';
  if (isLoading) {
    paymentButtonText = '결제 준비 중...';
  } else if (isOrderPayable) {
    paymentButtonText = `${totalPrice.toLocaleString()}원 결제하기`;
  }

  return (
    <div style={S.container}>
      <CommissionHeader title="결제하기" />

      <div style={S.contentWrapper}>
        <PaymentItemInfo
          itemName={itemName}
          price={price}
          commissionId={resolvedCommissionId || resolvedOrderId}
          img={currentOrder?.img}
        />

        <section style={S.box}>
          <h3 style={S.sectionTitle}>구매자 정보</h3>
          <div style={S.infoRow}>
            <span style={S.label}>이름</span>
            <span style={S.value}>{displayInfo.name}</span>
          </div>
          <div style={S.infoRow}>
            <span style={S.label}>휴대폰 번호</span>
            <span style={S.value}>{displayInfo.phone}</span>
          </div>
        </section>

        <PaymentAddress address={selectedAddress} onChangeClick={() => setIsModalOpen(true)} />
        <PaymentSummary price={price} shippingFee={shippingFee} />

        <section style={S.box}>
          <h3 style={S.sectionTitle}>결제 방법</h3>
          <div style={S.radioGroup}>
            <label style={S.radioLabel}>
              <input type="radio" checked readOnly />
              {/* 💡 [SonarLint S6772 해결] 모호한 띄어쓰기 방지를 위해 span으로 감쌈 */}
              <span> 토스 카드 결제</span>
            </label>
          </div>
        </section>

        <div style={S.agreeSection}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: vw(10) }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              style={S.checkbox}
            />
            <span style={{ fontSize: vw(16), fontWeight: '500' }}>
              위 주문 내용을 확인했으며, 결제에 동의합니다.
            </span>
          </label>
        </div>

        <button
          onClick={handlePayment}
          disabled={isAddressLoading || isLoading || !isOrderPayable}
          style={S.payBtn(agreed && !isAddressLoading && !isLoading && isOrderPayable)}
        >
          {paymentButtonText}
        </button>
      </div>

      <ShippingAddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadAddressList();
        }}
      />
    </div>
  );
}

export default PaymentPage;
