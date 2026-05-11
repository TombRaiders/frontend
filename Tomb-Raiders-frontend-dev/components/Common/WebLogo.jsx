import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { vw } from '../../utils/style';

/**
 * 서비스의 로고를 표시하고 클릭 시 지정된 경로(기본값: 홈)로 이동시키는 공통 컴포넌트
 * @param {string} logoText - 로고 이미지 부재 시 표시될 텍스트
 * @param {string} targetPath - 클릭 시 이동할 경로
 * @param {string} className - 추가적인 스타일 클래스
 */
function WebLogo({ logoText = '웹로고', targetPath = '/', className = 'mb-[3vw]' }) {
  const logoImgSrc = '/logo.png'; // 로고 이미지가 준비될 경우 파일 경로를 할당함

  return (
    <Link
      to={targetPath}
      className={`${className} flex items-center justify-center no-underline text-white hover:opacity-80 transition-opacity`}
      style={{ display: 'flex' }}
      aria-label={`${logoText} 홈페이지로 이동`}
    >
      {/* 로고 이미지가 있는 경우 이미지로 표시, 없는 경우 텍스트로 표시 */}
      {logoImgSrc ? (
        <img
          src={logoImgSrc}
          alt={logoText}
          style={{ width: vw(180), height: 'auto', objectFit: 'contain' }}
        />
      ) : (
        <span className="font-bold whitespace-nowrap leading-tight" style={{ fontSize: vw(24) }}>
          {logoText}
        </span>
      )}
    </Link>
  );
}

// Props 타입 정의 및 기본값 설정 확인
WebLogo.propTypes = {
  logoText: PropTypes.string,
  targetPath: PropTypes.string,
  className: PropTypes.string,
};

export default WebLogo;
