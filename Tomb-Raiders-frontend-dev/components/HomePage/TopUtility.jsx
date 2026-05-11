import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CustomAlertModal from '../Common/CustomAlertModal';
import { getToken, getUserRole, clearAuth } from '../../utils/authUtils';

function TopUtility({ vw, goToLogin, goToMember, goToAdmin, goToPartner }) {
  const token = getToken();
  const role = getUserRole();

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogoutClick = () => {
    clearAuth();
    setShowLogoutAlert(true);
  };

  const handleCloseModal = () => {
    setShowLogoutAlert(false);
    globalThis.location.href = '/';
  };

  // 💡 버튼 공통 스타일 (외곽선 제거, 가로 121, 세로 23, 폰트 15)
  const buttonStyle = {
    width: vw(121),
    height: vw(23),
    fontSize: vw(15),
    border: 'none',
    outline: 'none',
    background: 'transparent',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  return (
    <>
      <div className="flex whitespace-nowrap items-center font-bold text-[#333]">
        {/* 인증 토큰이 있는 경우 (로그인 상태) */}
        {token ? (
          <>
            {role === 'ADMIN' && (
              <button
                type="button"
                onClick={goToAdmin}
                className="hover:text-[#2C9753] transition-colors"
                style={buttonStyle}
              >
                어드민
              </button>
            )}
            {(role === 'PARTNER' || role === 'ADMIN') && (
              <button
                type="button"
                onClick={goToPartner}
                className="hover:text-[#2C9753] transition-colors"
                style={buttonStyle}
              >
                파트너
              </button>
            )}
            <button
              type="button"
              onClick={goToMember}
              className="hover:text-[#2C9753] transition-colors"
              style={buttonStyle}
            >
              마이페이지
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="hover:text-[#2C9753] transition-colors"
              style={buttonStyle}
            >
              로그아웃
            </button>
          </>
        ) : (
          /* 인증 토큰이 없는 경우 (비로그인 상태) - 통합된 버튼 */
          <button
            type="button"
            onClick={goToLogin}
            className="hover:text-[#2C9753] transition-colors"
            style={buttonStyle}
          >
            로그인/회원가입
          </button>
        )}
      </div>

      <CustomAlertModal
        isOpen={showLogoutAlert}
        onClose={handleCloseModal}
        icon="👋"
        title="로그아웃 완료"
        description="정상적으로 로그아웃 되었습니다."
        leftBtnText="확인"
      />
    </>
  );
}

TopUtility.propTypes = {
  vw: PropTypes.func.isRequired,
  goToLogin: PropTypes.func.isRequired,
  goToMember: PropTypes.func.isRequired,
  goToAdmin: PropTypes.func.isRequired,
  goToPartner: PropTypes.func.isRequired,
};

export default TopUtility;
