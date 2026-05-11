import { vw, SharedStyles } from './SharedPayment.style';

// 💡 SonarLint 권장 사항 반영: 가져옴과 동시에 다시 내보내기 (Re-export)
export { vw } from './SharedPayment.style';

export const S = {
  ...SharedStyles, // 공통 스타일 병합 (container, header, backBtn)

  contentWrapper: {
    maxWidth: vw(750),
    margin: `${vw(110)} auto 0`,
    display: 'flex',
    flexDirection: 'column',
    gap: vw(20),
  },

  // 섹션 공통 스타일
  box: {
    backgroundColor: '#fff',
    padding: vw(30),
    borderRadius: vw(15),
    border: '1px solid #eee',
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: vw(20),
    fontWeight: 'bold',
    margin: 0,
    borderLeft: `${vw(5)} solid #2C9753`,
    paddingLeft: vw(12),
    marginBottom: vw(20),
  },

  // 구매자 정보 등 로우 스타일
  infoRow: { display: 'flex', marginBottom: vw(10), fontSize: vw(16) },
  label: { width: vw(120), color: '#888' },
  value: { color: '#333', fontWeight: '500' },

  // 배송 및 상품 상세
  itemDetail: { display: 'flex', gap: vw(20), textAlign: 'left' },
  itemImg: { width: vw(100), height: vw(100), borderRadius: vw(10), objectFit: 'cover' },
  changeBtn: {
    padding: `${vw(6)} ${vw(15)}`,
    border: '1px solid #ddd',
    borderRadius: vw(5),
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: vw(13),
  },
  badge: {
    marginLeft: vw(10),
    fontSize: vw(11),
    color: '#2C9753',
    border: `1px solid #2C9753`,
    padding: '2px 5px',
    borderRadius: '4px',
  },

  // 결제 금액 요약
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: vw(10),
    color: '#666',
    fontSize: vw(16),
  },
  divider: { height: vw(1), backgroundColor: '#EEE', margin: `${vw(15)} 0` },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: vw(22),
    fontWeight: 'bold',
    color: '#2C9753',
  },

  // 결제 방법 및 하단 영역
  radioGroup: { display: 'flex', gap: vw(40) },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: vw(10),
    cursor: 'pointer',
    fontSize: vw(16),
  },
  agreeSection: { margin: `${vw(20)} 0`, display: 'flex', justifyContent: 'center' },
  checkbox: { width: vw(20), height: vw(20) },
  payBtn: (agreed) => ({
    width: '100%',
    height: vw(70),
    border: 'none',
    borderRadius: vw(12),
    color: '#fff',
    fontSize: vw(20),
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
    backgroundColor: agreed ? '#2C9753' : '#ccc',
  }),
};
