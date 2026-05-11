import React from 'react';
import { vw } from '../../utils/style';

function SearchBar() {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: vw(40) }}>
      <input
        type="text"
        placeholder="검색"
        style={{
          width: '90%',
          padding: vw(15),
          borderRadius: vw(10),
          border: `${vw(1)} solid #DDD`,
          outline: 'none',
          fontSize: vw(16),
          backgroundColor: '#F9F9F9',
        }}
      />
    </div>
  );
}

export default SearchBar;
