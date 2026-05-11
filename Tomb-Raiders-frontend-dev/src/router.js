import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

// 페이지 이동을 위한 전용 함수들을 제공하는 커스텀 훅
export function useRouterFunctions() {
  const navigate = useNavigate();

  // 회원가입 페이지로 이동
  const goToSignup = useCallback(() => navigate('/signup'), [navigate]);
  // 로그인 페이지로 이동
  const goToLogin = useCallback(() => navigate('/login'), [navigate]);
  // 의뢰하기 페이지로 이동
  const goToCommission = useCallback(() => navigate('/commissions/new'), [navigate]);
  // 의뢰 확인 페이지로 이동
  const goToCommissionCheck = useCallback(() => navigate('/commissions'), [navigate]);
  // 마이페이지(멤버)로 이동
  const goToMember = useCallback(() => navigate('/member'), [navigate]);
  // 게시판 페이지로 이동
  const goToBulletinBoard = useCallback(() => navigate('/bulletinboard'), [navigate]);
  // 관리자 페이지로 이동
  const goToAdmin = useCallback(() => navigate('/admin'), [navigate]);
  // 파트너 전용 페이지로 이동
  const goToPartner = useCallback(() => navigate('/partner/request'), [navigate]);

  // 💡 가이드 페이지로 이동하는 함수 추가
  const goToGuide = useCallback(() => navigate('/guide'), [navigate]);

  return {
    goToSignup,
    goToLogin,
    goToCommission,
    goToCommissionCheck,
    goToMember,
    goToBulletinBoard,
    goToAdmin,
    goToPartner,
    goToGuide, // 💡 리턴 객체에 포함
  };
}
