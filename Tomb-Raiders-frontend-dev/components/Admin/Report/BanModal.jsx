import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';
import CommonAdminModal from './CommonAdminModal';

export default function BanModal({ modalData, setModalData, onSearch, onSubmit, onClose }) {
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
      title="악성 유저 차단"
      icon="🚨"
      onClose={onClose}
      onSubmit={onSubmit}
      submitText="차단하기"
      submitColor="#EF4444"
    >
      <div style={{ marginBottom: vw(20) }}>
        <label htmlFor="ban-search-id" style={labelStyle}>
          로그인 ID로 회원 검색
        </label>
        <div style={{ display: 'flex', gap: vw(10) }}>
          <input
            id="ban-search-id"
            type="text"
            value={modalData.searchLoginId}
            onChange={(e) => setModalData({ ...modalData, searchLoginId: e.target.value })}
            style={inputStyle}
            placeholder="로그인 ID (loginId)"
          />
          <button
            type="button"
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

      <div
        style={{ marginBottom: vw(20), paddingTop: vw(20), borderTop: `${vw(1)} solid #E2E8F0` }}
      >
        <label htmlFor="ban-target-id" style={{ ...labelStyle, color: '#EF4444' }}>
          차단 대상 회원 ID (숫자)
        </label>
        <input
          id="ban-target-id"
          type="number"
          value={modalData.memberId}
          onChange={(e) => setModalData({ ...modalData, memberId: e.target.value })}
          style={{ ...inputStyle, border: `${vw(1)} solid #EF4444`, backgroundColor: '#FEF2F2' }}
          placeholder="조회 시 자동 입력"
        />
      </div>

      <div style={{ marginBottom: vw(20) }}>
        <label htmlFor="ban-reason-field" style={labelStyle}>
          차단 사유
        </label>
        <input
          id="ban-reason-field"
          type="text"
          value={modalData.reason}
          onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
          style={inputStyle}
          placeholder="욕설 및 비방 등"
        />
      </div>

      <div>
        <label htmlFor="ban-day-field" style={labelStyle}>
          정지 기간 (일)
        </label>
        <input
          id="ban-day-field"
          type="number"
          value={modalData.day}
          onChange={(e) => setModalData({ ...modalData, day: e.target.value })}
          style={inputStyle}
          placeholder="미입력 시 영구 정지"
        />
      </div>
    </CommonAdminModal>
  );
}

BanModal.propTypes = {
  modalData: PropTypes.object.isRequired,
  setModalData: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
