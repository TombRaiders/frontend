import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

/**
 * 서비스 관리자들의 목록을 보여주고, 모드에 따라 단순 상태 조회 또는 세부 권한 설정을 수행하는 테이블 컴포넌트
 * @param {string} viewMode - 테이블의 표시 모드 ('list': 단순 목록, 'permission': 권한 설정)
 * @param {Array} admins - 관리자 정보 객체 배열
 * @param {function} onPermissionChange - 권한 체크박스 변경 시 호출되는 이벤트 핸들러
 */
function AdminTable({ viewMode, admins, onPermissionChange }) {
  return (
    <table className="w-full border-collapse table-fixed">
      <thead>
        <tr
          className="border-b border-gray-200 text-gray-500 font-medium"
          style={{ fontSize: vw(14) }}
        >
          {/* 전체 선택 체크박스 (현재 기능 미구현) */}
          <th className="p-[1vw] text-left w-[5%]">
            <input type="checkbox" className="cursor-pointer" />
          </th>
          <th className="p-[1vw] text-left w-[15%]">관리자 번호</th>
          <th className="p-[1vw] text-left w-[20%]">관리자 닉네임</th>
          <th className="p-[1vw] text-left w-[20%]">담당 역할</th>

          {/* 모드에 따른 헤더 조건부 렌더링 */}
          {viewMode === 'list' ? (
            <th className="p-[1vw] text-left w-[40%]">상태</th>
          ) : (
            <>
              <th className="p-[1vw] text-center w-[10%]">의뢰 목록</th>
              <th className="p-[1vw] text-center w-[10%]">비즈니스</th>
              <th className="p-[1vw] text-center w-[10%]">금융 관리</th>
              <th className="p-[1vw] text-center w-[10%]">배송 관리</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {admins.map((admin) => (
          <tr
            key={admin.id}
            className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            style={{ fontSize: vw(14) }}
          >
            <td className="p-[1vw] text-left">
              <input type="checkbox" className="cursor-pointer" />
            </td>
            <td className="p-[1vw] text-left text-gray-700">{admin.id}</td>
            <td className="p-[1vw] text-left text-gray-700">{admin.nickname}</td>
            <td className="p-[1vw] text-left text-gray-700">{admin.role}</td>

            {/* 모드에 따른 데이터 셀 조건부 렌더링 */}
            {viewMode === 'list' ? (
              <td className="p-[1vw] text-left">
                <span
                  className="inline-block bg-green-100 text-green-600 px-[0.6vw] py-[0.2vw] rounded-[0.2vw] font-medium"
                  style={{ fontSize: vw(12) }}
                >
                  {admin.status}
                </span>
              </td>
            ) : (
              <>
                {/* 각 세부 권한별 체크박스 설정 영역 */}
                <td className="p-[1vw] text-center">
                  <input
                    type="checkbox"
                    checked={admin.permissions.request}
                    onChange={() => onPermissionChange(admin.id, 'request')}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-[1vw] text-center">
                  <input
                    type="checkbox"
                    checked={admin.permissions.business}
                    onChange={() => onPermissionChange(admin.id, 'business')}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-[1vw] text-center">
                  <input
                    type="checkbox"
                    checked={admin.permissions.finance}
                    onChange={() => onPermissionChange(admin.id, 'finance')}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-[1vw] text-center">
                  <input
                    type="checkbox"
                    checked={admin.permissions.delivery}
                    onChange={() => onPermissionChange(admin.id, 'delivery')}
                    className="cursor-pointer"
                  />
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Props 타입 정의 및 필수 검증
AdminTable.propTypes = {
  viewMode: PropTypes.string.isRequired,
  admins: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nickname: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      status: PropTypes.string,
      permissions: PropTypes.shape({
        request: PropTypes.bool,
        business: PropTypes.bool,
        finance: PropTypes.bool,
        delivery: PropTypes.bool,
      }).isRequired,
    }),
  ).isRequired,
  onPermissionChange: PropTypes.func.isRequired,
};

export default AdminTable;
