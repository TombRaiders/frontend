import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusBadge, { getStatusInfo } from './StatusBadge';

// 💡 vw 스타일 유틸리티 함수 모킹 (테스트 환경에서는 px로 단순 반환)
vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}px`,
}));

describe('StatusBadge 및 getStatusInfo 테스트', () => {
  // 1. 상태 매핑 헬퍼 함수(getStatusInfo) 단원 테스트
  describe('getStatusInfo 헬퍼 함수 테스트', () => {
    it('정의된 상태값(PENDING, ACCEPTED 등)에 맞는 올바른 객체를 반환해야 합니다.', () => {
      expect(getStatusInfo('PENDING')).toEqual({
        text: '대기 중',
        bg: '#FEF3C7',
        color: '#D97706',
      });
      expect(getStatusInfo('ACCEPTED')).toEqual({
        text: '수락함',
        bg: '#D1FAE5',
        color: '#059669',
      });
      expect(getStatusInfo('QUOTED')).toEqual({
        text: '견적 완료',
        bg: '#DBEAFE',
        color: '#2563EB',
      });
      expect(getStatusInfo('REJECTED')).toEqual({
        text: '취소/거절',
        bg: '#FEE2E2',
        color: '#DC2626',
      });
    });

    it('백엔드 주문 상태 enum을 사용자용 한글 라벨로 반환해야 합니다.', () => {
      expect(getStatusInfo('REQUESTED').text).toBe('견적대기');
      expect(getStatusInfo('QUOTED').text).toBe('견적 완료');
      expect(getStatusInfo('PAID').text).toBe('결제 완료');
      expect(getStatusInfo('PRODUCING').text).toBe('제작 중');
      expect(getStatusInfo('PRODUCTION_COMPLETED').text).toBe('제작 완료');
      expect(getStatusInfo('SHIPPING').text).toBe('배송 중');
      expect(getStatusInfo('DELIVERED').text).toBe('배송 완료');
      expect(getStatusInfo('CANCELED').text).toBe('주문 취소');
    });

    it('매칭되는 상태가 없거나 빈 값일 경우 기본(Default) 객체를 반환해야 합니다.', () => {
      // 전달된 문자열이 그대로 텍스트로 들어가는지 확인
      expect(getStatusInfo('UNKNOWN_STATUS')).toEqual({
        text: 'UNKNOWN_STATUS',
        bg: '#F3F4F6',
        color: '#6B7280',
      });
      // 완전히 빈 값이거나 undefined일 때의 예외 처리 확인
      expect(getStatusInfo('')).toEqual({ text: '상태 없음', bg: '#F3F4F6', color: '#6B7280' });
      expect(getStatusInfo(undefined)).toEqual({
        text: '상태 없음',
        bg: '#F3F4F6',
        color: '#6B7280',
      });
    });
  });

  // 2. 리액트 컴포넌트(StatusBadge) UI 렌더링 테스트
  describe('StatusBadge 컴포넌트 렌더링 테스트', () => {
    it('PENDING 상태일 때 "대기 중" 텍스트와 올바른 색상이 적용되어 렌더링되어야 합니다.', () => {
      render(<StatusBadge status="PENDING" />);

      const badge = screen.getByText('대기 중');
      expect(badge).toBeInTheDocument();

      // 💡 toHaveStyle을 사용하여 인라인 스타일이 올바르게 들어갔는지 검증
      // (Testing Library는 Hex 코드를 자동으로 RGB로 변환해서 검사해주기도 하지만, 그대로 입력해도 매칭됩니다.)
      expect(badge).toHaveStyle({
        backgroundColor: '#FEF3C7',
        color: '#D97706',
      });
    });

    it('COMPLETED 상태일 때 "작업 완료" 텍스트와 지정된 색상이 적용되어야 합니다.', () => {
      render(<StatusBadge status="COMPLETED" />);

      const badge = screen.getByText('작업 완료');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveStyle({
        backgroundColor: '#F3F4F6',
        color: '#4B5563',
      });
    });

    it('알 수 없는 상태값이 주어졌을 때 전달된 텍스트와 회색(Default) 스타일이 렌더링되어야 합니다.', () => {
      render(<StatusBadge status="임시상태" />);

      const badge = screen.getByText('임시상태');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveStyle({
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
      });
    });
  });
});
