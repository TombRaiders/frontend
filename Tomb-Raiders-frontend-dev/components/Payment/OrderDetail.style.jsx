import { vw, SharedStyles } from './SharedPayment.style';

// 💡 SonarLint 권장 사항 반영: 가져옴과 동시에 다시 내보내기 (Re-export)
export { vw } from './SharedPayment.style';

export const S = {
  ...SharedStyles, // 공통 스타일 병합 (container, header, backBtn)

  contentWrapper: {
    maxWidth: vw(800),
    margin: `${vw(110)} auto 0`,
    display: 'flex',
    flexDirection: 'column',
  },
  whiteBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: vw(40),
    borderRadius: vw(10),
    border: '1px solid #eee',
    boxSizing: 'border-box',
  },
  row: { display: 'flex', gap: vw(40), marginBottom: vw(10) },
  label: { width: vw(100), fontWeight: 'bold', color: '#333', textAlign: 'left' },
  value: { color: '#666' },
  hr: { border: 'none', borderTop: '1px solid #eee', margin: `${vw(30)} 0` },

  // 상품 요약
  productSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: vw(20),
    border: '1px solid #eee',
    borderRadius: vw(10),
    marginBottom: vw(40),
  },
  summaryImg: {
    width: vw(80),
    height: vw(80),
    backgroundColor: '#eee',
    borderRadius: vw(10),
    objectFit: 'cover',
  },

  // 정보 섹션 공통
  infoSection: { marginBottom: vw(40), textAlign: 'left' },
  sectionTitle: { borderBottom: '2px solid #333', paddingBottom: vw(10), marginBottom: vw(15) },
  infoRow: { display: 'flex', marginBottom: vw(8), fontSize: vw(16) },
  subLabel: { width: vw(120), color: '#888' },

  // 하단 버튼
  bottomBtnArea: { display: 'flex', justifyContent: 'center', gap: vw(20), marginTop: vw(40) },
  btnWhite: {
    width: vw(200),
    height: vw(50),
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: vw(5),
    cursor: 'pointer',
  },
  btnOrange: {
    width: vw(200),
    height: vw(50),
    backgroundColor: '#2C9753',
    color: '#fff',
    border: 'none',
    borderRadius: vw(5),
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
