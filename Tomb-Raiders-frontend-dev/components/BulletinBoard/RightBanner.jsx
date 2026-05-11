import React from 'react';
import { vw } from '../../utils/style';

function RightBanner() {
  return (
    <div
      style={{
        width: vw(300),
        // 왼쪽 패딩을 조절하여 본문과의 간격을 기획안처럼 유지
        paddingLeft: vw(30),
        display: 'flex',
        flexDirection: 'column',
        gap: vw(15), // 배너와 버튼 사이의 간격을 좁게 설정
        position: 'sticky',
        top: vw(80), // 메인 판넬의 paddingTop과 일치시켜 머리를 맞춤
      }}
    >
      {/* 배너 박스 */}
      <div
        style={{
          width: '100%',
          height: vw(450),
          backgroundColor: 'white',
          borderRadius: vw(10),
          border: `${vw(1)} solid #E0E0E0`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      />
    </div>
  );
}

export default RightBanner;
