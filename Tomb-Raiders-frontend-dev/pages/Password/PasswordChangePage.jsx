import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginCard from '../../components/Login/LoginCard';
import LoginInput from '../../components/Login/LoginInput';
import LoginButton from '../../components/Login/LoginButton';
import { post } from '../../api/apiClient';
import CustomAlertModal from '../../components/Common/CustomAlertModal';

function PasswordFindPage() {
  const vw = (px) => `${(px / 1920) * 100}vw`;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetCode = searchParams.get('code') || '';
  const step = resetCode ? 2 : 1;

  // 입력 폼 상태 관리
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // 알림 모달 상태 관리
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
    // 비밀번호 재설정이 최종 성공했을 때만 로그인 페이지로 이동합니다.
    if (alertInfo.isSuccess && step === 2) {
      navigate('/login');
    }
  };

  // 🟢 1단계: 비밀번호 재설정 요청 (인증번호 발송)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showAlert('🚨', '입력 오류', '가입하신 이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 💡 명세에 맞게 { email: "string" } 형태로 요청합니다.
      const response = await post('/v1/member/password-reset/request', { email });

      if (response.data?.isSuccess) {
        showAlert('✉️', '요청 완료', '입력하신 이메일로 인증번호가 발송되었습니다.');
        navigate('/');
      } else {
        showAlert('🚨', '요청 실패', response.data?.errorDetail?.message || '요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('재설정 요청 에러:', error);
      const serverErrorMsg = error.response?.data?.errorDetail?.message;
      showAlert('🚨', '요청 실패', serverErrorMsg || '통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 2단계: 인증번호 확인 및 새 비밀번호 확정
  const handleConfirmReset = async (e) => {
    e.preventDefault();

    if (!resetCode.trim()) {
      showAlert('🚨', '입력 오류', '인증 링크가 올바르지 않습니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('🚨', '입력 오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 💡 백엔드 명세에 정확히 맞춰서 데이터를 구성합니다!
      const payload = {
        email,
        verificationCode: resetCode, // URL의 code 값을 명세의 verificationCode에 매핑
        newPassword, // 명세의 newPassword에 매핑
        newPasswordConfirm: confirmPassword, // 명세의 newPasswordConfirm에 매핑
      };

      const response = await post('/v1/member/password-reset/confirm', payload);

      if (response.data?.isSuccess) {
        showAlert(
          '✅',
          '변경 완료',
          '비밀번호가 성공적으로 변경되었습니다.\n새로운 비밀번호로 로그인해주세요.',
          true,
        );
      } else {
        showAlert(
          '🚨',
          '변경 실패',
          response.data?.errorDetail?.message || '비밀번호 변경에 실패했습니다.',
        );
      }
    } catch (error) {
      console.error('재설정 확정 에러:', error);
      const serverErrorMsg = error.response?.data?.errorDetail?.message;
      showAlert('🚨', '변경 실패', serverErrorMsg || '인증번호가 틀렸거나 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="w-full min-h-screen bg-[#F7F7F7] flex items-center justify-center"
        style={{ padding: vw(20) }}
      >
        <LoginCard title="비밀번호 찾기" vw={vw}>
          {/* 1단계: 인증 요청 폼 */}
          {step === 1 && (
            <form
              className="w-4/5 flex flex-col"
              style={{ gap: vw(30) }}
              onSubmit={handleRequestReset}
            >
              <div
                style={{ fontSize: vw(14), color: '#666', textAlign: 'center', lineHeight: '1.5' }}
              >
                가입 시 사용한 이메일을 입력하시면
                <br />
                비밀번호 재설정 인증번호를 보내드립니다.
              </div>
              <LoginInput
                type="email"
                placeholder="이메일 입력*"
                vw={vw}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div style={{ marginTop: vw(10) }}>
                <LoginButton
                  label={isLoading ? '요청 중...' : '인증번호 전송'}
                  vw={vw}
                  type="submit"
                  disabled={isLoading}
                />
              </div>
            </form>
          )}

          {/* 2단계: 새 비밀번호 설정 폼 */}
          {step === 2 && (
            <form
              className="w-4/5 flex flex-col"
              style={{ gap: vw(30) }}
              onSubmit={handleConfirmReset}
            >
              <div
                style={{ fontSize: vw(14), color: '#666', textAlign: 'center', lineHeight: '1.5' }}
              >
                인증 링크가 확인되었습니다.
                <br />
                새롭게 사용할 비밀번호를 입력해주세요.
              </div>
              <LoginInput
                type="password"
                placeholder="새 비밀번호*"
                vw={vw}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <LoginInput
                type="password"
                placeholder="새 비밀번호 확인*"
                vw={vw}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div style={{ marginTop: vw(10) }}>
                <LoginButton
                  label={isLoading ? '변경 중...' : '비밀번호 재설정'}
                  vw={vw}
                  type="submit"
                  disabled={isLoading}
                />
              </div>
            </form>
          )}

          <div
            className="w-3/4 flex justify-center"
            style={{ marginTop: vw(25), paddingLeft: vw(4), paddingRight: vw(4) }}
          >
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#999] font-medium bg-transparent border-none cursor-pointer hover:text-[#2C9753] transition-colors"
              style={{ fontSize: vw(14) }}
            >
              로그인 화면으로 돌아가기
            </button>
          </div>
        </LoginCard>
      </div>

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

export default PasswordFindPage;
