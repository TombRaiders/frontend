import React from 'react';
import PropTypes from 'prop-types';

const vw = (size) => `${(size / 1920) * window.innerWidth}px`;

function ImageComparisonStep({
  originalImg,
  aiImg,
  isAiImagePending = false,
  style,
  setStyle,
  onRegenerate,
  onConfirm,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: vw(100), justifyContent: 'center' }}>
        <div>
          <p style={labelStyle}>원본 이미지</p>
          <div style={imgBoxStyle}>
            <img src={originalImg} style={{ width: '100%' }} alt="원본" />
          </div>
        </div>
        <div>
          <p style={labelStyle}>생성 이미지</p>
          <div style={imgBoxStyle}>
            <img
              src={aiImg}
              style={{
                width: '100%',
                opacity: isAiImagePending ? 0.45 : 1,
                filter: isAiImagePending ? 'grayscale(15%) saturate(65%) brightness(1.08)' : 'none',
              }}
              alt="생성본"
            />
            {isAiImagePending ? <div style={pendingBadgeStyle}>AI 이미지 생성 중</div> : null}
          </div>
        </div>
      </div>

      <div style={{ marginTop: vw(40), textAlign: 'center' }}>
        <p style={{ fontSize: vw(16), marginBottom: vw(10) }}>이미지 스타일</p>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          style={{
            width: vw(280),
            height: vw(50),
            borderRadius: vw(8),
            border: '1px solid #333',
            textAlign: 'center',
          }}
        >
          <option value="지브리">지브리</option>
          <option value="픽사">픽사</option>
          <option value="실사">실사</option>
        </select>
      </div>

      <div style={{ marginTop: vw(60), display: 'flex', flexDirection: 'column', gap: vw(15) }}>
        <button onClick={onRegenerate} style={orangeBtnStyle}>
          이미지 재생성하기
        </button>
        <button
          onClick={onConfirm}
          disabled={isAiImagePending}
          style={{
            ...orangeBtnStyle,
            backgroundColor: isAiImagePending ? '#A7A7A7' : '#2C9753',
            cursor: isAiImagePending ? 'not-allowed' : 'pointer',
          }}
        >
          {isAiImagePending ? '이미지 생성 중...' : '이미지 생성 완료'}
        </button>
      </div>
    </div>
  );
}

ImageComparisonStep.propTypes = {
  originalImg: PropTypes.string.isRequired,
  aiImg: PropTypes.string.isRequired,
  isAiImagePending: PropTypes.bool,
  style: PropTypes.string.isRequired,
  setStyle: PropTypes.func.isRequired,
  onRegenerate: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

const labelStyle = {
  textAlign: 'center',
  marginBottom: vw(15),
  fontSize: vw(18),
  fontWeight: '500',
};
const imgBoxStyle = {
  position: 'relative',
  width: vw(300),
  height: vw(400),
  border: '1px solid #CCC',
  backgroundColor: '#eee',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};
const pendingBadgeStyle = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  padding: `${vw(10)} ${vw(18)}`,
  borderRadius: vw(999),
  backgroundColor: 'rgba(44, 151, 83, 0.92)',
  color: '#FFF',
  fontSize: vw(16),
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
};
const orangeBtnStyle = {
  width: vw(320),
  height: vw(60),
  backgroundColor: '#2C9753',
  color: '#FFF',
  border: 'none',
  borderRadius: vw(8),
  fontSize: vw(18),
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default ImageComparisonStep;
