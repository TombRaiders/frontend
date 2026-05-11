import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom'; // 💡 useNavigate 추가!
import { useRouterFunctions } from '../../router';
import { vw } from '../../utils/style';
import Logo from '../Logo/Logo';

/**
 * 어드민 페이지 전용 왼쪽 사이드바 네비게이션 컴포넌트
 * 비즈니스 매니저, 신고 관리, 사용자 관리 등 주요 관리 기능을 제공함
 */
function Sidebar({ onNoticeClick, onPinpointClick, onImageClick }) {
  const location = useLocation();
  const navigate = useNavigate(); // 💡 라우팅을 위한 navigate 훅 추가

  // 라우터 이동 함수들을 훅에서 가져옴
  const { goToMember, goToBulletinBoard } = useRouterFunctions();

  // 사이드바에 표시할 메뉴 리스트 정의 (명칭, 클릭 시 동작, 활성화 판단용 경로)
  const menus = [
    {
      name: '비지니스 매니저',
      func: () => navigate('/admin/business'), // 💡 부드러운 화면 전환을 위해 navigate로 통일
      path: '/admin/business',
    },
    {
      name: '신고 유저 관리',
      func: () => navigate('/admin/reports'),
      path: '/admin/reports',
    },
    { name: '사용자 관리', func: goToMember, path: '/member' },
    { name: '커뮤니티 설정', func: goToBulletinBoard, path: '/bulletinboard' },
    { name: '신고 내역', func: () => navigate('/admin/reports'), path: '/admin/reports' },
    // 💡 텅 비어있던 함수에 어드민 페이지로 이동하는 로직을 채워넣었습니다!
    { name: '어드민', func: () => navigate('/admin'), path: '/admin' },
  ];

  return (
    <aside
      className="bg-[#2C9753] text-white flex flex-col items-start p-[1.5vw]"
      style={{ width: vw(250), minHeight: '100vh' }}
    >
      {/* 관리자 로고 표시 */}
      <Logo vw={vw} />

      {/* 메뉴 내비게이션 영역 */}
      <nav
        className="flex flex-col gap-[1.5vw] w-full text-left font-bold"
        style={{ fontSize: vw(16) }}
      >
        {menus.map((menu) => {
          // 현재 URL 경로와 메뉴의 경로가 일치하는지 비교하여 활성화 스타일 적용
          const isActive = location.pathname.toLowerCase() === menu.path.toLowerCase();

          return (
            <button
              type="button"
              key={menu.name}
              onClick={menu.func}
              className={`text-left bg-transparent border-none outline-none cursor-pointer transition-opacity
                ${isActive ? 'text-black underline' : 'text-white hover:opacity-80'}`}
            >
              {menu.name}
            </button>
          );
        })}

        {/* 하단 구분선 및 추가 관리 기능 */}
        <div className="mt-[5vw] border-t border-white/30 pt-[1.5vw] w-full">
          <button
            type="button"
            onClick={onNoticeClick || (() => navigate('/admin?view=notice'))}
            className="text-left bg-transparent hover:opacity-80 border-none outline-none text-white cursor-pointer w-full"
            style={{ fontSize: vw(16) }}
          >
            공지등록
          </button>
          <button
            type="button"
            onClick={onPinpointClick || (() => navigate('/admin?view=pinpoint'))}
            className="text-left bg-transparent hover:opacity-80 border-none outline-none text-white cursor-pointer w-full"
            style={{ fontSize: vw(16), marginTop: vw(14) }}
          >
            pinpoint 등록
          </button>
          <button
            type="button"
            onClick={onImageClick || (() => navigate('/admin?view=image'))}
            className="text-left bg-transparent hover:opacity-80 border-none outline-none text-white cursor-pointer w-full"
            style={{ fontSize: vw(16), marginTop: vw(14) }}
          >
            레일 이미지 관리
          </button>
        </div>
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  onNoticeClick: PropTypes.func,
  onPinpointClick: PropTypes.func,
  onImageClick: PropTypes.func,
};

export default Sidebar;
