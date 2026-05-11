import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CustomAlertModal from '../Common/CustomAlertModal';
import { useCurrentUserProfile } from '../../hooks/useCurrentUserProfile';
import { clearAuth } from '../../utils/authUtils';

const MENU_ITEMS = ['개인 페이지', '정보 관리', '로그아웃'];

function ProfileDropdown({
  vw,
  isMenuOpen,
  setIsMenuOpen,
  onProfileClick,
  onEditClick,
  wrapperStyle = {},
  logoutIcon = '👋',
}) {
  const { profileImageUrl } = useCurrentUserProfile();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const handleLogoutClick = () => {
    clearAuth();
    setIsMenuOpen(false);
    setShowLogoutAlert(true);
  };

  const handleCloseModal = () => {
    setShowLogoutAlert(false);
    globalThis.location.href = '/';
  };

  const handleMenuClick = (menu) => {
    if (menu === '로그아웃') {
      handleLogoutClick();
      return;
    }

    setIsMenuOpen(false);
    if (menu === '개인 페이지') onProfileClick?.();
    if (menu === '정보 관리') onEditClick?.();
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: vw(15),
          left: vw(1390),
          zIndex: 110,
          ...wrapperStyle,
        }}
      >
        <button
          type="button"
          aria-label="프로필 메뉴 토글"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onKeyDown={(e) => handleKeyDown(e, () => setIsMenuOpen(!isMenuOpen))}
          style={{
            width: vw(50),
            height: vw(50),
            backgroundColor: '#D9D9D9',
            borderRadius: '50%',
            border: `${vw(2)} solid #FFFFFF`,
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
            display: 'block',
            overflow: 'hidden',
          }}
        >
          {profileImageUrl && (
            <img
              src={profileImageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: vw(60),
              right: '0px',
              width: vw(150),
              backgroundColor: 'white',
              borderRadius: vw(8),
              boxShadow: `0 ${vw(4)} ${vw(12)} rgba(0,0,0,0.15)`,
              border: `${vw(1)} solid #E0E0E0`,
              padding: `${vw(10)} 0`,
              overflow: 'hidden',
            }}
          >
            {MENU_ITEMS.map((menu) => (
              <button
                key={menu}
                type="button"
                role="menuitem"
                onClick={() => handleMenuClick(menu)}
                onKeyDown={(e) => handleKeyDown(e, () => handleMenuClick(menu))}
                style={{
                  width: '100%',
                  padding: `${vw(12)} ${vw(20)}`,
                  fontSize: vw(14),
                  color: '#333',
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: 'transparent',
                  display: 'block',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {menu}
              </button>
            ))}
          </div>
        )}
      </div>

      <CustomAlertModal
        isOpen={showLogoutAlert}
        onClose={handleCloseModal}
        icon={logoutIcon}
        title="로그아웃 완료"
        description="정상적으로 로그아웃 되었습니다."
        leftBtnText="확인"
      />
    </>
  );
}

ProfileDropdown.propTypes = {
  vw: PropTypes.func.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  setIsMenuOpen: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func,
  onEditClick: PropTypes.func,
  wrapperStyle: PropTypes.object,
  logoutIcon: PropTypes.node,
};

export default ProfileDropdown;
