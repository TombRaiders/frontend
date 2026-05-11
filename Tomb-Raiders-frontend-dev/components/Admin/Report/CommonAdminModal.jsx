import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../../utils/style';

export default function CommonAdminModal({
  isOpen,
  title,
  icon,
  onClose,
  onSubmit,
  submitText,
  submitColor,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#FFF',
          padding: vw(35),
          borderRadius: vw(16),
          width: vw(420),
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <h3
          style={{
            margin: `0 0 ${vw(25)} 0`,
            fontSize: vw(22),
            color: '#0F172A',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            gap: vw(8),
          }}
        >
          <span style={{ color: submitColor }}>{icon}</span> {title}
        </h3>

        {children}

        <div style={{ display: 'flex', gap: vw(12), marginTop: vw(30) }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: vw(14),
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: 'none',
              borderRadius: vw(8),
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: vw(15),
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSubmit}
            style={{
              flex: 1,
              padding: vw(14),
              backgroundColor: submitColor,
              color: 'white',
              border: 'none',
              borderRadius: vw(8),
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: vw(15),
            }}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}

CommonAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
  submitColor: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
