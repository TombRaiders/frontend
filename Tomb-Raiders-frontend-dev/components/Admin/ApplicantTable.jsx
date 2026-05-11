import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

/**
 * 신규 관리자 권한을 신청한 사용자들의 목록을 보여주고, 승인 또는 거절 처리를 수행하는 테이블 컴포넌트
 * @param {Array} applicants - 신청자 정보 객체 배열
 * @param {function} onApprove - 수락 버튼 클릭 시 실행될 함수 (신청자 ID를 인자로 받음)
 * @param {function} onReject - 거절 버튼 클릭 시 실행될 함수 (신청자 ID를 인자로 받음)
 */
function ApplicantTable({ applicants, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-[1vw] shadow-sm border border-[#EEE] p-[1.5vw] w-full">
      <h2 className="font-bold mb-[1vw] text-left text-[#1A1A1A]" style={{ fontSize: vw(18) }}>
        신규 관리자 신청자 목록 : {applicants.length}
      </h2>
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr
            className="border-b border-gray-200 text-gray-500 font-medium text-left"
            style={{ fontSize: vw(14) }}
          >
            <th className="p-[1vw] w-[20%]">신청 번호</th>
            <th className="p-[1vw] w-[20%]">닉네임</th>
            <th className="p-[1vw] w-[20%]">신청 날짜</th>
            <th className="p-[1vw] w-[20%]">신청 담당</th>
            <th className="p-[1vw] w-[20%] text-center">기능</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((app) => (
            <tr
              key={app.id}
              style={{ fontSize: vw(14) }}
              className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
            >
              <td className="p-[1vw] text-left text-gray-700">{app.id}</td>
              <td className="p-[1vw] text-left text-gray-700">{app.nickname}</td>
              <td className="p-[1vw] text-left text-gray-700">{app.date}</td>
              <td className="p-[1vw] text-left text-gray-700">{app.role}</td>
              <td className="p-[1vw]">
                <div className="flex gap-[0.5vw] justify-center">
                  {/* 수락 버튼: 클릭 시 부모로부터 받은 승인 처리 함수 호출 */}
                  <button
                    type="button"
                    onClick={() => onApprove(app.id)}
                    className="bg-[#B4B4B4] text-white px-[1vw] py-[0.3vw] rounded-[0.2vw] cursor-pointer hover:bg-blue-500 border-none transition-colors"
                    style={{ fontSize: vw(12) }}
                  >
                    수락
                  </button>

                  {/* 거절 버튼: 클릭 시 부모로부터 받은 거절 처리 함수 호출 */}
                  <button
                    type="button"
                    onClick={() => onReject(app.id)}
                    className="bg-[#777777] text-white px-[1vw] py-[0.3vw] rounded-[0.2vw] cursor-pointer hover:bg-red-500 border-none transition-colors"
                    style={{ fontSize: vw(12) }}
                  >
                    거절
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Props 타입 정의 및 필수 검증
ApplicantTable.propTypes = {
  applicants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nickname: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default ApplicantTable;
