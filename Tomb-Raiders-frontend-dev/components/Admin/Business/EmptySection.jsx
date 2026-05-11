import React from 'react';
import { useNavigate } from 'react-router-dom';
import { vw } from '../../../utils/style';

/**
 * 어드민 비즈니스 메인 페이지에서 표시할 데이터가 없거나 초기 상태일 때,
 * 핵심 관리 메뉴로 빠르게 이동할 수 있는 바로가기 카드들을 제공하는 섹션 컴포넌트
 */
function EmptySection() {
  const navigate = useNavigate();

  // 바로가기를 제공할 메뉴 항목 정의
  const menuButtons = [
    { label: '주문 관리', path: '/admin/order' },
    { label: '비지니스 회원 목록', path: '/admin/member' },
    { label: '배송 관리', path: '/admin/order-index' },
    { label: '통계 분석', path: '/admin/statistics' },
  ];

  return (
    <div
      className="bg-[#FFFFFF] rounded-[4px] shadow-sm flex items-center justify-center"
      style={{ minHeight: vw(350), width: '100%', padding: vw(40) }}
    >
      <div className="flex gap-[2.5vw]">
        {menuButtons.map((btn) => (
          /* 각 메뉴 버튼: 클릭 시 해당 경로로 라우팅 이동 */
          <button
            key={btn.path}
            type="button"
            onClick={() => navigate(btn.path)}
            className="flex flex-col items-center justify-center bg-white border border-gray-100 hover:border-[#2C9753] group"
            style={{ width: vw(160), height: vw(160), borderRadius: vw(8) }}
          >
            {/* 아이콘 영역 (플러스 기호) */}
            <div
              className="border border-gray-300 mb-4 group-hover:border-[#2C9753] flex items-center justify-center bg-[#fcfcfc]"
              style={{ width: vw(55), height: vw(55) }}
            >
              <span className="text-gray-300 group-hover:text-[#2C9753] text-[1.2vw]">+</span>
            </div>
            {/* 메뉴 라벨 텍스트 */}
            <span
              className="font-bold text-gray-700 group-hover:text-[#2C9753]"
              style={{ fontSize: vw(16) }}
            >
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmptySection;
