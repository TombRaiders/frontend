import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { get, put } from '../../../api/apiClient';
import { saveCurrentUserProfile } from '../../../utils/currentUserProfile';

const isProfileImageUploadSuccess = (response) => {
  const responseSuccess = response?.data?.isSuccess ?? response?.data?.success;
  if (responseSuccess === false) return false;

  return (
    responseSuccess === true ||
    (typeof response?.status === 'number' && response.status >= 200 && response.status < 300)
  );
};

const getProfileImageUrl = (response) =>
  response?.data?.data?.profileImageUrl || response?.data?.profileImageUrl || '';

const hasProfileImageChanged = (response, previousProfileImageUrl) => {
  const refreshedProfileImageUrl = getProfileImageUrl(response);
  return Boolean(refreshedProfileImageUrl && refreshedProfileImageUrl !== previousProfileImageUrl);
};

const noopProfileImageUploadSuccess = () => {};

function EditContentBox({
  vw,
  formData,
  onChange,
  onSave,
  setFormData,
  onProfileImageUploadSuccess = noopProfileImageUploadSuccess,
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const labelStyle = {
    fontSize: vw(13),
    fontWeight: 'bold',
    marginBottom: vw(8),
    display: 'block',
    textAlign: 'left',
  };

  const inputStyle = {
    width: '100%',
    height: vw(40),
    border: `${vw(1)} solid #B4B4B4`,
    borderRadius: vw(8),
    padding: `0 ${vw(15)}`,
    fontSize: vw(13),
    marginBottom: vw(20),
    outline: 'none',
    boxSizing: 'border-box',
  };

  const handleProfileImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const updateProfileImageState = (profileImageUrl) => {
    if (!profileImageUrl) return;

    setFormData((prev) => ({ ...prev, profileImageUrl }));
    saveCurrentUserProfile({ ...formData, profileImageUrl });
  };

  const refreshProfileImageUrl = async () => {
    const profileResponse = await get('/v1/member/me');
    return getProfileImageUrl(profileResponse);
  };

  const handleSuccessfulProfileImageUpload = (profileImageUrl) => {
    updateProfileImageState(profileImageUrl);
    alert('프로필 이미지가 성공적으로 변경되었습니다!');
    onProfileImageUploadSuccess();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previousProfileImageUrl = formData.profileImageUrl || '';

    // 1. 미리보기 생성
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, profileImageUrl: previewUrl }));

    // 2. FormData 구성
    const uploadData = new FormData();
    uploadData.append('image', file);

    setIsUploading(true);
    try {
      const res = await put('/v1/member/profile-image', uploadData);

      if (isProfileImageUploadSuccess(res)) {
        let nextProfileImageUrl = getProfileImageUrl(res);
        if (!nextProfileImageUrl) {
          try {
            nextProfileImageUrl = await refreshProfileImageUrl();
          } catch (profileError) {
            console.error('프로필 이미지 업로드 후 상태 확인 실패:', profileError);
          }
        }
        handleSuccessfulProfileImageUpload(nextProfileImageUrl);
      } else {
        alert('이미지 변경 중 문제가 발생했습니다.');
      }
    } catch (error) {
      try {
        const profileResponse = await get('/v1/member/me');
        if (hasProfileImageChanged(profileResponse, previousProfileImageUrl)) {
          handleSuccessfulProfileImageUpload(getProfileImageUrl(profileResponse));
          return;
        }
      } catch (profileError) {
        console.error('프로필 이미지 업로드 후 상태 확인 실패:', profileError);
      }
      console.error('❌ 업로드 실패:', error);
      alert('업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        width: vw(600),
        backgroundColor: '#FFF',
        borderRadius: vw(10),
        border: `${vw(1)} solid #B4B4B4`,
        padding: vw(30),
        boxSizing: 'border-box',
      }}
    >
      <h3
        style={{
          fontSize: vw(16),
          fontWeight: 'bold',
          textAlign: 'left',
          margin: `0 0 ${vw(20)} 0`,
        }}
      >
        정보 관리
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: vw(30),
        }}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />

        <div
          style={{
            width: vw(100),
            height: vw(100),
            backgroundColor: '#D9D9D9',
            borderRadius: '50%',
            marginBottom: vw(10),
            border: `${vw(1)} solid #E0E0E0`,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {formData.profileImageUrl && (
            <img
              src={formData.profileImageUrl}
              alt="프로필 이미지"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isUploading ? 0.5 : 1,
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/defaultprofile.png';
              }}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleProfileImageClick}
          disabled={isUploading}
          style={{
            fontSize: vw(12),
            color: isUploading ? '#999' : '#2C9753',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
        >
          {isUploading ? '업로드 중...' : '프로필 사진 변경'}
        </button>
      </div>

      <div style={{ textAlign: 'left' }}>
        <label htmlFor="nickname" style={labelStyle}>
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          value={formData.nickname || ''}
          onChange={onChange}
          style={inputStyle}
        />

        <label htmlFor="email" style={labelStyle}>
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email || ''}
          readOnly
          style={{ ...inputStyle, backgroundColor: '#F5F5F5', color: '#666' }}
        />

        <label htmlFor="bio" style={labelStyle}>
          자기소개
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio || ''}
          onChange={onChange}
          style={{ ...inputStyle, height: vw(100), paddingTop: vw(10), resize: 'none' }}
        />
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isUploading}
        style={{
          width: vw(150),
          height: vw(40),
          backgroundColor: isUploading ? '#CCC' : '#2C9753',
          color: '#FFF',
          border: 'none',
          borderRadius: vw(25),
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        변경사항 저장
      </button>
    </div>
  );
}

EditContentBox.propTypes = {
  vw: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    nickname: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
    profileImageUrl: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  onProfileImageUploadSuccess: PropTypes.func,
};

export default EditContentBox;
