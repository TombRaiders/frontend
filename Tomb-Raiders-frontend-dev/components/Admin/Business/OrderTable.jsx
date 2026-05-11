import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

/**
 * 어드민 비즈니스 관리에서 전체 주문 내역을 상세 항목별로 보여주는 테이블 컴포넌트
 * 주문번호, 상태, 주문일, 구매자, 상품명, 수량, 금액, 결제 및 배송 상태를 한눈에 파악할 수 있음
 */
function OrderTable({ data }) {
  // 테이블 헤더 항목 리스트
  const headers = [
    '주문번호',
    '상태',
    '주문일',
    '구매자',
    '상품명',
    '수량',
    '금액',
    '결제',
    '배송',
  ];

  // 전달받은 데이터가 배열이 아닐 경우를 대비하여 안전하게 배열로 변환
  const safeData = Array.isArray(data) ? data : [];

  /**
   * 테이블 셀 내부에 값을 안전하게 렌더링하기 위한 유틸리티 함수
   * null/undefined 처리 및 객체 형태의 데이터를 문자열로 변환하여 에러를 방지함
   */
  const renderCell = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  };

  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl overflow-x-auto shadow-sm">
      <table
        className="w-full text-center border-collapse whitespace-nowrap"
        style={{ fontSize: vw(12) }}
      >
        <thead>
          <tr className="bg-[#F9F9F9]" style={{ height: vw(50) }}>
            {/* 전체 선택 체크박스 영역 */}
            <th className="px-2 border-r border-[#BDBDBD]">
              <input type="checkbox" onChange={() => {}} aria-label="전체 선택" />
            </th>
            {headers.map((h) => (
              <th key={`order-header-${h}`} className="px-3 border-r border-[#BDBDBD] font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 실제 주문 데이터 행들을 렌더링 */}
          {safeData.map((row, index) => {
            // 데이터 행 객체가 유효하지 않을 경우 렌더링하지 않음
            if (!row || typeof row !== 'object') return null;

            return (
              <tr
                key={`order-row-${row?.orderId || row?.id || index}`}
                className="border-b border-[#F2F2F2] hover:bg-gray-50"
                style={{ height: vw(55) }}
              >
                <td className="border-r border-[#F2F2F2]">
                  <input type="checkbox" onChange={() => {}} aria-label="개별 선택" />
                </td>
                {/* 주문번호 클릭 시 상세 정보 확인 가능 */}
                <td className="border-r border-[#F2F2F2] text-blue-600 underline">
                  {renderCell(row.orderId)}
                </td>
                <td className="border-r border-[#F2F2F2]">{renderCell(row.status)}</td>
                <td className="border-r border-[#F2F2F2]">{renderCell(row.createdAt)}</td>
                <td className="border-r border-[#F2F2F2]">{renderCell(row.buyerName)}</td>
                <td className="border-r border-[#F2F2F2]">{renderCell(row.productName)}</td>
                <td className="border-r border-[#F2F2F2]">{renderCell(row.quantity)}</td>
                <td className="border-r border-[#F2F2F2] font-bold">
                  {renderCell(row.totalPrice)}
                </td>
                <td className="border-r border-[#F2F2F2]">{renderCell(row.paymentMethod)}</td>
                <td>{renderCell(row.deliveryStatus)}</td>
              </tr>
            );
          })}

          {/* 데이터가 3개 미만일 경우 테이블 모양 유지를 위해 빈 행을 추가함 */}
          {safeData.length < 3 &&
            Array.from({ length: 3 - safeData.length }).map((_, i) => (
              <tr
                key={`empty-order-row-${i}`}
                style={{ height: vw(55) }}
                className="border-b border-[#F2F2F2]"
              >
                <td className="border-r border-[#F2F2F2]" />
                {headers.map((h, hIndex) => (
                  <td
                    key={`empty-td-${i}-${hIndex}`}
                    className={hIndex !== headers.length - 1 ? 'border-r border-[#F2F2F2]' : ''}
                  />
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// Props 타입 정의
OrderTable.propTypes = {
  data: PropTypes.any,
};

export default OrderTable;
