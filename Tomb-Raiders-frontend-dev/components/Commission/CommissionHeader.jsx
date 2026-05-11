import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import WebLogo from '../Common/WebLogo';
import { useCurrentUserProfile } from '../../hooks/useCurrentUserProfile';
import { clearAuth } from '../../utils/authUtils'; // 💡 로그아웃 기능을 위해 임포트

function CommissionHeader({
  title,
  disableBack,
  compactTitleSection = false,
  backButtonLeft,
  backButtonTop,
  backButtonTransform,
}) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { profileImageUrl } = useCurrentUserProfile();

  // 💡 드롭다운 외부 영역 클릭 시 메뉴 닫기 로직
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMyPage = () => {
    setIsDropdownOpen(false);
    navigate('/member'); // 💡 마이페이지 라우팅 경로 (필요시 수정하세요)
  };

  const handleLogout = () => {
    clearAuth(); // 💡 로컬 스토리지/쿠키의 토큰 삭제
    setIsDropdownOpen(false);
    alert('로그아웃 되었습니다.');
    navigate('/'); // 메인 페이지로 이동
  };

  // 💡 [수정됨] 마우스 호버 이벤트를 위한 인라인 스타일 헬퍼 (중괄호 사용)
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = '#F5F5F5';
  };
  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  return (
    <>
      {/* 1. 상단 글로벌 헤더 (홈페이지 스타일) */}
      <header style={globalHeaderStyle}>
        <div style={headerInnerStyle}>
          <WebLogo targetPath="/" className="mb-0" />

          {/* 💡 우측 프로필 아이콘 및 드롭다운 컨테이너 */}
          <div style={profileContainerStyle} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={profileBtnStyle}
              aria-label="프로필 메뉴 토글"
              title="프로필 메뉴 열기"
            >
              <div style={profileCircleStyle}>
                {profileImageUrl && (
                  <img
                    src={profileImageUrl}
                    alt=""
                    style={profileImageStyle}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </button>

            {/* 💡 드롭다운 메뉴 UI */}
            {isDropdownOpen && (
              <div style={dropdownMenuStyle}>
                <button
                  onClick={handleMyPage}
                  style={dropdownItemStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  마이페이지
                </button>
                <div style={{ width: '100%', height: '1px', backgroundColor: '#EEE' }} />
                <button
                  onClick={handleLogout}
                  style={{ ...dropdownItemStyle, color: '#FF4D4F' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. 페이지 타이틀 및 뒤로가기 영역 */}
      <div style={titleSectionStyle}>
        <div style={compactTitleSection ? compactTitleInnerStyle : titleInnerStyle}>
          <button
            onClick={() => !disableBack && navigate(-1)}
            style={{
              ...backBtnStyle,
              left: backButtonLeft || backBtnStyle.left,
              top: backButtonTop || backBtnStyle.top,
              transform: backButtonTransform || backBtnStyle.transform,
              cursor: disableBack ? 'not-allowed' : 'pointer',
              color: disableBack ? '#CCC' : '#333',
            }}
            disabled={disableBack}
          >
            &lt; 목록으로
          </button>
          <h1 style={titleStyle}>{title}</h1>
        </div>
      </div>
    </>
  );
}

CommissionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  disableBack: PropTypes.bool,
  compactTitleSection: PropTypes.bool,
  backButtonLeft: PropTypes.string,
  backButtonTop: PropTypes.string,
  backButtonTransform: PropTypes.string,
};

// --- 스타일 정의 ---

const globalHeaderStyle = {
  height: vw(80),
  backgroundColor: '#FFFFFF',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottom: `${vw(1)} solid #EEE`,
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1000,
  boxSizing: 'border-box',
};

const headerInnerStyle = {
  width: '100%',
  padding: `0 ${vw(100)}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxSizing: 'border-box',
};

const profileContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const profileBtnStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
};

const profileCircleStyle = {
  width: vw(40),
  height: vw(40),
  borderRadius: '50%',
  backgroundColor: '#D9D9D9',
  border: '1px solid #EAEAEA',
  overflow: 'hidden',
};

const profileImageStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
  display: 'block',
};

const dropdownMenuStyle = {
  position: 'absolute',
  top: vw(50),
  right: 0,
  width: vw(120),
  backgroundColor: '#FFFFFF',
  borderRadius: vw(8),
  border: `1px solid #EAEAEA`,
  boxShadow: `0 ${vw(4)} ${vw(12)} rgba(0,0,0,0.1)`,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1010,
};

const dropdownItemStyle = {
  width: '100%',
  padding: `${vw(12)} 0`,
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: vw(14),
  color: '#333',
  fontWeight: '500',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'background-color 0.2s',
};

const titleSectionStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  paddingTop: vw(80),
  backgroundColor: 'transparent',
};

const titleInnerStyle = {
  width: '100%',
  padding: `${vw(40)} 0`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxSizing: 'border-box',
};

const compactTitleInnerStyle = {
  ...titleInnerStyle,
  padding: `${vw(16)} 0`,
};

const backBtnStyle = {
  position: 'absolute',
  left: vw(100),
  background: 'none',
  border: 'none',
  color: '#333',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: vw(16),
  padding: 0,
};

const titleStyle = {
  color: '#333',
  fontSize: vw(20),
  fontWeight: 'bold',
  margin: 0,
};

export default CommissionHeader;
