import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';
import { formatDate, adminTableStyles } from './adminShared'; // 💡 공통 모듈 임포트

export default function BannedUserTable({ bannedUsers, isLoading, onUnban }) {
  const { th: thStyle, td: tdStyle } = adminTableStyles;

  const renderContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="3" style={{ padding: vw(30) }}>
            로딩 중...
          </td>
        </tr>
      );
    }
    if (bannedUsers.length === 0) {
      return (
        <tr>
          <td colSpan="3" style={{ padding: vw(30), color: '#94A3B8' }}>
            현재 차단된 회원이 없습니다.
          </td>
        </tr>
      );
    }

    return bannedUsers.map((user, index) => (
      <tr key={user.memberId || index}>
        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{user.loginId || user.memberId}</td>
        <td style={tdStyle}>{formatDate(user.bannedAt)}</td>
        <td style={tdStyle}>
          <button
            onClick={() => onUnban(user.memberId)}
            style={{
              padding: `${vw(8)} ${vw(16)}`,
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: vw(6),
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: vw(13),
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onFocus={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onBlur={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            차단 해제
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style={thStyle}>로그인 ID</th>
            <th style={thStyle}>차단 일시</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>
        <tbody>{renderContent()}</tbody>
      </table>
    </div>
  );
}

BannedUserTable.propTypes = {
  bannedUsers: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onUnban: PropTypes.func.isRequired,
};
