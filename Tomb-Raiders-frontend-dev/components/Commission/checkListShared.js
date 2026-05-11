import {
  hasCommissionQuotationArrived,
  isCommissionEstimateStage,
  isCommissionFailed,
  isCommissionImageReady,
  isCommissionInProgress,
} from '../../api/commissionapi';

export const PAGE_SIZE = 20;

export const getVw = (px, min = Math.round(px * 0.65), max = px) =>
  `clamp(${min}px, ${(px / 1920) * 100}vw, ${max}px)`;

export const PAYMENT_COMPLETED_STATUSES = new Set([
  'PAYMENT_PAID',
  'PAYMENT_PAYED',
  'PAYMENT_COMPLETED',
  'PAID',
]);

export const normalizeStatusValue = (status) =>
  String(status || '')
    .trim()
    .toUpperCase();

export const isPaymentCompleted = (status) =>
  PAYMENT_COMPLETED_STATUSES.has(normalizeStatusValue(status));

export const getCommissionTitle = (item) => {
  const fallback = item?.commissionId ? `의뢰 대상: ${item.commissionId}` : '의뢰 내역';
  if (!item?.title || /^Commission #/i.test(item.title)) return fallback;
  return item.title;
};

export const getCommissionStatus = (status) => {
  const upperStatus = normalizeStatusValue(status);

  if (isPaymentCompleted(upperStatus))
    return { label: '결제 완료', color: '#2C9753', bgColor: '#E6F4EA' };
  if (hasCommissionQuotationArrived(upperStatus))
    return { label: '견적서 도착', color: '#6E4AFF', bgColor: '#F0EFFF' };
  if (isCommissionEstimateStage(upperStatus))
    return { label: '견적 확인 대기', color: '#6E4AFF', bgColor: '#F0EFFF' };
  if (isCommissionImageReady(upperStatus))
    return { label: 'AI 이미지 완성', color: '#2C9753', bgColor: '#E6F4EA' };
  if (isCommissionInProgress(upperStatus))
    return { label: 'AI 이미지 생성 중', color: '#F59E0B', bgColor: '#FEF3C7' };
  if (isCommissionFailed(upperStatus))
    return { label: '생성 실패', color: '#FF4D4F', bgColor: '#FEE2E2' };
  return { label: status || '진행 상태 확인 중', color: '#777777', bgColor: '#F3F4F6' };
};

export const getCommissionPreviewImage = (item) => {
  if (isCommissionImageReady(item.status, item.aiImageUrl)) {
    return item.aiImageUrl || item.imageUrl || item.inputImageUrl;
  }
  return item.inputImageUrl || item.imageUrl || item.aiImageUrl;
};

export const getVisiblePageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index);
  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  return Array.from({ length: 5 }, (_, index) => start + index);
};

export const createCheckListStyles = (overrides = {}) => ({
  pageStyle: { minHeight: '100vh', backgroundColor: '#F9FAFB', color: '#333' },
  mainStyle: {
    width: getVw(1200),
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: getVw(28),
    paddingBottom: getVw(100),
  },
  newProjectBox: {
    width: '100%',
    height: getVw(250),
    border: '2px dashed #D1D5DB',
    borderRadius: getVw(12),
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginBottom: getVw(40),
  },
  plusIcon: { fontSize: getVw(50), color: '#9CA3AF', fontWeight: '300', lineHeight: 1 },
  newProjectText: { fontSize: getVw(16), color: '#6B7280', marginTop: getVw(10) },
  menuRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: getVw(30),
    marginBottom: getVw(60),
  },
  menuBtn: {
    position: 'relative',
    width: '100%',
    height: getVw(110),
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: getVw(12),
    fontSize: getVw(18),
    fontWeight: 'bold',
    color: '#111827',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1.4',
  },
  listSection: { width: '100%' },
  listHeaderTitle: {
    fontSize: getVw(18),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: getVw(20),
    textAlign: 'left',
  },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: getVw(30) },
  cardStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: getVw(12),
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'relative',
  },
  cardActionBtn: {
    width: '100%',
    height: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'inherit',
    color: 'inherit',
  },
  imgWrapper: {
    width: '100%',
    aspectRatio: '4/3',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholderImg: { color: '#9CA3AF', fontSize: getVw(16), fontWeight: '500' },
  deleteBtn: {
    position: 'absolute',
    top: getVw(10),
    right: getVw(10),
    width: getVw(28),
    height: getVw(28),
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#FFF',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: getVw(14),
  },
  cardBody: { padding: getVw(20), textAlign: 'left' },
  cardTitle: {
    fontSize: getVw(18),
    fontWeight: 'bold',
    margin: `0 0 ${getVw(8)} 0`,
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardDate: { fontSize: getVw(14), color: '#6B7280', margin: 0 },
  statusBadge: {
    display: 'inline-block',
    marginTop: getVw(16),
    padding: `${getVw(6)} ${getVw(12)}`,
    fontSize: getVw(12),
    fontWeight: 'bold',
    borderRadius: getVw(6),
  },
  noticeStyle: {
    width: '100%',
    minHeight: getVw(120),
    borderRadius: getVw(15),
    border: '1px solid #EBEBEB',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#777777',
    fontSize: getVw(16),
  },
  paginationStyle: {
    marginTop: getVw(40),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getVw(12),
  },
  pageNumberGroupStyle: { display: 'flex', alignItems: 'center', gap: getVw(8) },
  getPaginationButtonStyle: (disabled) => ({
    minWidth: getVw(68),
    height: getVw(38),
    border: '1px solid #DADDE1',
    borderRadius: getVw(8),
    background: disabled ? '#F3F4F6' : '#FFFFFF',
    color: disabled ? '#A0A5AA' : '#333333',
    fontSize: getVw(14),
    fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
  getPageNumberButtonStyle: (active) => ({
    width: getVw(38),
    height: getVw(38),
    border: `1px solid ${active ? '#2C9753' : '#DADDE1'}`,
    borderRadius: getVw(8),
    background: active ? '#2C9753' : '#FFFFFF',
    color: active ? '#FFFFFF' : '#333333',
    fontSize: getVw(14),
    fontWeight: 800,
    cursor: active ? 'default' : 'pointer',
  }),
  ...overrides,
});
