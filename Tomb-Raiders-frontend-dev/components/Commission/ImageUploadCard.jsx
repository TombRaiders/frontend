import React from 'react';
import PropTypes from 'prop-types';

function ImageUploadCard({ fileInputRef, onFileChange, previewUrl }) {
  return (
    <button type="button" onClick={() => fileInputRef.current.click()} style={S.uploadBoxStyle}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      {previewUrl ? (
        <img src={previewUrl} style={S.previewImgStyle} alt="미리보기" />
      ) : (
        <div style={S.uploadPlaceholder}>
          <span style={{ fontSize: S.vw(40) }}>+</span>
          <p>이미지를 클릭해 업로드하세요</p>
        </div>
      )}
    </button>
  );
}

ImageUploadCard.propTypes = {
  fileInputRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
  onFileChange: PropTypes.func.isRequired,
  previewUrl: PropTypes.string,
};

const S = {
  vw: (size) => `${(size / 1920) * window.innerWidth}px`,
  uploadBoxStyle: {
    width: '100%',
    height: '350px',
    border: '2px dashed #ccc',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  uploadPlaceholder: { textAlign: 'center', color: '#999' },
  previewImgStyle: { width: '100%', height: '100%', objectFit: 'cover' },
};

export default ImageUploadCard;
