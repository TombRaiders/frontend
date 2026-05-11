import React from 'react';
import PropTypes from 'prop-types';

function StyleSelectForm({ style, setStyle, onSubmit, isLoading }) {
  return (
    <div style={{ marginTop: S.vw(30), textAlign: 'left' }}>
      <label htmlFor="style-select" style={S.labelStyle}>
        스타일 선택
      </label>
      <select
        id="style-select"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        style={S.selectStyle}
      >
        <option value="지브리">지브리</option>
        <option value="픽사">픽사</option>
        <option value="실사">실사</option>
      </select>
      <button
        onClick={onSubmit}
        disabled={isLoading}
        style={{
          ...S.submitBtnStyle,
          backgroundColor: isLoading ? '#ccc' : '#2C9753',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? '전송 중...' : '이미지 전송하기'}
      </button>
    </div>
  );
}

StyleSelectForm.propTypes = {
  style: PropTypes.string.isRequired,
  setStyle: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

const S = {
  vw: (size) => `${(size / 1920) * window.innerWidth}px`,
  labelStyle: { display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' },
  selectStyle: {
    width: '100%',
    height: '50px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    padding: '0 15px',
  },
  submitBtnStyle: {
    width: '100%',
    height: '60px',
    backgroundColor: '#2C9753',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    marginTop: '40px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default StyleSelectForm;
