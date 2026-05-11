import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';
import { useCurrentUserProfile } from '../../hooks/useCurrentUserProfile';

const BOARD_OPTIONS = [
  { type: 'FREE_BOARD', label: '자유게시판' },
  { type: 'BRAGGING_BOARD', label: '자랑게시판' },
  { type: 'ADMIN_BOARD', label: '공지사항' },
];

function CommunitySidebar({ onWriteClick, selectedBoardType, onBoardTypeSelect }) {
  const { nickname, profileImageUrl } = useCurrentUserProfile();
  const displayName = nickname || '사용자';

  return (
    <aside
      style={{
        width: vw(150),
        backgroundColor: '#FFFFFF',
        borderRadius: vw(15),
        border: `${vw(1)} solid #E0E0E0`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: `${vw(30)} ${vw(15)}`,
        position: 'sticky',
        top: 0,
        height: 'fit-content',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: vw(8),
          marginBottom: vw(10),
        }}
      >
        <div
          style={{
            width: vw(30),
            height: vw(30),
            backgroundColor: '#D9D9D9',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {profileImageUrl && (
            <img
              src={profileImageUrl}
              alt={`${displayName}의 프로필`}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <span
          style={{
            color: '#333',
            fontSize: vw(10),
            fontWeight: '700',
            maxWidth: vw(95),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
      </div>

      <button
        type="button"
        onClick={onWriteClick}
        style={{
          width: vw(140),
          height: vw(25),
          backgroundColor: '#2C9753',
          color: 'white',
          border: 'none',
          borderRadius: vw(8),
          fontSize: vw(10),
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: vw(20),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        글쓰기
      </button>

      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: vw(12),
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        {BOARD_OPTIONS.map((item) => {
          const isSelected = selectedBoardType === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onBoardTypeSelect(item.type)}
              style={{
                textAlign: 'left',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: vw(10),
                cursor: 'pointer',
                color: isSelected ? '#2C9753' : '#333',
                fontWeight: isSelected ? '700' : '500',
                padding: 0,
                width: '100%',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

CommunitySidebar.propTypes = {
  onWriteClick: PropTypes.func.isRequired,
  selectedBoardType: PropTypes.oneOf(['FREE_BOARD', 'BRAGGING_BOARD', 'ADMIN_BOARD']),
  onBoardTypeSelect: PropTypes.func.isRequired,
};

CommunitySidebar.defaultProps = {
  selectedBoardType: 'FREE_BOARD',
};

export default CommunitySidebar;
