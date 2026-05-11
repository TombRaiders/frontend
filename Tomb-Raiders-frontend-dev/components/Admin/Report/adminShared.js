import { vw } from '../../../utils/style';

// 날짜 포맷팅 공통 함수
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 테이블 공통 스타일
export const adminTableStyles = {
  th: {
    padding: vw(15),
    borderBottom: `${vw(1)} solid #E2E8F0`,
    backgroundColor: '#F8FAFC',
    fontWeight: 'bold',
    color: '#475569',
    fontSize: vw(14),
  },
  td: {
    padding: vw(15),
    borderBottom: `${vw(1)} solid #F1F5F9`,
    fontSize: vw(14),
    color: '#334155',
  },
};
