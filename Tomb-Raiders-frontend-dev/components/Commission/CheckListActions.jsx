import React from 'react';
import PropTypes from 'prop-types';
import { getVw } from './checkListShared';

function CheckListActions({ styles, onNewProject, menuItems }) {
  return (
    <>
      <button type="button" onClick={onNewProject} style={styles.newProjectBox}>
        <div style={styles.plusIcon}>+</div>
        <div style={styles.newProjectText}>새로운 프로젝트</div>
      </button>

      <div style={styles.menuRow}>
        {menuItems.map((item) => (
          <button key={item.label} type="button" style={styles.menuBtn} onClick={item.onClick}>
            {item.label}
            {item.description ? (
              <>
                <br />
                <span style={{ fontSize: getVw(14), color: '#888', fontWeight: '500' }}>
                  {item.description}
                </span>
              </>
            ) : null}
          </button>
        ))}
      </div>
    </>
  );
}

CheckListActions.propTypes = {
  styles: PropTypes.object.isRequired,
  onNewProject: PropTypes.func.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      onClick: PropTypes.func.isRequired,
    }),
  ).isRequired,
};

export default CheckListActions;
