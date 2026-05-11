import React from 'react';
import PropTypes from 'prop-types';

function NavSearchInput({ vw, wrapperStyle = {}, inputStyle = {} }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: vw(20),
        left: '50%',
        transform: 'translateX(-50%)',
        width: vw(440),
        height: vw(40),
        ...wrapperStyle,
      }}
    >
      <input
        type="text"
        placeholder="검색"
        style={{
          width: '100%',
          height: '100%',
          padding: `0 ${vw(25)}`,
          backgroundColor: 'white',
          borderRadius: vw(50),
          textAlign: 'center',
          border: 'none',
          outline: 'none',
          fontSize: vw(12),
          ...inputStyle,
        }}
      />
    </div>
  );
}

NavSearchInput.propTypes = {
  vw: PropTypes.func.isRequired,
  wrapperStyle: PropTypes.object,
  inputStyle: PropTypes.object,
};

export default NavSearchInput;
