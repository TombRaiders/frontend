import React from 'react';
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

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function NoticeForm({
  noticeForm,
  setNoticeForm,
  notices,
  isLoading,
  errorMessage,
  onRefresh,
  onEdit,
  onDelete,
  deletingNoticeId,
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const handleChange = (field) => (event) => {
    setNoticeForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setNoticeForm((prev) => ({
      ...prev,
      images: [...prev.images, ...selectedFiles],
    }));
    event.target.value = '';
  };

  const removeImage = (index) => {
    setNoticeForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const removeRetainedImage = (imageId) => {
    setNoticeForm((prev) => ({
      ...prev,
      retainedImages: prev.retainedImages.filter((image) => image.imageId !== imageId),
    }));
  };

  const isEditing = Boolean(noticeForm.boardId);
  let submitButtonText = '공지 등록';
  if (isSubmitting) {
    submitButtonText = '저장 중...';
  } else if (isEditing) {
    submitButtonText = '공지 수정';
  }

  return (
    <AdminFormShell
      title="공지사항 관리"
      description="커뮤니티 공지사항을 등록, 조회, 수정, 삭제합니다."
      countLabel={`${notices.length}건`}
    >
      <AdminFormListPanel
        title="등록된 공지사항"
        loadingMessage="공지사항을 불러오는 중..."
        emptyMessage="등록된 공지사항이 없습니다."
        isEmpty={notices.length === 0}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onRefresh={onRefresh}
      >
        <div className="flex flex-col" style={{ gap: vw(10) }}>
          {notices.map((notice) => (
            <div
              key={notice.boardId}
              className="bg-white border border-[#EEE] flex justify-between items-start text-left"
              style={{ gap: vw(14), padding: vw(14), borderRadius: vw(6) }}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="font-bold text-[#222]"
                  style={{
                    fontSize: vw(14),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  #{notice.boardId} {notice.title}
                </div>
                <AdminTruncatedText>{notice.content}</AdminTruncatedText>
                <div className="text-[#999]" style={{ fontSize: vw(11), marginTop: vw(8) }}>
                  작성자 {notice.nickname || notice.loginId || '-'} · 작성일{' '}
                  {formatDate(notice.createdAt)}
                </div>
              </div>
              <div className="flex items-center shrink-0" style={{ gap: vw(8) }}>
                <AdminInlineActionButton
                  onClick={() => onEdit(notice)}
                  disabled={isSubmitting || Boolean(deletingNoticeId)}
                >
                  수정
                </AdminInlineActionButton>
                <AdminInlineActionButton
                  variant="danger"
                  onClick={() => onDelete(notice.boardId)}
                  disabled={isSubmitting || deletingNoticeId === notice.boardId}
                >
                  {deletingNoticeId === notice.boardId ? '삭제 중...' : '삭제'}
                </AdminInlineActionButton>
              </div>
            </div>
          ))}
        </div>
      </AdminFormListPanel>

      <div className="flex flex-col" style={{ gap: vw(18) }}>
        <h3 className="font-bold text-[#1A1A1A] m-0 text-left" style={{ fontSize: vw(15) }}>
          {isEditing ? `공지사항 #${noticeForm.boardId} 수정` : '공지사항 등록'}
        </h3>

        <AdminField label="제목">
          <AdminTextInput
            type="text"
            value={noticeForm.title}
            onChange={handleChange('title')}
            maxLength={512}
            placeholder="공지 제목을 입력해 주세요"
          />
        </AdminField>

        <AdminField label="내용">
          <AdminTextInput
            as="textarea"
            value={noticeForm.content}
            onChange={handleChange('content')}
            maxLength={4096}
            placeholder="공지 내용을 입력해 주세요"
            style={{
              padding: vw(14),
              minHeight: vw(260),
              resize: 'vertical',
              lineHeight: 1.7,
            }}
          />
        </AdminField>

        <div
          className="border border-[#EEE] bg-[#FAFAFA] text-left"
          style={{ borderRadius: vw(4), padding: vw(16) }}
        >
          <label
            className="font-bold text-[#2C9753] cursor-pointer inline-flex items-center"
            style={{ fontSize: vw(14), gap: vw(8) }}
          >
            이미지 첨부
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <span className="text-[#888]" style={{ fontSize: vw(12), marginLeft: vw(12) }}>
            최대 10개, 파일당 5MB
          </span>

          {noticeForm.retainedImages.length > 0 && (
            <div
              className="flex flex-wrap"
              style={{ gap: vw(8), marginTop: vw(14), paddingTop: vw(12) }}
            >
              {noticeForm.retainedImages.map((image) => (
                <div
                  key={image.imageId}
                  className="bg-white border border-[#DDD] flex items-center"
                  style={{
                    gap: vw(8),
                    padding: `${vw(6)} ${vw(10)}`,
                    borderRadius: vw(4),
                    fontSize: vw(12),
                  }}
                >
                  <a
                    href={image.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#555] hover:text-[#2C9753]"
                    style={{ textDecoration: 'none' }}
                  >
                    기존 이미지 #{image.imageId}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeRetainedImage(image.imageId)}
                    className="bg-transparent border-none text-[#D9534F] font-bold cursor-pointer"
                    style={{ fontSize: vw(12) }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          {noticeForm.images.length > 0 && (
            <div
              className="flex flex-wrap"
              style={{ gap: vw(8), marginTop: vw(14), paddingTop: vw(12) }}
            >
              {noticeForm.images.map((image, index) => (
                <div
                  key={`${image.name}-${index}`}
                  className="bg-white border border-[#DDD] flex items-center"
                  style={{
                    gap: vw(8),
                    padding: `${vw(6)} ${vw(10)}`,
                    borderRadius: vw(4),
                    fontSize: vw(12),
                  }}
                >
                  <span
                    className="text-[#555]"
                    style={{
                      maxWidth: vw(180),
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {image.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-transparent border-none text-[#D9534F] font-bold cursor-pointer"
                    style={{ fontSize: vw(12) }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdminFormActions
        submitButtonText={submitButtonText}
        cancelButtonText="목록으로"
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </AdminFormShell>
  );
}

NoticeForm.propTypes = {
  noticeForm: PropTypes.shape({
    boardId: PropTypes.number,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.object).isRequired,
    retainedImages: PropTypes.arrayOf(
      PropTypes.shape({
        imageId: PropTypes.number.isRequired,
        imageUrl: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  setNoticeForm: PropTypes.func.isRequired,
  notices: PropTypes.arrayOf(
    PropTypes.shape({
      boardId: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      loginId: PropTypes.string,
      nickname: PropTypes.string,
      createdAt: PropTypes.string,
      images: PropTypes.arrayOf(PropTypes.object),
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  deletingNoticeId: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

NoticeForm.defaultProps = {
  deletingNoticeId: null,
};

export default NoticeForm;
