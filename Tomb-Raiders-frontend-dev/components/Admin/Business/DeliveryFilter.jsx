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
      className="bg-[#BDBDBD] border-r border-[#757575] flex items-center justify-center font-bold text-black text-center"
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
    <div className="flex items-center border-b border-[#757575]" style={{ minHeight: vw(45) }}>
      <Label>{label}</Label>
      <div className="flex-1 flex items-center px-6 gap-6 bg-white" style={{ fontSize: vw(12) }}>
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
 * 어드민 비즈니스 관리에서 배송 내역을 다각도로 필터링하기 위한 검색창 섹션 컴포넌트
 * 처리상태, 결제방법, 택배사, 기간, 판매자명 등 다양한 조건을 조합하여 검색 가능
 */
function DeliveryFilter() {
  return (
    <section className="mb-8 w-full border border-[#757575] bg-white overflow-hidden shadow-sm">
      {/* 배송 처리 단계별 체크박스 필터 */}
      <Row label="처리상태">
        {['배송중', '배송완료', '반품 요청', '환불 요청', '교환 요청', '반품 승인'].map((v) => (
          <label key={v} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-3 h-3 accent-[#2C9753]" /> {v}
          </label>
        ))}
      </Row>

      {/* 결제 수단별 체크박스 필터 */}
      <Row label="결제방법">
        {['카드', '간편결제(토스페이)'].map((v) => (
          <label key={v} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-3 h-3 accent-[#2C9753]" /> {v}
          </label>
        ))}
      </Row>

      {/* 연동된 택배사 선택 필터 */}
      <Row label="택배사">
        {['한진', '00', '00'].map((v) => (
          <label key={v} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-3 h-3 accent-[#2C9753]" /> {v}
          </label>
        ))}
      </Row>

      {/* 주문/배송 기간 설정 필터 (직접 입력 및 프리셋 버튼) */}
      <Row label="기간">
        <div className="flex items-center border border-gray-400 px-2" style={{ height: vw(28) }}>
          <input
            type="text"
            placeholder="2026.00.00"
            className="outline-none text-[11px] w-[70px]"
          />
          <span className="ml-1">📅</span>
        </div>
        <span>~</span>
        <div className="flex items-center border border-gray-400 px-2" style={{ height: vw(28) }}>
          <input
            type="text"
            placeholder="2026.00.00"
            className="outline-none text-[11px] w-[70px]"
          />
          <span className="ml-1">📅</span>
        </div>
        <div className="flex border border-gray-400 ml-2 rounded-sm overflow-hidden text-[10px]">
          {['오늘', '1주', '2주', '1개월', '3개월', '6개월'].map((t) => (
            <button
              key={t}
              type="button"
              className="px-2 py-1 border-r border-gray-400 last:border-0 bg-white"
            >
              {t}
            </button>
          ))}
        </div>
      </Row>

      {/* 특정 판매자(상호명) 검색 필터 */}
      <Row label="판매자">
        <input
          type="text"
          className="border border-gray-400 px-2"
          style={{ width: vw(180), height: vw(28) }}
        />
        <button type="button" className="bg-[#2C9753] p-1 text-white border border-[#2C9753] ml-2">
          🔍
        </button>
      </Row>

      {/* 하단 최종 액션 버튼 (검색 실행 및 초기화) */}
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
          className="bg-white border border-gray-400"
          style={{ width: vw(100), height: vw(32) }}
        >
          초기화
        </button>
      </div>
    </section>
  );
}

export default DeliveryFilter;
