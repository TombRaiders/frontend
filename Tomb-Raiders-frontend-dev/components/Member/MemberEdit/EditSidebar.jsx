import React from 'react';
import PropTypes from 'prop-types';

function EditSidebar({ vw, activeMenu, onMenuClick }) {
  const isInfoActive = activeMenu === '정보 관리';
  const isAddressActive = activeMenu === '배송지 관리';

  return (
    <div
      style={{
        width: vw(180),
        backgroundColor: '#F7F7F7',
        borderRadius: vw(10),
        border: `${vw(1)} solid #E0E0E0`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. 정보 관리 탭 */}
      <button
        type="button"
        onClick={() => onMenuClick('정보 관리')}
        style={{
          width: '100%',
          border: 'none',
          display: 'block',
          padding: `${vw(15)} 0`,
          textAlign: 'center',
          fontSize: vw(14),
          cursor: 'pointer',
          backgroundColor: isInfoActive ? '#FFFFFF' : 'transparent',
          color: isInfoActive ? '#333333' : '#B0B0B0',
          fontWeight: isInfoActive ? 'bold' : 'normal',
          borderBottom: `${vw(1)} solid #E0E0E0`,
          transition: 'all 0.1s ease',
          outline: 'none',
        }}
      >
        정보 관리
      </button>

      {/* 2. 배송지 관리 탭 */}
      <button
        type="button"
        onClick={() => onMenuClick('배송지 관리')}
        style={{
          width: '100%',
          border: 'none',
          display: 'block',
          padding: `${vw(15)} 0`,
          textAlign: 'center',
          fontSize: vw(14),
          cursor: 'pointer',
          backgroundColor: isAddressActive ? '#FFFFFF' : 'transparent',
          color: isAddressActive ? '#333333' : '#B0B0B0',
          fontWeight: isAddressActive ? 'bold' : 'normal',
          transition: 'all 0.1s ease',
          outline: 'none',
        }}
      >
        배송지 관리
      </button>
    </div>
  );
}

EditSidebar.propTypes = {
  vw: PropTypes.func.isRequired,
  activeMenu: PropTypes.string.isRequired,
  onMenuClick: PropTypes.func.isRequired,
};

export default EditSidebar;
