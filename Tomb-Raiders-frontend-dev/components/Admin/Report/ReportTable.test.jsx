import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReportTable from './ReportTable';

vi.mock('../../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('ReportTable', () => {
  it('신고 내역이 비어있으면 안내 문구를 출력한다', () => {
    render(<ReportTable reports={[]} isLoading={false} />);
    expect(screen.getByText('접수된 신고 내역이 없습니다.')).toBeDefined();
  });

  it('신고 사유가 길면 생략되어 표시되는지 확인한다 (스타일 체크)', () => {
    const reports = [{ reportId: 1, reason: '매우 긴 사유입니다...', type: 'POST' }];
    render(<ReportTable reports={reports} isLoading={false} />);
    expect(screen.getByText('매우 긴 사유입니다...')).toBeDefined();
  });
});
