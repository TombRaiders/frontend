import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  AdminField,
  AdminFormActions,
  AdminFormListPanel,
  AdminFormShell,
  AdminInlineActionButton,
  AdminTextInput,
  AdminTruncatedText,
} from './AdminFormLayout';
import { vw } from '../../utils/style';

const formatFileSize = (size) => {
  if (!size) return '0 KB';
  return `${Math.ceil(size / 1024)} KB`;
};

function MainImageForm({
  mainImageForm,
  setMainImageForm,
  railImages,
  isLoading,
  errorMessage,
  onRefresh,
  onEdit,
  onDelete,
  deletingImageId,
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const selectedImagePreview = useMemo(() => {
    if (!mainImageForm.image) return null;
    return {
      file: mainImageForm.image,
      url: URL.createObjectURL(mainImageForm.image),
    };
  }, [mainImageForm.image]);

  useEffect(
    () => () => {
      if (selectedImagePreview?.url) {
        URL.revokeObjectURL(selectedImagePreview.url);
      }
    },
    [selectedImagePreview],
  );

  const handleChange = (field) => (event) => {
    setMainImageForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setMainImageForm((prev) => ({ ...prev, image: selectedFile }));
    event.target.value = '';
  };

  const clearSelectedImage = () => {
    setMainImageForm((prev) => ({ ...prev, image: null }));
  };

  const isEditing = Boolean(mainImageForm.imageId);
  let submitButtonText = '레일 이미지 등록';
  if (isSubmitting) {
    submitButtonText = '저장 중...';
  } else if (isEditing) {
    submitButtonText = '레일 이미지 수정';
  }

  return (
    <AdminFormShell
      title="레일 이미지 관리"
      description="메인 페이지 이미지 레일에 노출할 이미지를 등록, 수정, 삭제합니다."
      countLabel={`${railImages.length}/20`}
    >
      <AdminFormListPanel
        title="등록된 레일 이미지"
        loadingMessage="레일 이미지를 불러오는 중..."
        emptyMessage="등록된 레일 이미지가 없습니다."
        isEmpty={railImages.length === 0}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onRefresh={onRefresh}
      >
        <div className="grid grid-cols-2" style={{ gap: vw(12) }}>
          {railImages.map((image) => (
            <div
              key={image.imageId}
              className="bg-white border border-[#EEE] flex"
              style={{ gap: vw(12), padding: vw(12), borderRadius: vw(6) }}
            >
              <div
                className="bg-[#EDEDED] shrink-0 overflow-hidden"
                style={{ width: vw(150), height: vw(92), borderRadius: vw(4) }}
              >
                {image.imageUrl && (
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `레일 이미지 ${image.imageId}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-bold text-[#222]" style={{ fontSize: vw(14) }}>
                  #{image.imageId} / 노출 순서 {image.displayOrder}
                </div>
                <AdminTruncatedText>{image.altText || '대체 텍스트 없음'}</AdminTruncatedText>
                <div className="flex items-center" style={{ gap: vw(8), marginTop: vw(12) }}>
                  <AdminInlineActionButton
                    onClick={() => onEdit(image)}
                    disabled={isSubmitting || Boolean(deletingImageId)}
                  >
                    수정
                  </AdminInlineActionButton>
                  <AdminInlineActionButton
                    variant="danger"
                    onClick={() => onDelete(image.imageId)}
                    disabled={isSubmitting || deletingImageId === image.imageId}
                  >
                    {deletingImageId === image.imageId ? '삭제 중...' : '삭제'}
                  </AdminInlineActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminFormListPanel>

      <div className="flex flex-col" style={{ gap: vw(18) }}>
        <h3 className="font-bold text-[#1A1A1A] m-0 text-left" style={{ fontSize: vw(15) }}>
          {isEditing ? `레일 이미지 #${mainImageForm.imageId} 수정` : '레일 이미지 등록'}
        </h3>

        <AdminField label="대체 텍스트">
          <AdminTextInput
            type="text"
            value={mainImageForm.altText}
            onChange={handleChange('altText')}
            maxLength={255}
            placeholder="메인 레일 이미지 대체 텍스트"
          />
        </AdminField>

        <AdminField label="노출 순서">
          <AdminTextInput
            type="number"
            min="1"
            value={mainImageForm.displayOrder}
            onChange={handleChange('displayOrder')}
            placeholder="1"
          />
        </AdminField>

        <div
          className="border border-[#EEE] bg-[#FAFAFA] text-left"
          style={{ borderRadius: vw(6), padding: vw(16) }}
        >
          <label
            className="font-bold text-[#2C9753] cursor-pointer inline-flex items-center"
            style={{ fontSize: vw(14), gap: vw(8) }}
          >
            이미지 파일 선택
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <span className="text-[#888]" style={{ fontSize: vw(12), marginLeft: vw(12) }}>
            jpg, png, webp / 최대 20MB
          </span>
          {isEditing && (
            <span className="text-[#888]" style={{ fontSize: vw(12), marginLeft: vw(12) }}>
              수정 시 파일을 선택하지 않으면 기존 이미지가 유지됩니다.
            </span>
          )}

          {selectedImagePreview && (
            <div
              className="bg-white border border-[#DDD] overflow-hidden"
              style={{ width: vw(260), marginTop: vw(16), borderRadius: vw(6) }}
            >
              <div
                className="bg-[#EEE]"
                style={{ width: '100%', height: vw(150), overflow: 'hidden' }}
              >
                <img
                  src={selectedImagePreview.url}
                  alt={selectedImagePreview.file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="flex flex-col" style={{ gap: vw(6), padding: vw(10) }}>
                <span
                  className="text-[#333] font-bold"
                  style={{
                    fontSize: vw(12),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedImagePreview.file.name}
                </span>
                <span className="text-[#888]" style={{ fontSize: vw(11) }}>
                  {formatFileSize(selectedImagePreview.file.size)}
                </span>
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="bg-white text-[#D9534F] font-bold cursor-pointer border border-[#F1C5C3] hover:bg-[#FFF5F5] transition-colors"
                  style={{ fontSize: vw(12), padding: `${vw(6)} 0`, borderRadius: vw(4) }}
                >
                  선택 해제
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminFormActions
        submitButtonText={submitButtonText}
        cancelButtonText={isEditing || mainImageForm.image ? '입력 초기화' : '목록으로'}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </AdminFormShell>
  );
}

const railImageShape = PropTypes.shape({
  imageId: PropTypes.number.isRequired,
  imageUrl: PropTypes.string,
  altText: PropTypes.string,
  displayOrder: PropTypes.number.isRequired,
});

MainImageForm.propTypes = {
  mainImageForm: PropTypes.shape({
    imageId: PropTypes.number,
    altText: PropTypes.string.isRequired,
    displayOrder: PropTypes.string.isRequired,
    image: PropTypes.object,
  }).isRequired,
  setMainImageForm: PropTypes.func.isRequired,
  railImages: PropTypes.arrayOf(railImageShape).isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  deletingImageId: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

MainImageForm.defaultProps = {
  deletingImageId: null,
};

export default MainImageForm;
