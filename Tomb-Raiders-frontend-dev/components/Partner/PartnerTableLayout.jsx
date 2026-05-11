import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import PartnerPagination from './PartnerPagination';

function PartnerTableLayout({
  columnsCount,
  headers,
  isLoading,
  isEmpty,
  emptyMessage,
  children,
  pagination,
}) {
  // 💡 중첩 삼항 연산자를 피하기 위해 렌더링 함수로 분리
  const renderBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={columnsCount} style={{ padding: vw(30) }}>
            로딩 중...
          </td>
        </tr>
      );
    }

    if (isEmpty) {
      return (
        <tr>
          <td colSpan={columnsCount} style={{ padding: vw(30), color: '#999' }}>
            {emptyMessage}
          </td>
        </tr>
      );
    }

    return children;
  };

  return (
    <div
      className="bg-white border border-[#BDBDBD] overflow-hidden shadow-sm"
      style={{ borderRadius: vw(12) }}
    >
      <table className="w-full text-center border-collapse" style={{ fontSize: vw(14) }}>
        <thead>
          <tr className="border-b border-[#BDBDBD] bg-[#F9F9F9]" style={{ height: vw(55) }}>
            {/* 각 테이블마다 다른 헤더가 들어갈 자리 */}
            {headers}
          </tr>
        </thead>
        <tbody>
          {/* 💡 분리한 함수 호출 */}
          {renderBody()}
        </tbody>
      </table>
      {pagination?.totalPages > 1 && (
        <PartnerPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}

PartnerTableLayout.propTypes = {
  columnsCount: PropTypes.number.isRequired,
  headers: PropTypes.node.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isEmpty: PropTypes.bool.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  children: PropTypes.node,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
  }),
};

export default PartnerTableLayout;
