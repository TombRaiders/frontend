import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

/**
 * 마이페이지 상단에서 사용자의 프로필 이미지, 닉네임, 소개글을 보여주고 수정 버튼을 제공하는 섹션 컴포넌트
 * @param {function} onEditClick - '편집' 버튼 클릭 시 실행될 함수
 * @param {Object} user - 표시할 사용자 정보 객체 (닉네임, 소개글, 프로필 이미지 포함)
 */
function ProfileSection({ onEditClick, user }) {
  // 💡 백엔드 데이터 키값(introduce, profileImageUrl)에 맞게 가져옵니다.
  const { nickname = '사용자', introduce, bio, profileImageUrl } = user || {};

  // 💡 백엔드에서 내려주는 introduce가 있으면 먼저 사용하고, 없으면 bio, 둘 다 없으면 기본 문구 출력
  const displayBio = introduce || bio || '등록된 소개글이 없습니다.';

  // 💡 유저의 프로필 이미지가 없거나 엑박이 뜰 경우를 위한 디폴트 경로 (public 폴더 기준)
  const defaultProfileImg = '/defaultprofile.png';

  return (
    <>
      {/* 프로필 하단의 디자인 배경 바 */}
      <div
        style={{
          position: 'absolute',
          top: vw(250),
          left: '0px',
          width: '100%',
          height: vw(72),
          backgroundColor: '#2C9753',
        }}
      />

      {/* 프로필 이미지 원형 영역 */}
      <div
        style={{
          position: 'absolute',
          top: vw(147),
          left: vw(535),
          width: vw(150),
          height: vw(150),
          minWidth: vw(150), // 💡 추가: 어떤 상황에서도 축소 방지
          minHeight: vw(150), // 💡 추가: 어떤 상황에서도 축소 방지
          flexShrink: 0, // 💡 추가: 원형 찌그러짐 완벽 방지
          backgroundColor: '#D9D9D9',
          borderRadius: '50%',
          border: `${vw(6)} solid #FFFFFF`,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* 💡 수정된 부분: 게시글 프로필처럼 기본 이미지 및 엑박 방지(onError) 처리 */}
        <img
          src={profileImageUrl || defaultProfileImg}
          alt={`${nickname}의 프로필`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', // 사진이 원 안에 꽉 차도록 유지
          }}
          onError={(e) => {
            e.target.onerror = null; // 무한 루프 방지
            e.target.src = defaultProfileImg; // 로드 실패 시 기본 이미지로 교체
          }}
        />
      </div>

      {/* 닉네임과 소개글 표시 영역 */}
      <div style={{ position: 'absolute', top: vw(197), left: vw(712), textAlign: 'left' }}>
        <h2 style={{ fontSize: vw(15), fontWeight: 'bold', margin: 0 }}>{nickname}</h2>
        <p style={{ fontSize: vw(10), color: '#666666', marginTop: vw(8), whiteSpace: 'pre-wrap' }}>
          {displayBio}
        </p>
      </div>

      {/* 정보 수정을 위한 편집 버튼 */}
      <button
        type="button"
        onClick={onEditClick}
        style={{
          position: 'absolute',
          top: vw(213),
          left: vw(1366),
          width: vw(69),
          height: vw(27),
          backgroundColor: '#FFF',
          border: `${vw(1)} solid #000`,
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: vw(10),
        }}
      >
        편집
      </button>
    </>
  );
}

// Props 타입 정의 및 필수 검증
ProfileSection.propTypes = {
  onEditClick: PropTypes.func.isRequired,
  user: PropTypes.shape({
    nickname: PropTypes.string,
    bio: PropTypes.string,
    introduce: PropTypes.string, // introduce 타입 추가
    profileImageUrl: PropTypes.string, // profileImageUrl 타입 추가
  }),
};

export default ProfileSection;
