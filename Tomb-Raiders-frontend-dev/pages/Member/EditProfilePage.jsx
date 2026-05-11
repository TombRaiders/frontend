import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { vw } from '../../utils/style';
import { getCookie, setCookie, getLoginId, removeToken } from '../../utils/authUtils';
import { get, put, post } from '../../api/apiClient';
import CustomAlertModal from '../../components/Common/CustomAlertModal';

import EditTopNav from '../../components/Member/MemberEdit/EditTopNav';
import EditSidebar from '../../components/Member/MemberEdit/EditSidebar';
import EditContentBox from '../../components/Member/MemberEdit/EditContentBox';
import ShippingContent from '../../components/Member/MemberShippingMg/ShippingContent';

function EditProfilePage({ user, setUser }) {
  const navigate = useNavigate();

  // 페이지 최초 로딩 상태
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    introduce: user?.introduce || user?.bio || '',
    bio: user?.bio || user?.introduce || '',
    profileImageUrl: user?.profileImageUrl || '',
  });

  const [activeMenu, setActiveMenu] = useState('정보 관리');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    icon: '',
    title: '',
    message: '',
    isSuccess: false,
  });

  const showAlert = (icon, title, message, isSuccess = false) => {
    setAlertInfo({ isOpen: true, icon, title, message, isSuccess });
  };

  const handleCloseAlert = () => {
    setAlertInfo({ ...alertInfo, isOpen: false });
    if (alertInfo.isSuccess) {
      navigate('/member');
    }
  };

  const [addresses, setAddresses] = useState(() => {
    const saved = getCookie('user_addresses');
    if (saved && Array.isArray(saved)) return saved;
    return [
      {
        id: 1,
        name: '우리집',
        receiver: '홍길동',
        postcode: '12345',
        address: '서울시...',
        detailAddress: '101호',
        phone: '01012345678',
        isDefault: true,
      },
    ];
  });

  useEffect(() => {
    setCookie('user_addresses', addresses);
  }, [addresses]);

  // ==========================================
  // 내 정보 조회 API 연동 (로그인 만료 처리 포함)
  // ==========================================
  useEffect(() => {
    const fetchMyInfo = async () => {
      setIsPageLoading(true);
      try {
        const res = await get('/v1/member/me');
        if (res?.data?.isSuccess && res.data.data) {
          const myInfo = res.data.data;
          setFormData({
            nickname: myInfo.nickname || '',
            email: myInfo.email || '',
            introduce: myInfo.introduce || myInfo.bio || '',
            bio: myInfo.bio || myInfo.introduce || '',
            profileImageUrl: myInfo.profileImageUrl || '',
          });
          setUser((prev) => ({ ...prev, ...myInfo }));
        }
      } catch (error) {
        console.error('내 정보 조회 실패:', error);
        if (error.response?.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
          removeToken();
          navigate('/login');
        }
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchMyInfo();
  }, [navigate, setUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    setPasswordConfirm('');
    setShowPasswordModal(true);
  };

  const submitProfileChanges = async () => {
    if (!passwordConfirm.trim()) {
      showAlert('🚨', '입력 오류', '비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setShowPasswordModal(false);

    // 1단계: 비밀번호 검증
    try {
      const currentLoginId = getLoginId();
      const authCheck = await post('/v1/auth/signin', {
        loginId: currentLoginId,
        password: passwordConfirm,
      });

      if (!authCheck.data?.isSuccess) {
        showAlert('🚨', '인증 실패', '비밀번호가 일치하지 않습니다.');
        setIsLoading(false);
        return;
      }
    } catch (authError) {
      console.error('비밀번호 검증 에러:', authError);
      showAlert('🚨', '인증 실패', '비밀번호 확인 중 오류가 발생했습니다.');
      setIsLoading(false);
      return;
    }

    // 2단계: 실제 프로필 정보 수정 (닉네임, 자기소개)
    try {
      const promises = [];
      if (formData.nickname !== user.nickname) {
        promises.push(put('/v1/member/nickname', { nickname: formData.nickname || '' }));
      }

      const currentIntroduce = formData.bio ?? formData.introduce;
      const originalIntroduce = user?.introduce || user?.bio || '';
      if (currentIntroduce !== originalIntroduce) {
        promises.push(put('/v1/member/introduce', { introduce: currentIntroduce || '' }));
      }

      // 사진 수정 로직은 EditContentBox에서 즉시 처리하므로 여기서는 제외 (415 에러 방지)
      if (promises.length === 0) {
        showAlert('✅', '알림', '변경된 내용이 없습니다.', true);
        setIsLoading(false);
        return;
      }

      await Promise.all(promises);

      setUser({
        ...user,
        nickname: formData.nickname,
        introduce: currentIntroduce,
        bio: currentIntroduce,
      });

      if (formData.nickname) {
        Cookies.set('nickname', formData.nickname, { path: '/' });
      }

      showAlert('✅', '수정 완료', '프로필이 성공적으로 변경되었습니다.', true);
    } catch (updateError) {
      console.error('프로필 수정 실패:', updateError);
      if (updateError.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
        removeToken();
        navigate('/login');
        return;
      }
      const backendMsg = updateError.response?.data?.errorDetail?.message;
      showAlert('🚨', '수정 실패', backendMsg || '입력하신 정보를 다시 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#F7F7F7',
          fontSize: vw(16),
          color: '#666',
        }}
      >
        정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#F7F7F7',
        overflowX: 'hidden',
      }}
    >
      <EditTopNav vw={vw} />
      <div
        style={{
          position: 'absolute',
          left: vw(535),
          top: vw(120),
          display: 'flex',
          gap: vw(20),
          alignItems: 'flex-start',
          paddingBottom: vw(50),
        }}
      >
        <EditSidebar vw={vw} activeMenu={activeMenu} onMenuClick={setActiveMenu} />
        {activeMenu === '정보 관리' ? (
          <EditContentBox
            vw={vw}
            formData={formData}
            onChange={handleChange}
            onSave={handleSaveClick}
            setFormData={setFormData}
          />
        ) : (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: vw(30),
              borderRadius: vw(10),
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            }}
          >
            <ShippingContent vw={vw} addresses={addresses} setAddresses={setAddresses} />
          </div>
        )}
      </div>

      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFF',
              padding: vw(30),
              borderRadius: vw(10),
              width: vw(400),
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: 0, marginBottom: vw(10), fontSize: vw(20), color: '#333' }}>
              🔒 비밀번호 확인
            </h3>
            <p style={{ color: '#666', fontSize: vw(14), marginBottom: vw(20), lineHeight: '1.4' }}>
              안전한 정보 변경을 위해 현재 비밀번호를 입력해주세요.
            </p>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              style={{
                width: '100%',
                padding: vw(12),
                border: '1px solid #CCC',
                borderRadius: vw(6),
                marginBottom: vw(20),
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: vw(10) }}>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  flex: 1,
                  padding: vw(12),
                  backgroundColor: '#EEE',
                  borderRadius: vw(5),
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                취소
              </button>
              <button
                onClick={submitProfileChanges}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: vw(12),
                  backgroundColor: '#2C9753',
                  color: '#FFF',
                  borderRadius: vw(5),
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomAlertModal
        isOpen={alertInfo.isOpen}
        onClose={handleCloseAlert}
        icon={alertInfo.icon}
        title={alertInfo.title}
        description={alertInfo.message}
        leftBtnText="확인"
      />
    </div>
  );
}

EditProfilePage.propTypes = {
  user: PropTypes.shape({
    nickname: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
    introduce: PropTypes.string,
    profileImageUrl: PropTypes.string,
  }).isRequired,
  setUser: PropTypes.func.isRequired,
};

export default EditProfilePage;
