import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import { useRouterFunctions } from '../../router.js';
import NavSearchInput from './NavSearchInput';
import ProfileDropdown from './ProfileDropdown';

/**
 * 마이페이지 상단에 위치하여 검색창과 프로필 드롭다운 메뉴를 제공하는 헤더 컴포넌트
 * @param {boolean} isMenuOpen - 프로필 드롭다운 메뉴의 열림 상태
 * @param {function} setIsMenuOpen - 드롭다운 메뉴 상태를 변경하는 함수
 * @param {function} onEditClick - '정보 관리' 메뉴 클릭 시 실행될 함수
 */
function TopNav({ isMenuOpen, setIsMenuOpen, onEditClick }) {
  const { goToMember } = useRouterFunctions();

  return (
    <>
      {/* 중앙 통합 검색창 구역 */}
      <NavSearchInput
        vw={vw}
        wrapperStyle={{
          zIndex: 100,
        }}
        inputStyle={{ boxShadow: `0 ${vw(2)} ${vw(4)} rgba(0,0,0,0.05)` }}
      />

      {/* 우측 상단 프로필 토글 버튼 및 드롭다운 메뉴 */}
      <ProfileDropdown
        vw={vw}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onProfileClick={goToMember}
        onEditClick={onEditClick}
      />
    </>
  );
} // 💡 TopNav 함수 닫기 완료

// Props 타입 정의
TopNav.propTypes = {
  isMenuOpen: PropTypes.bool.isRequired,
  setIsMenuOpen: PropTypes.func.isRequired,
  onEditClick: PropTypes.func,
};

export default TopNav;
