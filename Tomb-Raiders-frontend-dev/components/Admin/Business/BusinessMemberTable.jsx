import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

/**
 * 어드민 페이지에서 비즈니스(파트너) 회원 목록을 조회하고 상세 정보 확인 및 권한 해제를 관리하는 테이블 컴포넌트
 * @param {Array} data - 비즈니스 회원 정보 객체 배열
 * @param {function} onDelete - 특정 회원의 권한을 해제하는 함수 (대상 ID를 인자로 받음)
 * @param {function} onView - 특정 회원의 상세 정보를 팝업으로 띄우는 함수 (대상 객체를 인자로 받음)
 */
function BusinessMemberTable({ data, onDelete, onView }) {
  return (
    <div className="bg-white border border-[#BDBDBD] rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-center border-collapse" style={{ fontSize: vw(14) }}>
        <thead>
          <tr className="border-b border-[#BDBDBD] bg-[#F9F9F9]" style={{ height: vw(55) }}>
            <th className="border-r border-[#BDBDBD] w-[15%]">회원 번호</th>
            <th className="border-r border-[#BDBDBD] w-[20%]">이름(아이디)</th>
            <th className="border-r border-[#BDBDBD] w-[25%]">연락처</th>
            <th className="border-r border-[#BDBDBD] w-[15%]">지역</th>
            <th className="w-[25%]">관리</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            // 파트너 ID 또는 일반 ID 필드를 식별자로 사용
            const targetId = row.partnerId || row.id;

            return (
              <tr
                key={targetId}
                className="border-b border-[#E0E0E0] last:border-b-0 hover:bg-gray-50"
                style={{ height: vw(55) }}
              >
                <td className="border-r border-[#E0E0E0]">{targetId}</td>
                <td className="border-r border-[#E0E0E0]">
                  {row.name || '-'}{' '}
                  <span className="text-gray-400 text-xs">({row.memberId || '-'})</span>
                </td>
                <td className="border-r border-[#E0E0E0]">{row.contact || '-'}</td>
                <td className="border-r border-[#E0E0E0] text-gray-600">{row.location || '-'}</td>
                <td className="flex items-center justify-center gap-2" style={{ height: vw(55) }}>
                  {/* [상세] 버튼: 회원의 세부 정보를 확인하는 기능 */}
                  <button
                    type="button"
                    onClick={() => onView(row)}
                    className="bg-[#ffffff] text-white px-3 py-1 text-[11px] rounded-sm transition-colors hover:bg-[#F9F9F9]"
                    style={{ border: '1px solid #DDD' }}
                  >
                    상세
                  </button>

                  {/* [권한 해제] 버튼: 파트너 권한을 박탈하고 일반 회원으로 변경 */}
                  <button
                    type="button"
                    onClick={() => onDelete(targetId)}
                    className="bg-[#ffffff] text-white px-3 py-1 text-[11px] rounded-sm transition-colors hover:bg-[#F9F9F9]"
                    style={{ border: '1px solid #DDD' }}
                  >
                    권한 해제
                  </button>
                </td>
              </tr>
            );
          })}

          {/* 데이터가 없을 경우 표시되는 영역 */}
          {data.length === 0 && (
            <tr>
              <td colSpan="5" className="py-10 text-gray-400">
                등록된 비지니스 회원이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Props 타입 정의 및 검증
BusinessMemberTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

export default BusinessMemberTable;
