import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';
import CommonAdminModal from './CommonAdminModal'; // 💡 공통 모달 임포트

export default function UnbanModal({ modalData, setModalData, onSearch, onSubmit, onClose }) {
  // 공통 스타일 추출 (중복 제거)
  const labelStyle = {
    display: 'block',
    fontSize: vw(14),
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: vw(8),
  };

  const inputStyle = {
    width: '100%',
    padding: vw(12),
    border: `${vw(1)} solid #CBD5E1`,
    borderRadius: vw(8),
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: vw(14),
  };

  return (
    <CommonAdminModal
      isOpen={modalData.isOpen}
      title="수동 차단 해제"
      icon="🔓"
      onClose={onClose}
      onSubmit={onSubmit}
      submitText="해제하기"
      submitColor="#10B981"
    >
      {/* 1. 회원 검색 영역 */}
      <div style={{ marginBottom: vw(20) }}>
        <label htmlFor="unban-search-login-id" style={labelStyle}>
          로그인 ID로 회원 검색
        </label>
        <div style={{ display: 'flex', gap: vw(10) }}>
          <input
            id="unban-search-login-id"
            type="text"
            value={modalData.searchLoginId}
            onChange={(e) => setModalData({ ...modalData, searchLoginId: e.target.value })}
            style={inputStyle}
            placeholder="로그인 ID (loginId)"
          />
          <button
            onClick={onSearch}
            style={{
              padding: `0 ${vw(20)}`,
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: vw(8),
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: vw(14),
            }}
          >
            조회
          </button>
        </div>
      </div>

      {/* 2. 대상 ID 표시 영역 */}
      <div
        style={{
          marginBottom: vw(30),
          paddingTop: vw(20),
          borderTop: `${vw(1)} solid #E2E8F0`,
        }}
      >
        <label htmlFor="unban-member-id" style={{ ...labelStyle, color: '#10B981' }}>
          해제 대상 회원 ID (숫자)
        </label>
        <input
          id="unban-member-id"
          type="number"
          value={modalData.memberId}
          onChange={(e) => setModalData({ ...modalData, memberId: e.target.value })}
          style={{
            ...inputStyle,
            border: `${vw(1)} solid #10B981`,
            backgroundColor: '#ECFDF5',
          }}
          placeholder="위에서 조회 시 자동 입력됩니다"
        />
      </div>
    </CommonAdminModal>
  );
}

UnbanModal.propTypes = {
  modalData: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
    searchLoginId: PropTypes.string,
    memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setModalData: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
