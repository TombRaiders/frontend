import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

/**
 * 어드민 페이지에서 새로운 비즈니스(파트너) 신청 내역을 확인하고 승인 또는 거절을 처리하는 테이블 컴포넌트
 * @param {Array} data - 비즈니스 신청 정보 객체 배열
 * @param {function} onApprove - 신청을 최종 승인 처리하는 함수 (대상 ID를 인자로 받음)
 * @param {function} onReject - 신청을 거절 처리하는 함수 (대상 ID를 인자로 받음)
 * @param {function} onView - 신청자의 세부 정보를 팝업으로 확인하는 함수 (대상 객체를 인자로 받음)
 */
function BusinessRequestTable({ data, onApprove, onReject, onView }) {
  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-center border-collapse" style={{ fontSize: vw(14) }}>
        <thead>
          <tr className="border-b border-[#BDBDBD] bg-[#F9F9F9]" style={{ height: vw(55) }}>
            <th className="border-r border-[#BDBDBD] w-[15%]">신청 번호</th>
            <th className="border-r border-[#BDBDBD] w-[20%]">이름(아이디)</th>
            <th className="border-r border-[#BDBDBD] w-[25%]">연락처</th>
            <th className="border-r border-[#BDBDBD] w-[15%]">지역</th>
            <th className="w-[25%]">관리</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            // 파트너 ID를 고유 식별자로 사용
            const targetId = row.partnerId;

            return (
              <tr
                key={targetId}
                className="border-b border-[#E0E0E0] last:border-b-0 hover:bg-gray-50"
                style={{ height: vw(55) }}
              >
                <td className="border-r border-[#E0E0E0]">{targetId}</td>
                <td className="border-r border-[#E0E0E0]">
                  {row.name} <span className="text-gray-400 text-xs">({row.memberId})</span>
                </td>
                <td className="border-r border-[#E0E0E0]">{row.contact || '-'}</td>
                <td className="border-r border-[#E0E0E0] text-gray-600">{row.location || '-'}</td>
                <td className="flex items-center justify-center gap-2" style={{ height: vw(55) }}>
                  {/* [상세] 버튼: 신청자의 도입 정보를 팝업으로 확인 */}
                  <button
                    type="button"
                    onClick={() => onView(row)}
                    className="bg-[#ffffff] text-white px-3 py-1 text-[11px] rounded-sm transition-colors hover:bg-[#F9F9F9]"
                    style={{ border: '1px solid #DDD' }}
                  >
                    상세
                  </button>

                  {/* [수락] 버튼: 비즈니스 파트너로 최종 승인 */}
                  <button
                    type="button"
                    onClick={() => onApprove(targetId)}
                    className="bg-blue-500 text-white px-3 py-1 text-[11px] rounded-sm transition-colors hover:bg-blue-600"
                  >
                    수락
                  </button>

                  {/* [거절] 버튼: 신청 내역을 반려 처리 */}
                  <button
                    type="button"
                    onClick={() => onReject(targetId)}
                    className="bg-red-500 text-white px-3 py-1 text-[11px] rounded-sm transition-colors hover:bg-red-600"
                  >
                    거절
                  </button>
                </td>
              </tr>
            );
          })}

          {/* 신청 내역이 없을 경우의 예외 처리 */}
          {data.length === 0 && (
            <tr>
              <td colSpan="5" className="py-10 text-gray-400">
                신청 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Props 타입 정의 및 검증
BusinessRequestTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

export default BusinessRequestTable;
