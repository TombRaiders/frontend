import React from 'react';
import PropTypes from 'prop-types'; // 💡 PropTypes 추가
import { vw } from '../../utils/style';

const getVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
};

function PartnerPagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const safeTotalPages = Math.max(Number(totalPages || 1), 1);
  const safeCurrentPage = Math.min(Math.max(Number(currentPage || 1), 1), safeTotalPages);
  const visiblePages = getVisiblePages(safeCurrentPage, safeTotalPages);

  return (
    <div
      className="flex justify-center items-center text-gray-500 bg-[#F9F9F9] border-t border-[#E0E0E0]"
      style={{ padding: `${vw(16)} 0`, gap: vw(16), fontSize: vw(14) }}
    >
      <button
        type="button"
        onClick={() => onPageChange?.(Math.max(1, safeCurrentPage - 1))}
        disabled={safeCurrentPage === 1}
        className="hover:text-black border-none outline-none bg-transparent cursor-pointer font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &lt;
      </button>

      {visiblePages.map((page) => {
        const isActive = page === safeCurrentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            disabled={isActive}
            aria-current={isActive ? 'page' : undefined}
            className={`border-none outline-none bg-transparent transition-colors ${
              isActive ? 'text-black font-bold cursor-default' : 'cursor-pointer hover:text-black'
            }`}
            style={{ minWidth: vw(20) }}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange?.(Math.min(safeTotalPages, safeCurrentPage + 1))}
        disabled={safeCurrentPage === safeTotalPages}
        className="hover:text-black border-none outline-none bg-transparent cursor-pointer font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    </div>
  );
}

// 💡 PropTypes 검증 추가
PartnerPagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
};

export default PartnerPagination;
