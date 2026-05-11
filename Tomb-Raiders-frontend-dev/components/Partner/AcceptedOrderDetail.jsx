import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  return value;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

const formatAddress = (order) => {
  const address = [order.address, order.detailAddress].filter(Boolean).join(' ');
  if (order.addressCode && address) return `(${order.addressCode}) ${address}`;
  return address || order.addressCode || '-';
};

function AcceptedOrderDetail({ selectedOrder }) {
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

  return (
    <div className="grid grid-cols-2" style={{ gap: vw(24), paddingBottom: vw(40) }}>
      <section
        className="bg-white border border-[#BDBDBD] shadow-sm"
        style={{ borderRadius: vw(12), padding: vw(32), minHeight: vw(460) }}
      >
        <h3 className="font-bold text-blue-600" style={{ fontSize: vw(18), marginBottom: vw(24) }}>
          사용자 주문 정보
        </h3>
        <div className="flex flex-col text-gray-800" style={{ gap: vw(14), fontSize: vw(14) }}>
          <p>주문 번호 : {formatValue(selectedOrder.orderId)}</p>
          <p>주문 상태 : {formatValue(selectedOrder.status)}</p>
          <p>제조 방식 : {formatValue(selectedOrder.manufacturingMethod)}</p>
          <p>요청 날짜 : {formatDate(selectedOrder.createdAt)}</p>
          <p>수정 날짜 : {formatDate(selectedOrder.updatedAt)}</p>
          <p>요청자 ID : {formatValue(selectedOrder.memberId)}</p>
          <p>수량 : {formatValue(selectedOrder.quantity)}개</p>
          <p>배송지 : {formatAddress(selectedOrder)}</p>
          <p>결제 상태 : {formatValue(selectedOrder.paymentStatus)}</p>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            주문 내용 : {formatValue(selectedOrder.requirements)}
          </p>
        </div>
      </section>

      <section
        className="bg-white border border-[#BDBDBD] shadow-sm flex flex-col"
        style={{ borderRadius: vw(12), padding: vw(32), minHeight: vw(460) }}
      >
        <h3 className="font-bold text-blue-600" style={{ fontSize: vw(18), marginBottom: vw(24) }}>
          Asset 이미지
        </h3>
        <div
          className="border border-[#E0E0E0] bg-[#F9FAFB] flex items-center justify-center overflow-hidden"
          style={{ borderRadius: vw(8), height: vw(300), marginBottom: vw(24) }}
        >
          {selectedOrder.assetImageUrl ? (
            <img
              src={selectedOrder.assetImageUrl}
              alt="Asset 이미지"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-gray-500" style={{ fontSize: vw(14) }}>
              Asset 이미지가 없습니다.
            </span>
          )}
        </div>

        {selectedOrder.assetUrl ? (
          <a
            href={selectedOrder.assetUrl}
            download
            className="group inline-flex w-full max-w-full box-border items-center justify-center gap-3 overflow-hidden rounded-full bg-[#16A34A] text-white text-center font-bold shadow-md shadow-green-200/70 transition-colors duration-200 hover:bg-[#15803D] focus:outline-none focus:ring-4 focus:ring-green-200"
            style={{ padding: `${vw(14)} ${vw(24)}`, fontSize: vw(15), minHeight: vw(48) }}
          >
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30"
              style={{ width: vw(28), height: vw(28), fontSize: vw(16) }}
            >
              ↓
            </span>
            <span>Asset 다운로드</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center rounded-full bg-gray-400 text-white font-bold opacity-60 cursor-not-allowed"
            style={{ padding: `${vw(14)} ${vw(24)}`, fontSize: vw(15), minHeight: vw(48) }}
          >
            다운로드 불가
          </button>
        )}
      </section>
    </div>
  );
}

AcceptedOrderDetail.propTypes = {
  selectedOrder: PropTypes.shape({
    orderId: PropTypes.number,
    status: PropTypes.string,
    manufacturingMethod: PropTypes.string,
    requirements: PropTypes.string,
    quantity: PropTypes.number,
    memberId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    addressCode: PropTypes.string,
    address: PropTypes.string,
    detailAddress: PropTypes.string,
    assetImageUrl: PropTypes.string,
    assetUrl: PropTypes.string,
    paymentStatus: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
};

AcceptedOrderDetail.defaultProps = {
  selectedOrder: null,
};

export default AcceptedOrderDetail;
