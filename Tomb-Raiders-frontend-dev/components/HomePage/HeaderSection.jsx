import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import WebLogo from '../Common/WebLogo';
import CustomAlertModal from '../Common/CustomAlertModal';
import { getToken } from '../../utils/authUtils';
import TopUtility from './TopUtility';

function HeaderSection({
  vw,
  goToLogin,
  goToCommission,
  goToCommissionCheck,
  goToMember,
  goToBulletinBoard,
  goToAdmin,
  goToPartner,
  goToGuide,
}) {
  const navigate = useNavigate();
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const handleMenuClick = (menu) => {
    if (menu === '커미션') {
      if (!getToken()) {
        setShowLoginAlert(true);
        return;
      }
      // 💡 [수정] goToCommission() 대신 직접 경로로 이동
      navigate('/commissions');
    } else if (menu === '의뢰') {
      if (!getToken()) {
        setShowLoginAlert(true);
        return;
      }
      navigate('/asset');
    } else if (menu === '커뮤니티') {
      goToBulletinBoard();
    } else if (menu === '가이드') {
      if (goToGuide) goToGuide();
      else navigate('/guide');
    }
  };

  return (
    <>
      <header
        className="w-full bg-[#ffffff] flex justify-center border-b border-[#EEE] z-50 sticky top-0"
        style={{ height: vw(80) }}
      >
        <div className="flex items-center justify-between h-full" style={{ width: vw(1200) }}>
          {/* 왼쪽: 로고 및 메뉴 */}
          <div className="flex items-center" style={{ gap: vw(40) }}>
            <WebLogo targetPath="/" className="mb-0" />

            <nav className="flex font-bold text-[#333]" style={{ gap: vw(30) }}>
              {['커미션', '의뢰', '커뮤니티', '가이드'].map((menu) => (
                <button
                  key={menu}
                  type="button"
                  onClick={() => handleMenuClick(menu)}
                  className="hover:text-[#2C9753] transition-colors"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: vw(16),
                    fontFamily: 'inherit',
                  }}
                >
                  {menu}
                </button>
              ))}
            </nav>
          </div>

          {/* 오른쪽: 검색창 및 유틸리티 */}
          <div className="flex items-center" style={{ gap: vw(30) }}>
            <input
              type="text"
              placeholder="게시물 검색"
              className="border border-[#CCC] rounded-full outline-none focus:border-[#2C9753]"
              style={{
                width: vw(250),
                height: vw(40),
                padding: `0 ${vw(20)}`,
                fontSize: vw(14),
              }}
            />
            <TopUtility
              vw={vw}
              goToLogin={goToLogin}
              goToMember={goToMember}
              goToAdmin={goToAdmin}
              goToPartner={goToPartner}
            />
          </div>
        </div>
      </header>

      <CustomAlertModal
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        icon="🔒"
        title="로그인이 필요한 서비스입니다."
        description={`해당 메뉴를 이용하시려면\n먼저 로그인을 진행해주세요.`}
        leftBtnText="닫기"
        rightBtnText="로그인하러 가기"
        onRightBtnClick={() => {
          setShowLoginAlert(false);
          navigate('/login');
        }}
      />
    </>
  );
}

HeaderSection.propTypes = {
  vw: PropTypes.func.isRequired,
  goToLogin: PropTypes.func.isRequired,
  goToCommission: PropTypes.func.isRequired,
  goToCommissionCheck: PropTypes.func.isRequired,
  goToMember: PropTypes.func.isRequired,
  goToBulletinBoard: PropTypes.func.isRequired,
  goToAdmin: PropTypes.func.isRequired,
  goToPartner: PropTypes.func.isRequired,
  goToGuide: PropTypes.func,
};

export default HeaderSection;
