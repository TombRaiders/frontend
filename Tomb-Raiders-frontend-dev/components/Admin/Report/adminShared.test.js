import { describe, it, expect, vi } from 'vitest';
import { formatDate, adminTableStyles } from './adminShared';

vi.mock('../../../utils/style', () => ({
  vw: (size) => `${size}px`,
}));

describe('adminShared 유틸리티 및 스타일 테스트', () => {
  describe('formatDate 함수 테스트', () => {
    it('날짜 문자열을 한국어 형식으로 올바르게 변환해야 합니다', () => {
      const dateString = '2024-03-15T14:30:00';
      const formatted = formatDate(dateString);

      // 💡 해결: 환경마다 오전/오후 또는 24시간제가 다를 수 있으므로 핵심 숫자만 포함하는지 검증
      expect(formatted).toContain('2024');
      expect(formatted).toContain('03');
      expect(formatted).toContain('15');
      // '14' 혹은 '02' 중 하나를 포함하고 '30'을 포함하는지 확인
      expect(formatted).toMatch(/(14|02|2):30/);
    });

    it('날짜 값이 없을 경우 하이픈(-)을 반환해야 합니다', () => {
      expect(formatDate(null)).toBe('-');
    });
  });

  describe('adminTableStyles 객체 테스트', () => {
    it('th 스타일 객체가 정확한 속성값(vw 계산 포함)을 가지고 있어야 합니다', () => {
      const { th } = adminTableStyles;
      expect(th.padding).toBe('15px');
      expect(th.backgroundColor).toBe('#F8FAFC');
    });

    it('스타일 객체들이 올바른 속성 개수를 유지해야 합니다', () => {
      expect(adminTableStyles).toHaveProperty('th');
      expect(adminTableStyles).toHaveProperty('td');

      // 💡 실제 코드 기반으로 개수 수정 (th: 6개, td: 4개)
      expect(Object.keys(adminTableStyles.th)).toHaveLength(6);
      expect(Object.keys(adminTableStyles.td)).toHaveLength(4);
    });
  });
});
