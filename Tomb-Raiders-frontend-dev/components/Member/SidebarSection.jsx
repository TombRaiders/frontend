import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import { post } from '../../api/apiClient';
// 💡 프로젝트 전체 통일성을 위해 만능 모달창을 사용합니다.
import CustomAlertModal from '../Common/CustomAlertModal';
// 💡 이제 로컬 스토리지 대신 쿠키에서 권한을 가져오기 위해 유틸을 불러옵니다!
import { getUserRole } from '../../utils/authUtils';

/**
 * 사이드바 내부에서 사용하는 개별 카드 UI 컴포넌트
 */
function SidebarCard({ title, btnText, onClick }) {
  return (
    <div
      style={{
        backgroundColor: '#FFF',
        padding: vw(20),
        borderRadius: vw(10),
        border: `${vw(1)} solid #B4B4B4`,
      }}
    >
      <h3
        style={{
          fontSize: vw(20),
          fontWeight: 'bold',
          marginBottom: vw(15),
          textAlign: 'left',
          marginTop: 0,
        }}
      >
        {title}
      </h3>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: '100%',
          height: vw(50),
          border: `${vw(1)} solid #E0E0E0`,
          borderRadius: vw(5),
          backgroundColor: '#F9F9F9',
          fontWeight: 'bold',
          fontSize: vw(14),
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#F0F0F0';
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = '#F0F0F0';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#F9F9F9';
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = '#F9F9F9';
        }}
      >
        {btnText}
      </button>
    </div>
  );
}

