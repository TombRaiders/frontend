import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

function Logo({ vw, style }) {
  const navigate = useNavigate();
  const logoImgSrc = '/logo.png';

  return (
    <button
      type="button"
      onClick={() => navigate('/')} // 클릭 시 메인 홈페이지('/')로 이동
      style={{
        width: vw(180),
        height: vw(108),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        border: 'none',
        background: 'transparent',
        padding: 0,
        ...style,
      }}
    >
      <img
        src={logoImgSrc}
        alt="로고이미지"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </button>
  );
}
Logo.propTypes = {
  vw: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default Logo;
