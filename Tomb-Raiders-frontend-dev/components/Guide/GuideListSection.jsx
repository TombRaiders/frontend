import React from 'react';
import PropTypes from 'prop-types';

function GuideListSection({ title, items, itemColor, vw, hasMarginBottom }) {
  return (
    <div style={{ marginBottom: hasMarginBottom ? vw(35) : 0 }}>
      <h3 style={{ fontSize: vw(18), fontWeight: 'bold', marginBottom: vw(20), color: '#333' }}>
        {title}
      </h3>
      <ul
        style={{
          listStyleType: 'disc',
          paddingLeft: vw(24),
          display: 'flex',
          flexDirection: 'column',
          gap: vw(12),
        }}
      >
        {items.map((item) => (
          <li key={item} style={{ fontSize: vw(16), color: itemColor, lineHeight: 1.5 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

GuideListSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  itemColor: PropTypes.string.isRequired,
  vw: PropTypes.func.isRequired,
  hasMarginBottom: PropTypes.bool,
};

GuideListSection.defaultProps = {
  hasMarginBottom: false,
};

export default GuideListSection;
