import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';
import { formatDate, adminTableStyles } from './adminShared'; // 💡 경로 수정: ./adminShared

export default function ReportTable({ reports, isLoading }) {
  const { th: thStyle, td: tdStyle } = adminTableStyles;
  const headers = [
    '신고 ID',
    '신고자 ID',
    '대상 로그인 ID',
    '구분',
    '대상 콘텐츠 ID',
    '신고 사유',
    '상태',
    '접수일',
  ];

  const handleRowHover = (e, isHover) => {
    e.currentTarget.style.backgroundColor = isHover ? '#F8FAFC' : 'transparent';
  };

  // 💡 [S3358/no-nested-ternary 해결] 중첩 삼항 연산자를 변수로 분리하여 가독성 향상
  let bodyContent;
  if (isLoading) {
    bodyContent = (
      <tr>
        <td colSpan={headers.length} style={{ padding: vw(30) }}>
          로딩 중...
        </td>
      </tr>
    );
  } else if (reports.length === 0) {
    bodyContent = (
      <tr>
        <td colSpan={headers.length} style={{ padding: vw(30), color: '#94A3B8' }}>
          접수된 신고 내역이 없습니다.
        </td>
      </tr>
    );
  } else {
    bodyContent = reports.map((report) => (
      <tr
        key={`report-row-${report.reportId}`}
        tabIndex={0} // 💡 키보드 접근성을 위해 추가
        onMouseOver={(e) => handleRowHover(e, true)}
        onMouseOut={(e) => handleRowHover(e, false)}
        // 💡 [S1082/jsx-a11y 해결] 마우스 이벤트는 반드시 포커스 이벤트와 쌍을 이뤄야 함
        onFocus={(e) => handleRowHover(e, true)}
        onBlur={(e) => handleRowHover(e, false)}
        style={{ transition: 'background-color 0.2s', cursor: 'default', outline: 'none' }}
      >
        <td style={tdStyle}>{report.reportId}</td>
        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{report.reporterLoginId}</td>
        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#EF4444' }}>
          {report.reportedLoginId || report.targetLoginId || '-'}
        </td>
        <td style={tdStyle}>{report.type}</td>
        <td style={tdStyle}>{report.targetId}</td>
        <td
          style={{
            ...tdStyle,
            textAlign: 'left',
            maxWidth: vw(200),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {report.reason}
        </td>
        <td style={tdStyle}>{report.status}</td>
        <td style={tdStyle}>{formatDate(report.createdAt)}</td>
      </tr>
    ));
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            {headers.map((text, i) => (
              <th
                key={`report-header-${text}`}
                style={i === 2 ? { ...thStyle, color: '#EF4444' } : thStyle}
              >
                {text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{bodyContent}</tbody>
      </table>
    </div>
  );
}

ReportTable.propTypes = {
  reports: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
