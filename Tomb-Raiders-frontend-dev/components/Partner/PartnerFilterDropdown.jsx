import React, { useState } from 'react';
import PropTypes from 'prop-types'; // 💡 PropTypes 추가
import { vw } from '../../utils/style';

function PartnerFilterDropdown({ onFilterChange }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({ label: '모든 의뢰 내역', value: '' });

  const filters = [
    { label: '모든 의뢰 내역', value: '' },
    { label: '견적대기', value: 'REQUESTED' },
    { label: '견적 완료', value: 'QUOTED' },
    { label: '결제 완료', value: 'PAID' },
    { label: '제작 중', value: 'PRODUCING' },
    { label: '제작 완료', value: 'PRODUCTION_COMPLETED' },
    { label: '배송 중', value: 'SHIPPING' },
    { label: '배송 완료', value: 'DELIVERED' },
    { label: '주문 취소', value: 'CANCELED' },
  ];

  const handleSelect = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
    if (onFilterChange) onFilterChange(filter.value);
  };

  return (
    <div className="relative" style={{ width: vw(200) }}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex justify-between items-center bg-white border border-[#BDBDBD] text-gray-800 focus:outline-none shadow-sm cursor-pointer"
        style={{ padding: `${vw(10)} ${vw(20)}`, fontSize: vw(14), borderRadius: vw(4) }}
      >
        <span className="font-medium">{selectedFilter.label}</span>
        <span className="text-gray-500" style={{ fontSize: vw(10) }}>
          ▼
        </span>
      </button>

      {isDropdownOpen && (
        <div
          className="absolute left-0 w-full bg-white border border-[#BDBDBD] shadow-md overflow-hidden z-10"
          style={{ top: vw(48), borderRadius: vw(4) }}
        >
          {filters.map((filter, index) => (
            <React.Fragment key={filter.value || 'ALL'}>
              <button
                type="button"
                className={`w-full text-left cursor-pointer border-none outline-none transition-colors ${
                  selectedFilter.value === filter.value
                    ? 'bg-[#F0F0F0] text-black font-bold'
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}
                style={{ padding: `${vw(12)} ${vw(20)}`, fontSize: vw(14) }}
                onClick={() => handleSelect(filter)}
              >
                {filter.label}
              </button>
              {index < filters.length - 1 && <div className="border-t border-[#E0E0E0]" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// 💡 PropTypes 검증 추가
PartnerFilterDropdown.propTypes = {
  onFilterChange: PropTypes.func,
};

export default PartnerFilterDropdown;
