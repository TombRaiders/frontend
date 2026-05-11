import React from 'react';
import PropTypes from 'prop-types';
import { vw } from './PaymentPage.style';

// 중복되던 스타일을 이곳 한 곳으로 모았습니다.
const styles = {
  pageBackground: {
    backgroundColor: '#F7F8F9',
    minHeight: '100vh',
    paddingTop: vw(80),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  resultBox: {
    width: vw(800),
    backgroundColor: 'white',
    borderRadius: vw(8),
    border: '1px solid #E0E0E0',
    padding: `${vw(60)} 0`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  outlineBtn: {
    padding: `${vw(12)} ${vw(24)}`,
    backgroundColor: 'white',
    border: '1px solid #CCC',
    borderRadius: vw(4),
    cursor: 'pointer',
    fontSize: vw(14),
  },
  solidBtn: {
    padding: `${vw(12)} ${vw(32)}`,
    backgroundColor: '#1A9E5A',
    color: 'white',
    border: 'none',
    borderRadius: vw(4),
    cursor: 'pointer',
    fontSize: vw(14),
    fontWeight: 'bold',
  },
};

function PaymentResultTemplate({
  icon,
  titleNode,
  descriptionNode,
  leftBtnText,
  onLeftBtnClick,
  rightBtnText,
  onRightBtnClick,
}) {
  return (
    <div style={styles.pageBackground}>
      <div style={{ width: vw(800), textAlign: 'left', marginBottom: vw(10) }}>
        <span style={{ fontSize: vw(20), fontWeight: 'bold', color: '#1A9E5A' }}>주문/결제</span>
      </div>
      <div style={styles.resultBox}>
        {icon}
        {titleNode}
        {descriptionNode}
      </div>
      <div style={{ display: 'flex', gap: vw(12), marginTop: vw(24) }}>
        <button onClick={onLeftBtnClick} style={styles.outlineBtn}>
          {leftBtnText}
        </button>
        <button onClick={onRightBtnClick} style={styles.solidBtn}>
          {rightBtnText}
        </button>
      </div>
    </div>
  );
}

PaymentResultTemplate.propTypes = {
  icon: PropTypes.node.isRequired,
  titleNode: PropTypes.node.isRequired,
  descriptionNode: PropTypes.node,
  leftBtnText: PropTypes.string.isRequired,
  onLeftBtnClick: PropTypes.func.isRequired,
  rightBtnText: PropTypes.string.isRequired,
  onRightBtnClick: PropTypes.func.isRequired,
};

export default PaymentResultTemplate;
