import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { vw } from '../../utils/style';
import Logo from '../Logo/Logo';

/**
 * 파트너 전용 페이지에서 왼쪽 사이드바 메뉴를 제공하는 네비게이션 컴포넌트
 * 의뢰 확인, 의뢰 수락 목록 등 주요 파트너 메뉴 이동을 담당함
 */
function PartnerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 사이드바에 표시할 메뉴 항목 리스트
  const menus = [
    { name: '의뢰 확인', path: '/partner/request' },
    { name: '의뢰 수락 목록', path: '/partner/accepted' },
  ];

  return (
    <aside
      className="bg-[#2C9753] text-white flex flex-col items-start flex-shrink-0"
      style={{ width: vw(250), minHeight: '100vh', padding: vw(30) }}
    >
      {/* 상단 로고 영역 */}
      <div style={{ marginBottom: vw(30) }}>
        <Logo vw={vw} />
      </div>

      {/* 메뉴 내비게이션 영역 */}
      <nav
        className="flex flex-col w-full text-left font-bold"
        style={{ gap: vw(30), fontSize: vw(16) }}
      >
        {menus.map((menu) => {
          // 현재 경로와 메뉴의 경로가 일치하는지 확인하여 활성화 스타일 적용
          const isActive = location.pathname.toLowerCase() === menu.path.toLowerCase();

          return (
            <button
              key={menu.name}
              type="button"
              onClick={() => navigate(menu.path)}
              className={`text-left bg-transparent border-none outline-none cursor-pointer transition-opacity font-bold
                ${isActive ? 'text-black underline' : 'text-white hover:opacity-80'}`}
              style={{ fontSize: vw(16) }}
            >
              {menu.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default PartnerSidebar;
