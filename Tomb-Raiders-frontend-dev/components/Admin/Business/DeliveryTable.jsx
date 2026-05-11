import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

/**
 * 어드민 비즈니스 관리에서 주문별 배송 상태 및 결제 정보를 확인하는 테이블 컴포넌트
 * 주문번호, 처리상태, 주문일자, 판매자 정보 등을 리스트 형태로 표시함
 */
function DeliveryTable({ data = [] }) {
  // 테이블 헤더 항목 정의
  const headers = ['주문번호', '처리상태', '주문일자', '판매자', '상품 명', '총 비용', '결제방법'];

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
              <input type="checkbox" />
            </th>
            {headers.map((h) => (
              <th key={`delivery-header-${h}`} className="px-3 border-r border-[#BDBDBD] font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 실제 배송 데이터 렌더링 영역 */}
          {data.map((row) => (
            <tr
              key={`delivery-data-${row.orderId || row.id}`}
              className="border-b border-[#E0E0E0]"
              style={{ height: vw(45) }}
            >
              <td className="border-r border-[#E0E0E0]">
                <input type="checkbox" />
              </td>
              <td className="border-r border-[#E0E0E0] text-blue-600 underline">{row.orderId}</td>
              <td className="border-r border-[#E0E0E0]">{row.status}</td>
              <td className="border-r border-[#E0E0E0]">{row.createdAt}</td>
              <td className="border-r border-[#E0E0E0]">{row.sellerName}</td>
              <td className="border-r border-[#E0E0E0]">{row.productName}</td>
              <td className="border-r border-[#E0E0E0] font-bold">{row.totalPrice}</td>
              <td>{row.paymentMethod}</td>
            </tr>
          ))}

          {/* 테이블 레이아웃 유지를 위한 빈 행 렌더링 (최적화 반영) */}
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={`delivery-empty-row-${i}`} style={{ height: vw(45) }}>
              <td colSpan={headers.length + 1} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Props 타입 정의 및 검증
DeliveryTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DeliveryTable;
