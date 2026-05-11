import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

function ShippingAddressField({ label, width = 350, name, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: vw(15) }}>
      <p style={{ fontSize: vw(10), color: '#333', marginBottom: vw(5), textAlign: 'left' }}>
        {label}
      </p>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: vw(width),
          height: vw(30),
          border: `${vw(1)} solid #ddd`,
          borderRadius: vw(10),
          padding: `0 ${vw(10)}`,
          boxSizing: 'border-box',
          outline: 'none',
          fontSize: vw(10),
        }}
      />
    </div>
  );
}
ShippingAddressField.propTypes = {
  label: PropTypes.string.isRequired,
  width: PropTypes.number,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default ShippingAddressField;
