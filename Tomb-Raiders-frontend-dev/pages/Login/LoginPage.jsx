import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginCard from '../../components/Login/LoginCard';
import LoginInput from '../../components/Login/LoginInput';
import LoginButton from '../../components/Login/LoginButton';
import { useRouterFunctions } from '../../router.js';
import { post } from '../../api/apiClient';
import { setToken, setLoginId, setUserRole, setMemberId } from '../../utils/authUtils.js';
import CustomAlertModal from '../../components/Common/CustomAlertModal';

const formatDateTime = (value) => (value ? value.replace('T', ' ').slice(0, 16) : '');

const getSuspendedMemberMessage = (errorDetail) => {
  if (errorDetail?.code !== 'MEMBER_SUSPENDED') return null;

  const details = errorDetail.details || {};
  const lines = [errorDetail.message || '활동이 정지된 계정입니다.'];

  if (details.reason) {
    lines.push(`정지 사유: ${details.reason}`);
  }

  if (details.bannedAt) {
    lines.push(`정지 시작: ${formatDateTime(details.bannedAt)}`);
  }

  if ('banExpiredAt' in details) {
    lines.push(
      details.banExpiredAt
        ? `정지 해제 예정: ${formatDateTime(details.banExpiredAt)}`
        : '정지 해제 예정: 영구 정지',
    );
  }

  return lines.join('\n');
};

const getLoginErrorMessage = (data) =>
  getSuspendedMemberMessage(data?.errorDetail) ||
  data?.error?.message ||
  data?.errorDetail?.message ||
  data?.message ||
  '정보를 확인해주세요.';

const normalizeLoginData = (data) => {
  const loginData = data?.data || {};

  return {
    accessToken: loginData.accessToken || loginData.token || '',
    loginId: loginData.loginId || loginData.username || '',
    role: loginData.role || 'USER',
    memberId: loginData.memberId || loginData.id || null,
  };
};

function LoginPage() {
  const vw = (px) => `${(px / 1920) * 100}vw`;
  const navigate = useNavigate();
  const { goToSignup } = useRouterFunctions();

  const [userInput, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, title: '', message: '' });

  const showAlert = (title, message) => {
    setAlertInfo({ isOpen: true, title, message });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        loginId: userInput.trim(),
        password,
      };

      const response = await post('/v1/auth/signin', payload);
      const responseData = response.data;
      const isLoginSuccess = Boolean(responseData?.isSuccess || responseData?.success);
      const loginData = normalizeLoginData(responseData);

      if (isLoginSuccess && loginData.accessToken) {
        setToken(loginData.accessToken);
        setLoginId(loginData.loginId || payload.loginId);
        setUserRole(loginData.role);

        if (loginData.memberId) {
          setMemberId(loginData.memberId);
        }

        navigate('/');
        return;
      }

      showAlert('로그인 실패', getLoginErrorMessage(responseData));
    } catch (error) {
      console.error('로그인 에러:', error);
      showAlert('로그인 실패', getLoginErrorMessage(error.response?.data));
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
        <LoginCard title="로그인" vw={vw} height="auto">
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <form className="w-4/5 flex flex-col" style={{ gap: vw(40) }} onSubmit={handleLogin}>
              <LoginInput
                type="text"
                placeholder="아이디*"
                vw={vw}
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
                required
              />
              <LoginInput
                type="password"
                placeholder="비밀번호*"
                vw={vw}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <LoginButton
                label={isLoading ? '로그인...' : '로그인'}
                vw={vw}
                type="submit"
                disabled={isLoading}
              />
            </form>
            <div
              className="w-3/4 flex justify-between"
              style={{ marginTop: vw(25), paddingLeft: vw(4), paddingRight: vw(4) }}
            >
              <button
                type="button"
                onClick={goToSignup}
                className="text-[#2C9753] font-medium bg-transparent border-none cursor-pointer"
                style={{ fontSize: vw(14) }}
              >
                계정 만들기
              </button>
              <button
                type="button"
                onClick={() => navigate('/password-reset')}
                className="text-[#2C9753] font-medium bg-transparent border-none cursor-pointer"
                style={{ fontSize: vw(14) }}
              >
                비밀번호 찾기
              </button>
            </div>
          </div>
        </LoginCard>
      </div>
      <CustomAlertModal
        isOpen={alertInfo.isOpen}
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
        icon="!"
        title={alertInfo.title}
        description={alertInfo.message}
        leftBtnText="확인"
      />
    </>
  );
}

export default LoginPage;