SidebarCard.propTypes = {
  title: PropTypes.string.isRequired,
  btnText: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

SidebarCard.defaultProps = {
  onClick: undefined,
};

/**
 * 마이페이지 우측에 위치하며 사용자의 현재 권한을 보여주고 파트너 신청 기능을 제공하는 사이드바 컴포넌트
 */
function SidebarSection({ isAppliedPending = false, onOrderListClick, onCommissionListClick }) {
  // 💡 [수정] 이제 localStorage가 아닌 쿠키 유틸리티를 사용하여 권한을 가져옵니다.
  // 이래야 테스트 코드의 mockReturnValue('ADMIN')가 정상적으로 작동합니다!
  const rawRole = getUserRole() || 'USER';

  // 화면에 보여줄 예쁜 한글 이름으로 변환합니다.
  let displayRole = '일반 회원';
  if (rawRole === 'ADMIN') displayRole = '관리자';
  else if (rawRole === 'PARTNER') displayRole = '파트너';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(isAppliedPending);

  // 알림 모달 상태 제어
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, icon: '', title: '', message: '' });

  useEffect(() => {
    setHasApplied(isAppliedPending);
  }, [isAppliedPending]);

  const [formData, setFormData] = useState({
    name: '',
    introduce: '',
    contact: '',
    location: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showAlert = (icon, title, message) => {
    setAlertInfo({ isOpen: true, icon, title, message });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.introduce || !formData.contact || !formData.location) {
      showAlert('⚠️', '입력 오류', '모든 항목을 입력해주세요!');
      return;
    }

    setIsApplying(true);
    try {
      const response = await post('/v1/partners', formData);

      if (response.data?.isSuccess) {
        showAlert(
          '🎉',
          '신청 완료',
          '파트너 신청이 완료되었습니다!\n관리자의 승인을 기다려주세요.',
        );
        setIsModalOpen(false);
        setFormData({ name: '', introduce: '', contact: '', location: '' });
        setHasApplied(true);
      } else {
        showAlert(
          '🚨',
          '신청 실패',
          response.data?.errorDetail?.message || '파트너 신청에 실패했습니다.',
        );
      }
    } catch (error) {
      console.error('파트너 신청 오류:', error);
      showAlert('🚨', '통신 오류', '서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsApplying(false);
    }
  };

  // 💡 권한 체크 로직 (ADMIN, PARTNER인 경우 버튼 비활성화)
  const isButtonDisabled = rawRole === 'ADMIN' || rawRole === 'PARTNER' || hasApplied;

  const buttonText = hasApplied ? '승인 대기 중' : '파트너 신청하기';

  return (
    <>
      <div style={{ width: vw(300), display: 'flex', flexDirection: 'column', gap: vw(30) }}>
        <div
          style={{
            backgroundColor: '#FFF',
            borderRadius: vw(10),
            border: `${vw(1)} solid #B4B4B4`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: vw(30),
              borderBottom: `${vw(1)} solid #E0E0E0`,
              backgroundColor: '#F9F9F9',
            }}
          />
          <div style={{ padding: vw(20) }}>
            <div style={{ marginBottom: vw(20) }}>
              <div
                style={{
                  width: '100%',
                  height: vw(80),
                  border: `${vw(1)} solid #2C9753`,
                  backgroundColor: '#F0FFF4',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: vw(8),
                }}
              >
                <span style={{ fontSize: vw(12), color: '#2C9753', marginBottom: vw(5) }}>
                  현재 권한
                </span>
                <span style={{ fontWeight: 'bold', fontSize: vw(16), color: '#333' }}>
                  {displayRole}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isButtonDisabled}
              style={{
                width: '100%',
                height: vw(40),
                border: 'none',
                borderRadius: vw(6),
                backgroundColor: isButtonDisabled ? '#BDBDBD' : '#2C9753',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: vw(14),
                cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {buttonText}
            </button>
          </div>
        </div>

        <SidebarCard title="주문, 예약" btnText="주문 목록 이동" onClick={onOrderListClick} />
        <SidebarCard title="의뢰 목록" btnText="의뢰 목록 이동" onClick={onCommissionListClick} />
      </div>

      {/* 파트너 신청 모달 팝업 */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFF',
              padding: vw(40),
              borderRadius: vw(12),
              width: vw(500),
              display: 'flex',
              flexDirection: 'column',
              gap: vw(20),
            }}
          >
            <h2 style={{ fontSize: vw(24), fontWeight: 'bold', margin: 0, color: '#333' }}>
              파트너 등록 신청
            </h2>
            <p style={{ fontSize: vw(14), color: '#666', marginTop: 0 }}>
              관리자 승인을 위해 아래 정보를 정확히 입력해주세요.
            </p>

            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름 (또는 상호명)"
              style={inputStyle}
            />
            <input
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="연락처 (예: 010-0000-0000)"
              style={inputStyle}
            />
            <input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="활동 지역 (예: 서울, 온라인)"
              style={inputStyle}
            />
            <textarea
              name="introduce"
              value={formData.introduce}
              onChange={handleInputChange}
              placeholder="간단한 소개 및 포트폴리오를 적어주세요."
              style={{ ...inputStyle, height: vw(100), resize: 'none' }}
            />

            <div style={{ display: 'flex', gap: vw(10), marginTop: vw(10) }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  flex: 1,
                  padding: vw(15),
                  border: 'none',
                  borderRadius: vw(6),
                  backgroundColor: '#E0E0E0',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: vw(14),
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isApplying}
                style={{
                  flex: 1,
                  padding: vw(15),
                  border: 'none',
                  borderRadius: vw(6),
                  backgroundColor: '#2C9753',
                  color: '#FFF',
                  fontWeight: 'bold',
                  cursor: isApplying ? 'not-allowed' : 'pointer',
                  fontSize: vw(14),
                }}
              >
                {isApplying ? '제출 중...' : '신청서 제출'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 알림용 커스텀 모달 */}
      <CustomAlertModal
        isOpen={alertInfo.isOpen}
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
        icon={alertInfo.icon}
        title={alertInfo.title}
        description={alertInfo.message}
        leftBtnText="확인"
      />
    </>
  );
}

const inputStyle = {
  width: '100%',
  padding: vw(12),
  border: `${vw(1)} solid #CCC`,
  borderRadius: vw(6),
  fontSize: vw(14),
  outline: 'none',
  boxSizing: 'border-box',
};

SidebarSection.propTypes = {
  isAppliedPending: PropTypes.bool,
  onOrderListClick: PropTypes.func,
  onCommissionListClick: PropTypes.func,
};

SidebarSection.defaultProps = {
  isAppliedPending: false,
  onOrderListClick: undefined,
  onCommissionListClick: undefined,
};

export default SidebarSection;
