import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vw } from '../../utils/style';
import WebLogo from '../Common/WebLogo';
import { useRouterFunctions } from '../../router';
import { useCurrentUserProfile } from '../../hooks/useCurrentUserProfile';
// 💡 만들어둔 만능 커스텀 모달창 불러오기
import CustomAlertModal from '../Common/CustomAlertModal';

// 💡 쿠키 유틸리티에서 필요한 함수들을 한 번에 불러옵니다 (중복 제거 완료)
import { clearAuth, getToken } from '../../utils/authUtils';

function OrangeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { goToMember } = useRouterFunctions();
  const navigate = useNavigate();
  const { profileImageUrl } = useCurrentUserProfile();

  // 💡 로컬 스토리지 대신 쿠키에 토큰이 있는지 확인합니다.
  const isLoggedIn = !!getToken();

  // 💡 로그아웃 완료 모달창을 제어하는 상태
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  /**
   * 메뉴에서 로그아웃 버튼을 눌렀을 때 실행되는 함수
   * 💡 쿠키를 삭제하고 예쁜 모달창을 띄웁니다.
   */
  const handleLogoutClick = () => {
    clearAuth(); // 쿠키 데이터 즉시 삭제
    setIsMenuOpen(false); // 드롭다운 메뉴 닫기
    setShowLogoutAlert(true); // "로그아웃 되었습니다" 모달창 띄우기
  }; // 💡 함수 닫기 완료

  /**
   * 로그아웃 완료 모달창에서 [확인]을 눌렀을 때 실행되는 함수
   */
  const handleCloseModal = () => {
    setShowLogoutAlert(false);
    globalThis.location.href = '/'; // 메인 페이지로 즉시 이동
  };

  return (
    <>
      <header
        style={{
          width: 'auto',
          height: vw(60),
          backgroundColor: '#2C9753',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${vw(40)}`,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 'calc(100vw - 100%)',
          zIndex: 1000,
          boxShadow: `0 ${vw(2)} ${vw(10)} rgba(0,0,0,0.1)`,
        }}
      >
        {/* 로고 영역 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            height: '100%',
            transform: `scale(0.85) translateY(${vw(20)})`,
            transformOrigin: 'left center',
          }}
        >
          <WebLogo targetPath="/" />
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            marginRight: vw(70),
            gap: vw(20),
          }}
        >
          {isLoggedIn ? (
            /* 🟢 로그인 상태일 때 */
            <>
              <button
                type="button"
                aria-label="프로필 메뉴 토글"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onKeyDown={(e) => handleKeyDown(e, () => setIsMenuOpen(!isMenuOpen))}
                style={{
                  width: vw(40),
                  height: vw(40),
                  backgroundColor: '#D9D9D9',
                  borderRadius: '50%',
                  border: `${vw(6)} solid #FFFFFF`,
                  cursor: 'pointer',
                  padding: 0,
                  outline: 'none',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#FFD580';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FFD580';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#FFFFFF';
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
                    top: vw(55),
                    right: '0px',
                    width: vw(150),
                    backgroundColor: 'white',
                    borderRadius: vw(8),
                    boxShadow: `0 ${vw(4)} ${vw(12)} rgba(0,0,0,0.15)`,
                    border: `${vw(1)} solid #E0E0E0`,
                    padding: `${vw(10)} 0`,
                    overflow: 'hidden',
                    zIndex: 1010,
                  }}
                >
                  {['개인 페이지', '정보 관리', '로그아웃'].map((menu) => (
                    <button
                      key={menu}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        if (menu === '로그아웃') {
                          handleLogoutClick();
                        } else {
                          setIsMenuOpen(false);
                          if (menu === '정보 관리') navigate('/member/edit');
                          else if (menu === '개인 페이지') goToMember();
                        }
                      }}
                      onKeyDown={(e) =>
                        handleKeyDown(e, () => {
                          if (menu === '로그아웃') {
                            handleLogoutClick();
                          } else {
                            setIsMenuOpen(false);
                            if (menu === '정보 관리') navigate('/member/edit');
                            else if (menu === '개인 페이지') goToMember();
                          }
                        })
                      }
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
            </>
          ) : (
            /* 🔴 비로그인 상태일 때 */
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: vw(15),
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#2C9753',
                  border: 'none',
                  borderRadius: vw(20),
                  padding: `${vw(8)} ${vw(20)}`,
                  fontWeight: 'bold',
                  fontSize: vw(15),
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: `0 ${vw(2)} ${vw(6)} rgba(0,0,0,0.1)`,
                  transition: 'transform 0.2s, background-color 0.2s',
                }}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </header>

      {/* 💡 로그아웃 완료 커스텀 모달창 호출 */}
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

export default OrangeHeader;
