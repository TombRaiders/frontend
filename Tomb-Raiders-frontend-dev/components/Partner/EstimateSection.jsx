import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { partnerapi } from '../../api/partnerapi';
import { vw } from '../../utils/style';

function EstimateSection({ selectedOrder, refreshOrders, showAlert, partnerName }) {
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [shippingFee, setShippingFee] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedOrder) {
      setQuantity(selectedOrder.quantity?.toString() || '1');
      setUnitPrice('');
      setShippingFee('');
      setEstimatedDays('');
    }
  }, [selectedOrder]);

  if (!selectedOrder) {
    return (
      <div
        className="bg-white border border-[#BDBDBD] shadow-sm flex items-center justify-center text-gray-500"
        style={{ borderRadius: vw(12), minHeight: vw(300), fontSize: vw(16) }}
      >
        주문 목록에서 상세를 확인할 주문을 선택해주세요.
      </div>
    );
  }

  const isPending = selectedOrder.status === 'PENDING';
  const isQuotedOrPast =
    selectedOrder.status === 'QUOTED' ||
    selectedOrder.status === 'PAYMENT_COMPLETED' ||
    selectedOrder.status === 'COMPLETED';
  const isActionDisabled = isPending || isQuotedOrPast || isSubmitting;

  let buttonText = '견적서 발송';
  if (isPending) buttonText = '주문을 수락해주세요';
  else if (isQuotedOrPast) buttonText = '견적서 발송 완료';
  else if (isSubmitting) buttonText = '발송 중...';

  const numUnit = Number(unitPrice.replaceAll(',', '')) || 0;
  const numQty = Number(quantity.replaceAll(',', '')) || 0;
  const numShipping = Number(shippingFee.replaceAll(',', '')) || 0;
  const totalPrice = numUnit * numQty + numShipping;

  const handleSendEstimate = async () => {
    if (!unitPrice || !quantity || !shippingFee || !estimatedDays) {
      showAlert('오류', '입력 확인', '예상 소요일, 단가, 수량, 배송비를 모두 입력해주세요.');
      return;
    }

    if (totalPrice <= 0) {
      showAlert('오류', '입력 확인', '총 합계 금액은 0원보다 커야 합니다.');
      return;
    }

    if (!selectedOrder?.orderId) {
      showAlert('오류', '주문 정보 없음', '주문 정보가 없어 견적서를 보낼 수 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const detailResult = await partnerapi.getPartnerOrderDetail(selectedOrder.orderId);
      const latestOrder = detailResult?.data || detailResult || {};

      if (latestOrder?.version === undefined || latestOrder?.version === null) {
        showAlert('오류', '버전 정보 없음', '최신 주문 버전이 없어 견적서를 보낼 수 없습니다.');
        return;
      }

      await partnerapi.submitQuotation({
        orderId: selectedOrder.orderId,
        orderVersion: latestOrder.version,
        price: totalPrice,
        estimatedDays: Number(estimatedDays),
      });

      showAlert('성공', '발송 완료', '견적서가 성공적으로 발송되었습니다.');
      await refreshOrders();
    } catch (error) {
      console.error('견적서 발송 실패:', error);
      const errorMessage =
        error?.response?.data?.errorDetail?.message || '견적서 발송 중 오류가 발생했습니다.';
      showAlert('오류', '발송 실패', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatComma = (value) => {
    const number = Number(String(value).replaceAll(',', ''));
    return Number.isNaN(number) ? '' : number.toLocaleString('ko-KR');
  };

  const formatValue = (value) => {
    if (value === undefined || value === null || value === '') return '-';
    return value;
  };

  const formatAddress = (order) => {
    const address = [order.address, order.detailAddress].filter(Boolean).join(' ');
    if (order.addressCode && address) return `(${order.addressCode}) ${address}`;
    return address || order.addressCode || '-';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '대기 중';
      case 'ACCEPTED':
        return '수락됨';
      case 'QUOTED':
        return '견적 완료';
      case 'PAYMENT_COMPLETED':
        return '결제 완료';
      default:
        return status || '상태 없음';
    }
  };

  const quotationCount = Array.isArray(selectedOrder.quotations)
    ? selectedOrder.quotations.length
    : 0;
  const paymentInfo =
    selectedOrder.paymentId || selectedOrder.paymentStatus
      ? `${formatValue(selectedOrder.paymentId)} / ${formatValue(selectedOrder.paymentStatus)}`
      : '-';

  return (
    <div className="grid grid-cols-2 relative" style={{ gap: vw(24), paddingBottom: vw(80) }}>
      <div
        className="bg-white border border-[#BDBDBD] flex flex-col relative shadow-sm"
        style={{ borderRadius: vw(12), padding: vw(32), minHeight: vw(500) }}
      >
        <div className="flex justify-center h-full">
          <div
            className="flex flex-col items-center text-center text-sm"
            style={{ gap: vw(20), fontSize: vw(14) }}
          >
            <p className="font-bold text-lg text-blue-600">선택한 주문</p>
            <p>
              주문 상태 :{' '}
              <span className="font-bold text-blue-500">{getStatusText(selectedOrder.status)}</span>
            </p>
            <p>주문 번호 : {selectedOrder.orderId}</p>
            <p>요청 날짜 : {formatDate(selectedOrder.createdAt)}</p>
            <p>요청자 ID : {selectedOrder.memberId}</p>
            <p>수량 : {selectedOrder.quantity}개</p>
            <p style={{ maxWidth: vw(250), whiteSpace: 'pre-wrap' }}>
              주문 내용 : {selectedOrder.requirements}
            </p>
            <div
              className="border-t border-[#E0E0E0]"
              style={{ paddingTop: vw(16), marginTop: vw(4) }}
            >
              <p>버전 : {formatValue(selectedOrder.version)}</p>
              <p>제조 방식 : {formatValue(selectedOrder.manufacturingMethod)}</p>
              <p>배송지 : {formatAddress(selectedOrder)}</p>
              <p>자산 ID : {formatValue(selectedOrder.assetId)}</p>
              <p>
                자산 파일 :{' '}
                {selectedOrder.assetUrl ? (
                  <a
                    href={selectedOrder.assetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    자산 파일 열기
                  </a>
                ) : (
                  '-'
                )}
              </p>
              <p>
                자산 이미지 :{' '}
                {selectedOrder.assetImageUrl ? (
                  <a
                    href={selectedOrder.assetImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    자산 이미지 열기
                  </a>
                ) : (
                  '-'
                )}
              </p>
              <p>의뢰 ID : {formatValue(selectedOrder.commissionId)}</p>
              <p>
                의뢰서 :{' '}
                {selectedOrder.commissionUrl ? (
                  <a
                    href={selectedOrder.commissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    의뢰서 열기
                  </a>
                ) : (
                  '-'
                )}
              </p>
              <p>결제 정보 : {paymentInfo}</p>
              <p>견적 목록 : {quotationCount}건</p>
              <p>수정 날짜 : {formatDate(selectedOrder.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="bg-white border border-[#BDBDBD] flex flex-col relative shadow-sm"
        style={{ borderRadius: vw(12), padding: vw(32), minHeight: vw(500) }}
      >
        <h2 className="font-bold" style={{ fontSize: vw(18), marginBottom: vw(24) }}>
          견적서 작성
        </h2>
        <div style={{ marginBottom: vw(12), fontSize: vw(14), color: '#555' }}>
          작성자 : {partnerName || '파트너'}
        </div>
        <div style={{ marginBottom: vw(24) }}>
          <div
            className="flex justify-between items-center"
            style={{ fontSize: vw(14), marginBottom: vw(12) }}
          >
            <span className="font-bold text-blue-600">예상 소요일 (일)</span>
            <input
              type="number"
              value={estimatedDays}
              onChange={(event) => setEstimatedDays(event.target.value)}
              disabled={isActionDisabled}
              placeholder="예: 14"
              className="border border-blue-500 text-right outline-none focus:ring-2 focus:ring-blue-300 transition-colors disabled:bg-gray-100"
              style={{ borderRadius: vw(4), padding: `${vw(4)} ${vw(12)}`, width: vw(96) }}
            />
          </div>
          <div
            className="flex justify-between font-bold border-b border-[#E0E0E0]"
            style={{
              fontSize: vw(14),
              marginBottom: vw(12),
              paddingBottom: vw(8),
              marginTop: vw(30),
            }}
          >
            <span>금액 측정 상세내용</span>
            <div className="flex" style={{ gap: vw(64), paddingRight: vw(8) }}>
              <span>단가</span>
              <span>수량</span>
            </div>
          </div>
          <div
            className="flex justify-between items-center"
            style={{ fontSize: vw(14), marginBottom: vw(12) }}
          >
            <span>제작 비용</span>
            <div className="flex" style={{ gap: vw(16) }}>
              <input
                type="text"
                value={unitPrice}
                onChange={(event) => setUnitPrice(formatComma(event.target.value))}
                disabled={isActionDisabled}
                placeholder="0"
                className="border border-[#BDBDBD] text-right outline-none focus:border-blue-500 disabled:bg-gray-100"
                style={{ borderRadius: vw(4), padding: `${vw(4)} ${vw(12)}`, width: vw(96) }}
              />
              <input
                type="text"
                value={quantity}
                onChange={(event) => setQuantity(formatComma(event.target.value))}
                disabled={isActionDisabled}
                className="border border-[#BDBDBD] text-right outline-none focus:border-blue-500 disabled:bg-gray-100"
                style={{ borderRadius: vw(4), padding: `${vw(4)} ${vw(12)}`, width: vw(64) }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: vw(14) }}>
            <span>배송비</span>
            <div className="flex" style={{ gap: vw(16) }}>
              <input
                type="text"
                value={shippingFee}
                onChange={(event) => setShippingFee(formatComma(event.target.value))}
                disabled={isActionDisabled}
                placeholder="0"
                className="border border-[#BDBDBD] text-right outline-none focus:border-blue-500 disabled:bg-gray-100"
                style={{ borderRadius: vw(4), padding: `${vw(4)} ${vw(12)}`, width: vw(96) }}
              />
              <div style={{ width: vw(64) }} />
            </div>
          </div>
        </div>
        <div
          className="flex justify-between items-center mt-auto border-t border-[#E0E0E0]"
          style={{ paddingTop: vw(24) }}
        >
          <span className="font-bold" style={{ fontSize: vw(16) }}>
            최종 합계:
          </span>
          <span className="font-bold text-blue-600" style={{ fontSize: vw(18) }}>
            {totalPrice.toLocaleString('ko-KR')}원
          </span>
        </div>
      </div>

      <div className="absolute right-0 flex" style={{ bottom: vw(-8), gap: vw(12) }}>
        <button
          type="button"
          onClick={handleSendEstimate}
          disabled={isActionDisabled}
          className={`text-white transition-colors border-none font-bold ${isActionDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}`}
          style={{
            padding: `${vw(12)} ${vw(32)}`,
            fontSize: vw(14),
            borderRadius: vw(4),
            boxShadow: isActionDisabled ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

EstimateSection.propTypes = {
  selectedOrder: PropTypes.shape({
    orderId: PropTypes.number,
    version: PropTypes.number,
    manufacturingMethod: PropTypes.string,
    quantity: PropTypes.number,
    memberId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    addressCode: PropTypes.string,
    address: PropTypes.string,
    detailAddress: PropTypes.string,
    assetId: PropTypes.number,
    assetUrl: PropTypes.string,
    assetImageUrl: PropTypes.string,
    commissionId: PropTypes.number,
    commissionUrl: PropTypes.string,
    paymentId: PropTypes.number,
    paymentStatus: PropTypes.string,
    quotations: PropTypes.array,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    requirements: PropTypes.string,
    status: PropTypes.string,
  }),
  refreshOrders: PropTypes.func.isRequired,
  showAlert: PropTypes.func.isRequired,
  partnerName: PropTypes.string,
};

EstimateSection.defaultProps = {
  selectedOrder: null,
  partnerName: '',
};

export default EstimateSection;
