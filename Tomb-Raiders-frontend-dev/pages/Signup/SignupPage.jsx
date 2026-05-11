import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupInput from '../../components/Login/SignupInput';
import SignupButton from '../../components/Login/SignupButton';
import SocialDivider from '../../components/Login/SocialDivider';
import { useRouterFunctions } from '../../router.js';
import { useSignup } from './useSignup';
// 💡 만능 커스텀 모달창 불러오기
import CustomAlertModal from '../../components/Common/CustomAlertModal';

// 사용자가 서비스에 가입할 수 있는 회원가입 페이지 컴포넌트
function SignupPage() {
  const vw = (px) => `${(px / 1920) * 100}vw`;
  const { goToLogin } = useRouterFunctions();
  const navigate = useNavigate();

  // 회원가입 로직 처리를 위한 커스텀 훅 사용
  const { signup, isLoading, error } = useSignup();

  // 입력 필드 상태 관리
  const [formData, setFormData] = useState({
    loginId: '',
    email: '',
    password: '',
  });

  // 💡 알림 모달 상태 관리 (성공 여부에 따라 리디렉션 분기 처리)
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    icon: '🚨',
    title: '',
    message: '',
    isSuccess: false,
  });

  const showAlert = (icon, title, message, isSuccess = false) => {
    setAlertInfo({ isOpen: true, icon, title, message, isSuccess });
  };

  const handleCloseModal = () => {
    setAlertInfo({ ...alertInfo, isOpen: false });
    // 💡 모달의 [확인] 버튼을 눌렀을 때만 메인 페이지로 이동!
    if (alertInfo.isSuccess) {
      navigate('/');
    }
  };

  // 💡 useSignup 훅에서 에러가 발생하면 모달창으로 띄워줍니다
  useEffect(() => {
    if (error) {
      showAlert('🚨', '회원가입 실패', error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 회원가입 폼 제출 시 유효성 검사 및 서버 연동을 처리하는 함수
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!formData.loginId || !formData.email || !formData.password) {
      showAlert('🚨', '입력 오류', '모든 정보를 입력해주세요.');
      return;
    }

    const isSuccess = await signup({
      loginId: formData.loginId,
      email: formData.email,
      password: formData.password,
    });

    if (isSuccess) {
      // 💡 요청하신 대로 이메일 인증을 유도하는 문구로 수정했습니다!
      showAlert(
        '✉️',
        '이메일 인증 안내',
        '가입을 완료하려면 이메일 인증을 해주세요.\n확인을 누르시면 인증 페이지로 이동합니다.',
        true,
      );
    }
  };

  return (
    <>
      <div
        className="w-full min-h-screen bg-[#F7F7F7] flex items-center justify-center"
        style={{ padding: vw(20) }}
      >
        <div
          className="bg-[#FFFFFF] rounded-[10px] shadow-sm flex flex-col items-center"
          style={{ width: vw(600), padding: `${vw(60)} 0`, border: `${vw(1)} solid #E0E0E0` }}
        >
          <h1
            className="font-inter text-black font-bold"
            style={{ fontSize: vw(32), marginBottom: vw(50) }}
          >
            회원가입
          </h1>

          <form
            className="w-4/5 flex flex-col"
            style={{ gap: vw(35) }}
            onSubmit={handleSignupSubmit}
          >
            <SignupInput
              name="loginId"
              type="text"
              placeholder="아이디*"
              vw={vw}
              value={formData.loginId}
              onChange={handleChange}
              required
            />

            <SignupInput
              name="email"
              type="email"
              placeholder="이메일 주소*"
              vw={vw}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <SignupInput
              name="password"
              type="password"
              placeholder="비밀번호*"
              vw={vw}
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div style={{ marginTop: vw(10) }}>
              <SignupButton
                label={isLoading ? '처리 중...' : '가입하기'}
                vw={vw}
                type="submit"
                disabled={isLoading}
              />
            </div>
          </form>

          <div className="w-full flex justify-center" style={{ marginTop: vw(25) }}>
            <button
              type="button"
              onClick={goToLogin}
              className="text-[#2C9753] font-medium bg-transparent border-none cursor-pointer hover:underline"
              style={{ fontSize: vw(14) }}
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </div>

          <SocialDivider text="다른 계정으로 로그인" vw={vw} />
        </div>
      </div>

      {/* 💡 알림용 커스텀 모달 컴포넌트 추가 */}
      <CustomAlertModal
        isOpen={alertInfo.isOpen}
        onClose={handleCloseModal}
        icon={alertInfo.icon}
        title={alertInfo.title}
        description={alertInfo.message}
        leftBtnText="확인"
      />
    </>
  );
}

export default SignupPage;
