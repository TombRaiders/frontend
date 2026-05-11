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
      style={{ width: vw(180), minHeight: vw(50), fontSize: vw(14) }}
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
      style={{ minHeight: vw(50) }}
    >
      <Label>{label}</Label>
      <div className="flex-1 flex items-center px-6 gap-5 bg-white" style={{ fontSize: vw(13) }}>
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
 * 어드민 비즈니스 관리에서 전체 주문 내역을 상세 검색하거나 필터링하기 위한 컴포넌트
 * 처리상태, 주문 기간, 작성자(사업자명) 등 다양한 조건을 조합하여 결과 조회를 지원함
 */
function OrderFilter() {
  return (
    <section className="mb-10 w-full">
      <div className="border border-[#757575] bg-white overflow-hidden shadow-sm">
        {/* 주문 처리 단계(의뢰신청 ~ 제작완료 등)별 체크박스 필터 */}
        <Row label="처리상태">
          {['의뢰신청', '견적서 작성 완료', '입금 완료', '제작중', '제작완료', '의뢰 취소'].map(
            (item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 border border-gray-400 accent-[#2C9753]"
                />{' '}
                {item}
              </label>
            ),
          )}
        </Row>

        {/* 주문 주문일 기준 기간 설정 필터 (직접 입력 및 프리셋 버튼) */}
        <Row label="기간">
          <div
            className="flex items-center border border-gray-400 px-2 bg-white"
            style={{ height: vw(32) }}
          >
            <input
              type="text"
              placeholder="2026.00.00"
              className="outline-none text-[12px] w-[80px]"
            />
            <span className="text-gray-400 ml-2" style={{ fontSize: vw(14) }}>
              📅
            </span>
          </div>
          <span className="text-gray-500 mx-2">~</span>
          <div
            className="flex items-center border border-gray-400 px-2 bg-white"
            style={{ height: vw(32) }}
          >
            <input
              type="text"
              placeholder="2026.00.00"
              className="outline-none text-[12px] w-[80px]"
            />
            <span className="text-gray-400 ml-2" style={{ fontSize: vw(14) }}>
              📅
            </span>
          </div>
          <div className="flex border border-gray-400 ml-4 overflow-hidden rounded-sm">
            {['오늘', '1주', '2주', '1개월', '3개월', '6개월'].map((t) => (
              <button
                key={t}
                type="button"
                className="px-3 py-1 border-r border-gray-300 last:border-0 bg-white hover:bg-gray-50 text-[11px] font-medium transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </Row>

        {/* 특정 작성자(또는 검색어) 검색 필터 */}
        <Row label="작성자">
          <div className="flex items-center">
            <input
              type="text"
              className="border border-gray-400 px-3 outline-none"
              style={{ width: vw(220), height: vw(32) }}
              placeholder="검색어 입력"
            />
            <button
              type="button"
              className="bg-[#2C9753] border border-[#2C9753] text-white flex items-center justify-center hover:bg-[#257F46] transition-colors"
              style={{ width: vw(32), height: vw(32) }}
            >
              <span style={{ fontSize: vw(16) }}>🔍</span>
            </button>
          </div>
        </Row>
      </div>

      {/* 하단 최종 액션 버튼 (검색 실행 및 초기화) */}
      <div className="flex justify-center mt-10 gap-8">
        <button
          type="button"
          className="bg-[#2C9753] text-white font-bold border border-[#2C9753] hover:shadow-md transition-all"
          style={{ width: vw(150), height: vw(45), fontSize: vw(15) }}
        >
          검색
        </button>
        <button
          type="button"
          className="bg-white border border-gray-400 text-black font-medium hover:bg-gray-50 hover:shadow-md transition-all"
          style={{ width: vw(150), height: vw(45), fontSize: vw(15) }}
        >
          초기화
        </button>
      </div>
    </section>
  );
}

export default OrderFilter;
