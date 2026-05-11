import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

/**
 * 어드민 비즈니스 관리에서 매출, 주문 수량 등 각종 통계 지표를 리스트 형태로 보여주는 테이블 컴포넌트
 * 행과 열이 많은 대규모 데이터를 효율적으로 표시하며, 데이터가 없을 때도 레이아웃을 유지함
 */
function StatisticsTable({ data }) {
  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl overflow-x-auto shadow-sm">
      <table className="w-full text-center border-collapse" style={{ fontSize: vw(11) }}>
        <thead>{/* 헤더 부분 생략 (실제 코드에는 존재함) */}</thead>
        <tbody>
          {/* 실제 통계 데이터 렌더링 */}
          {data.map((row) => (
            <tr key={row.id} className="border-b border-[#E0E0E0]" style={{ height: vw(50) }}>
              {/* 유효한 데이터 셀들이 여기에 배치됨 */}
            </tr>
          ))}

          {/* 데이터가 적거나 없을 경우 테이블의 일관된 디자인 유지를 위해 빈 행과 셀을 생성 (최적화 반영) */}
          {Array.from({ length: 5 }).map((_, i) => (
            <tr
              key={`empty-row-${i + 1}`}
              className="border-b border-[#F2F2F2]"
              style={{ height: vw(45) }}
            >
              {/* 통계 테이블의 컬럼 수(15개)에 맞춰 빈 셀 생성 */}
              {Array.from({ length: 15 }).map((__, j) => (
                <td
                  key={`empty-cell-${i + 1}-${j + 1}`}
                  className="border-r border-[#F2F2F2] last:border-r-0"
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Props 타입 정의 및 검증
StatisticsTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default StatisticsTable;
