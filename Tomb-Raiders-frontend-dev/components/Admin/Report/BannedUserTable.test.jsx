import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BannedUserTable from './BannedUserTable';

vi.mock('../../../utils/style', () => ({ vw: (val) => `${val}px` }));

describe('BannedUserTable', () => {
  it('차단된 유저가 없을 때 메시지를 보여준다', () => {
    render(<BannedUserTable bannedUsers={[]} isLoading={false} onUnban={vi.fn()} />);
    expect(screen.getByText('현재 차단된 회원이 없습니다.')).toBeDefined();
  });

  it('유저 목록이 있을 때 정상적으로 렌더링한다', () => {
    const users = [{ memberId: 1, loginId: 'baduser', bannedAt: '2024-01-01' }];
    render(<BannedUserTable bannedUsers={users} isLoading={false} onUnban={vi.fn()} />);
    expect(screen.getByText('baduser')).toBeDefined();
  });
});
