export const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

export const SharedStyles = {
  vw,
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    paddingBottom: vw(100),
  },
  header: {
    height: vw(70),
    backgroundColor: '#2C9753',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `0 ${vw(100)}`,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    boxSizing: 'border-box',
  },
  backBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: vw(16),
    color: '#fff',
  },
};
