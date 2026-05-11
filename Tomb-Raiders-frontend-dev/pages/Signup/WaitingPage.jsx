import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function WaitingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [message, setMessage] = useState('이메일 인증 결과를 확인하고 있습니다... ⏳');
  const vw = (px) => `${(px / 1920) * 100}vw`;

  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('accessToken');

    if (token) {
      setMessage('이메일 인증이 완료되었습니다! 🎉 잠시 후 로그인 화면으로 이동합니다.');

      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }

    setMessage('잘못된 접근이거나 인증 토큰이 없습니다. 다시 가입해주세요. 🚨');

    const timer = setTimeout(() => navigate('/signup'), 2000);
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div
      className="w-full min-h-screen bg-[#F7F7F7] flex items-center justify-center"
      style={{ padding: vw(20) }}
    >
      <div
        className="bg-[#FFFFFF] rounded-[10px] shadow-sm flex flex-col items-center justify-center text-center"
        style={{
          width: vw(600),
          height: vw(400),
          padding: vw(60),
          border: `${vw(1)} solid #E0E0E0`,
        }}
      >
        {/* 빙글빙글 도는 로딩 스피너 */}
        <div
          style={{
            width: vw(50),
            height: vw(50),
            border: `${vw(5)} solid #F3F3F3`,
            borderTop: `${vw(5)} solid #2C9753`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: vw(30),
          }}
        />

        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>

        <h2
          style={{
            fontSize: vw(24),
            fontWeight: 'bold',
            color: '#333',
            lineHeight: '1.5',
            whiteSpace: 'pre-line',
          }}
        >
          {message}
        </h2>
      </div>
    </div>
  );
}

export default WaitingPage;
