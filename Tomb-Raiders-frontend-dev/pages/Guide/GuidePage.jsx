import React from 'react';
import PropTypes from 'prop-types';
import HeaderSection from '../../components/HomePage/HeaderSection';
import Footer from '../../components/Common/Footer'; // 💡 분리된 푸터 임포트
import GuideListSection from '../../components/Guide/GuideListSection'; // 💡 분리된 리스트 임포트

// 데이터 중복 제거를 위한 공통 배열
const commonDescriptions = [
  '디지털 3D 파일(STL/OBJ/3MF)을 기반으로 실물 출력물을 제작해 드리는 대행 서비스',
  '출력 방식: FDM(일반 플라스틱) / 레진(고정밀) / SLS(나일론 파우더) 선택 가능',
  '용도에 맞는 방식 추천 — 의뢰 전 상담 가능',
];

const commonPrecautions = [
  '파일 내 오류(바디망개, 구멍 뚫림 등)는 출력 전 반드시 수정 필요 — Meshmixer, Netfabb 등으로 사전 검수 권장',
  '벽 두께 최소 1.5mm 이상 설계 필수. 그 이하는 출력 실패 또는 파손 위험',
  '출력물 표면에 레이어 라인이 육안으로 보일 수 있음 — 고광택 마감이 필요한 경우 샌딩/코팅 별도 요청',
  '파일 기준 실제 크기로 출력됨 — 치수/스케일 최종 확인 후 의뢰',
  '색상은 필라멘트·레진 재고 색상 내 선택, 별도 지정 색상은 도색 별도 의뢰',
];

// 동일 구조의 섹션 3개를 동적 생성하여 중복 코드 방지
const guideDataList = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  titlePrefix: '3D 프린터',
  titleSuffix: ' 제작 대행',
  descriptions: commonDescriptions,
  precautions: commonPrecautions,
}));

function GuidePage({
  goToSignup,
  goToLogin,
  goToCommissionCheck,
  goToMember,
  goToBulletinBoard,
  goToAdmin,
  goToPartner,
  goToGuide,
}) {
  const vw = (px) => `${(px / 1920) * 100}vw`;

  return (
    <div className="w-full min-h-screen bg-[#f7f7f7] flex flex-col items-center font-sans overflow-x-hidden">
      {/* 💡 HeaderSection에 모든 이동 함수를 전달하여 상단 버튼 활성화 */}
      <HeaderSection
        vw={vw}
        goToLogin={goToLogin}
        goToCommissionCheck={goToCommissionCheck}
        goToMember={goToMember}
        goToBulletinBoard={goToBulletinBoard}
        goToAdmin={goToAdmin}
        goToPartner={goToPartner}
        goToGuide={goToGuide}
      />

      <main
        className="w-full flex flex-col items-center"
        style={{ marginTop: '5px', paddingBottom: vw(100) }}
      >
        <div className="flex flex-col items-start" style={{ width: vw(1200), marginTop: vw(60) }}>
          {/* 1. 페이지 메인 타이틀 */}
          <div className="w-full text-left box-border" style={{ marginBottom: vw(60) }}>
            <h1 style={{ fontSize: vw(48), fontWeight: 'bold', marginBottom: vw(20) }}>
              <span style={{ color: '#333' }}>제작 의뢰 </span>
              <span style={{ color: '#4ADE80' }}>가이드</span>
            </h1>
            <p style={{ fontSize: vw(18), color: '#666' }}>
              이 가이드는 고객님의 소중한 아이디어가 완벽한 결과물로 탄생할 수 있도록 돕기 위해
              작성되었습니다.
            </p>
          </div>

          {/* 2. 가이드 섹션 반복 렌더링 */}
          <div className="flex flex-col w-full box-border" style={{ gap: vw(80) }}>
            {guideDataList.map((guide) => (
              <div key={guide.id} className="flex flex-col w-full box-border">
                {/* 각 섹션 제목 */}
                <h2
                  className="text-left box-border"
                  style={{ fontSize: vw(32), fontWeight: 'bold', marginBottom: vw(25) }}
                >
                  <span style={{ color: '#4ADE80' }}>{guide.titlePrefix}</span>
                  <span style={{ color: '#333' }}>{guide.titleSuffix}</span>
                </h2>

                {/* 이미지 홀더 */}
                <div
                  className="w-full bg-[#EAEAEA] box-border"
                  style={{ height: vw(400), borderRadius: vw(20), marginBottom: vw(30) }}
                />

                {/* 하얀색 내용 컨테이너 (별도 컴포넌트 사용) */}
                <div
                  className="bg-[#ffffff] shadow-sm border border-[#EAEAEA] flex flex-col w-full text-left box-border"
                  style={{ padding: vw(50), borderRadius: vw(20) }}
                >
                  <GuideListSection
                    title="서비스 설명 영역"
                    items={guide.descriptions}
                    itemColor="#333"
                    vw={vw}
                    hasMarginBottom
                  />

                  {/* 구분선 */}
                  <div
                    className="w-full bg-[#EAEAEA]"
                    style={{ height: '1px', marginBottom: vw(35) }}
                  />

                  <GuideListSection
                    title="주의사항"
                    items={guide.precautions}
                    itemColor="#DC2626"
                    vw={vw}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 💡 공통 푸터 컴포넌트 호출 */}
      <Footer vw={vw} />
    </div>
  );
}

GuidePage.propTypes = {
  goToSignup: PropTypes.func.isRequired,
  goToLogin: PropTypes.func.isRequired,
  goToCommissionCheck: PropTypes.func.isRequired,
  goToMember: PropTypes.func.isRequired,
  goToBulletinBoard: PropTypes.func.isRequired,
  goToAdmin: PropTypes.func.isRequired,
  goToPartner: PropTypes.func.isRequired,
  goToGuide: PropTypes.func,
};

export default GuidePage;
