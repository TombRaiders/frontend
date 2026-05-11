import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function CreateAssetCard({ vw }) {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate('/commission')} style={S.cardButton(vw)}>
      <span style={S.plusIcon(vw)}>+</span>
      <p style={S.text(vw)}>새로운 의뢰</p>
    </button>
  );
}

const S = {
  cardButton: (vw) => ({
    width: vw(800),
    height: vw(150),
    border: `2px dashed #B4B4B4`,
    borderRadius: vw(15),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
    boxSizing: 'border-box',
    padding: 0,
    outline: 'none',
  }),
  plusIcon: (vw) => ({ fontSize: vw(40), color: '#2C9753', fontWeight: 'bold' }),
  text: (vw) => ({ fontSize: vw(18), color: '#666', marginTop: vw(10) }),
};

CreateAssetCard.propTypes = { vw: PropTypes.func.isRequired };
export default CreateAssetCard;
