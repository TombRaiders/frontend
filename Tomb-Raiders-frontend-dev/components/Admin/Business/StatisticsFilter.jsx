import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

/**
 * 필터 항목의 라벨(이름)을 표시하는 헬퍼 컴포넌트
 * @param {node} children - 라벨에 표시될 텍스트 또는 요소
 */
function Label({ children }) {
  return (
    <div
      className="bg-[#BDBDBD] border-r border-[#757575] flex items-center justify-center font-bold text-black"
      style={{ width: vw(160), minHeight: vw(45), fontSize: vw(13) }}
    >
      {children}
    </div>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * 필터의 한 줄(Row)을 구성하는 헬퍼 컴포넌트로, 라벨과 입력 영역을 포함함
 * @param {string} label - 항목 이름
 * @param {node} children - 입력 필드나 체크박스 등의 요소
 */
function Row({ label, children }) {
  return (
    <div
      className="flex items-center border-b border-[#757575] last:border-b-0"
      style={{ minHeight: vw(45) }}
    >
      <Label>{label}</Label>
      <div className="flex-1 flex items-center px-6 gap-4 bg-white" style={{ fontSize: vw(12) }}>
        {children}
      </div>
    </div>
  );
}

Row.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * 어드민 비즈니스 관리에서 매출 및 주문 통계 데이터를 기간별, 업체별로 조회하기 위한 검색 컴포넌트
 * 시작일부터 종료일까지의 기간 설정과 특정 업체명 필터링 기능을 제공함
 */
function StatisticsFilter() {
  return (
    <section className="mb-8 w-full border border-[#757575] bg-white overflow-hidden shadow-sm">
      {/* 조회 대상 기간 설정 필터 (직접 날짜 입력 및 기간 프리셋 버튼) */}
      <Row label="기간">
        <div className="flex items-center border border-gray-400 px-2 h-[28px]">
          <input
            type="text"
            placeholder="2026.00.00"
            className="outline-none text-[11px] w-[70px]"
          />
          <span className="ml-1 text-[12px]">📅</span>
        </div>
        <span className="text-gray-500">~</span>
        <div className="flex items-center border border-gray-400 px-2 h-[28px]">
          <input
            type="text"
            placeholder="2026.00.00"
            className="outline-none text-[11px] w-[70px]"
          />
          <span className="ml-1 text-[12px]">📅</span>
        </div>
        <div className="flex border border-gray-400 ml-2 rounded-sm overflow-hidden text-[10px]">
          {['오늘', '1주', '2주', '1개월', '3개월', '6개월'].map((t) => (
            <button
              key={t}
              type="button"
              className="px-2 py-1 border-r border-gray-400 last:border-0 bg-white hover:bg-gray-50"
            >
              {t}
            </button>
          ))}
        </div>
      </Row>

      {/* 특정 비즈니스 업체명으로 검색하는 필터 */}
      <Row label="업체명">
        <div className="flex items-center">
          <input
            type="text"
            className="border border-gray-400 px-2 h-[28px]"
            style={{ width: vw(180) }}
          />
          <button
            type="button"
            className="bg-[#2C9753] p-1 text-white border border-[#2C9753] ml-1 flex items-center justify-center h-[28px] w-[28px]"
          >
            <span>🔍</span>
          </button>
        </div>
      </Row>

      {/* 하단 최종 액션 버튼 (통계 검색 및 초기화) */}
      <div className="flex justify-center py-4 gap-4 border-t border-[#757575] bg-[#F9F9F9]">
        <button
          type="button"
          className="bg-[#2C9753] text-white font-bold"
          style={{ width: vw(100), height: vw(32) }}
        >
          검색
        </button>
        <button
          type="button"
          className="bg-white border border-gray-400 text-gray-700"
          style={{ width: vw(100), height: vw(32) }}
        >
          초기화
        </button>
      </div>
    </section>
  );
}

export default StatisticsFilter;
