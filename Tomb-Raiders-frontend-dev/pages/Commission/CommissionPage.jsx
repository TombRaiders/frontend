import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommissionHeader from '../../components/Commission/CommissionHeader';
import ImageUploadCard from '../../components/Commission/ImageUploadCard';
import StyleSelectForm from '../../components/Commission/StyleSelectForm';
import { useCommission } from './useCommission';
import { useAlert } from '../../components/Common/AlertProvider';

function CommissionPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [style, setStyle] = useState('지브리');

  const { uploadImage, isLoading, error } = useCommission();
  const { showAlert } = useAlert();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showAlert('이미지 파일(jpg, png, webp)만 업로드할 수 있습니다.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showAlert('이미지를 업로드해주세요.');
      return;
    }

    const response = await uploadImage({ file: selectedFile, style });

    if (response) {
      showAlert('이미지가 성공적으로 업로드되었습니다!', () => {
        navigate('/commissions');
      });
    }
  };

  return (
    <div style={S.containerStyle}>
      <CommissionHeader title="이미지 의뢰" />

      <div style={S.contentWrapper}>
        <div style={S.cardStyle}>
          {error ? (
            <div style={{ color: 'red', marginBottom: vw(10), fontWeight: 'bold' }}>{error}</div>
          ) : null}

          <ImageUploadCard
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            previewUrl={previewUrl}
          />

          <StyleSelectForm
            style={style}
            setStyle={setStyle}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

const S = {
  containerStyle: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#F7F7F7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  contentWrapper: {
    marginTop: vw(120),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardStyle: {
    width: vw(550),
    backgroundColor: '#FFF',
    borderRadius: vw(15),
    padding: vw(40),
    boxSizing: 'border-box',
    border: '1px solid #EBEBEB',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
};

export default CommissionPage;
