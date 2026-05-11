import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import NavSearchInput from '../NavSearchInput';
import ProfileDropdown from '../ProfileDropdown';

function EditTopNav({ vw }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: vw(80),
        backgroundColor: '#2C9753',
        display: 'flex',
        alignItems: 'center',
        zIndex: 120,
      }}
    >
      <button
        onClick={() => navigate('/Member')}
        style={{
          position: 'absolute',
          left: vw(540),
          fontSize: vw(30),
          color: '#FFF',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        &lt;
      </button>

      <NavSearchInput vw={vw} />

      <ProfileDropdown
        vw={vw}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onProfileClick={() => navigate('/Member')}
        onEditClick={() => navigate('/member/edit')}
        logoutIcon="✅"
      />
    </div>
  );
}
EditTopNav.propTypes = {
  vw: PropTypes.func.isRequired,
};

export default EditTopNav;
