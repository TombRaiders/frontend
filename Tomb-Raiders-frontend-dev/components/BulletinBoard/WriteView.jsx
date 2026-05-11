import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

const WRITABLE_BOARD_OPTIONS = [
  { type: 'FREE_BOARD', label: '자유게시판' },
  { type: 'BRAGGING_BOARD', label: '자랑게시판' },
];

function WriteView({ newPost, setNewPost }) {
  const isEditMode = !!newPost.boardId;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewPost((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...selectedFiles],
    }));
    e.target.value = '';
  };

  const removeFile = (index) => {
    setNewPost((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: vw(20) }}>
      <div
        style={{
          backgroundColor: 'white',
          padding: `${vw(18)} ${vw(35)}`,
          borderRadius: vw(10),
          fontSize: vw(22),
          fontWeight: 'bold',
          textAlign: 'left',
        }}
      >
        {isEditMode ? '커뮤니티 글수정' : '커뮤니티 글쓰기'}
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: vw(10), padding: vw(35) }}>
        <div style={{ display: 'flex', gap: vw(20), marginBottom: vw(15) }}>
          <select
            aria-label="게시판 선택"
            value={newPost.type || 'FREE_BOARD'}
            onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
            disabled={isEditMode}
            style={{
              padding: vw(10),
              borderRadius: vw(25),
              border: '1px solid #B4B4B4',
              width: vw(200),
              fontSize: vw(14),
              backgroundColor: isEditMode ? '#F3F4F6' : 'white',
            }}
          >
            {WRITABLE_BOARD_OPTIONS.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="제목을 입력해 주세요"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            style={{ flex: 1, padding: vw(10), borderRadius: vw(25), border: '1px solid #B4B4B4' }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: vw(25),
            borderBottom: '1px solid #F0F0F0',
            padding: `${vw(10)} 0`,
            marginBottom: vw(20),
          }}
        >
          <label
            style={{ fontSize: vw(14), fontWeight: 'bold', cursor: 'pointer', color: '#2C9753' }}
          >
            <span>사진 추가 (여러 장 가능)</span>
            <input
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>
        </div>

        {newPost.images?.length > 0 && (
          <div style={{ marginBottom: vw(20), display: 'flex', flexWrap: 'wrap', gap: vw(10) }}>
            {newPost.images.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: vw(8),
                  padding: `${vw(5)} ${vw(10)}`,
                  backgroundColor: '#F3F4F6',
                  borderRadius: vw(15),
                  fontSize: vw(12),
                  border: '1px solid #E5E7EB',
                }}
              >
                <span
                  style={{
                    maxWidth: vw(150),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: vw(14),
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          placeholder="내용을 입력해 주세요"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          style={{
            width: '100%',
            height: vw(450),
            border: 'none',
            outline: 'none',
            fontSize: vw(16),
            resize: 'none',
          }}
        />
      </div>
    </div>
  );
}

WriteView.propTypes = {
  newPost: PropTypes.object.isRequired,
  setNewPost: PropTypes.func.isRequired,
};

export default WriteView;
