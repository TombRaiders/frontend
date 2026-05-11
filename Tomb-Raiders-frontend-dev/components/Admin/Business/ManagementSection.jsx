import React from 'react';
import { vw } from '../../../utils/style';

/**
 * 어드민 비즈니스 대시보드 상단에서 정산 관리 및 취소/반품/교환 현황을 요약하여 보여주는 섹션 컴포넌트
 * 각 항목별 수치를 한눈에 파악할 수 있도록 두 개의 카드로 구성됨
 */
function ManagementSection() {
  return (
    <section className="flex gap-[1.5vw] mb-[2vw]">
      {/* 정산 관리 요약 카드 */}
      <div
        className="flex-1 bg-[#FFFFFF] rounded-[4px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
        style={{ padding: vw(25) }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-black" style={{ fontSize: vw(18) }}>
            정산 관리
          </h3>
          {/* 최신 데이터 동기화를 위한 새로고침 버튼 */}
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-gray-400" style={{ fontSize: vw(11) }}>
              새로고침
            </span>
            <span className="text-orange-500" style={{ fontSize: vw(14) }}>
              🔄
            </span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-5 space-y-5">
          <div className="flex justify-between text-gray-700" style={{ fontSize: vw(14) }}>
            <span>오늘 정산</span>
            <span className="font-medium text-black">0원</span>
          </div>
          {/* 추가적인 정산 지표가 위치할 자리 */}
          <div className="flex justify-between text-gray-700" style={{ fontSize: vw(14) }}>
            <span>누적 정산</span>
            <span className="font-medium text-black">0원</span>
          </div>
        </div>
      </div>

      {/* 취소 · 반품 · 교환 요청 현황 요약 카드 */}
      <div
        className="flex-1 bg-[#FFFFFF] rounded-[4px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
        style={{ padding: vw(25) }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-black" style={{ fontSize: vw(18) }}>
            취소 · 반품 · 교환
          </h3>
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-gray-400" style={{ fontSize: vw(11) }}>
              새로고침
            </span>
            <span className="text-orange-500" style={{ fontSize: vw(14) }}>
              🔄
            </span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <div className="flex justify-between text-gray-700" style={{ fontSize: vw(14) }}>
            <span>취소요청</span>
            <span className="font-medium text-black">0건</span>
          </div>
          <div className="flex justify-between text-gray-700" style={{ fontSize: vw(14) }}>
            <span>반품요청</span>
            <span className="font-medium text-black">0건</span>
          </div>
          <div className="flex justify-between text-gray-700" style={{ fontSize: vw(14) }}>
            <span>교환요청</span>
            <span className="font-medium text-black">0건</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ManagementSection;
