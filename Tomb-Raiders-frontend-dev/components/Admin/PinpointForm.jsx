import React from 'react';
import PropTypes from 'prop-types';
import { vw } from '../../utils/style';

const MAX_PINPOINT_COUNT = 8;

function PinpointForm({
  boardIds,
  setBoardIds,
  mainBoards,
  isMainBoardsLoading,
  mainBoardsError,
  onRefreshMainBoards,
  onAddBoardId,
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const handleBoardIdChange = (index) => (event) => {
    const nextValue = event.target.value.replace(/\D/g, '');
    setBoardIds((prev) =>
      prev.map((boardId, boardIndex) => (boardIndex === index ? nextValue : boardId)),
    );
  };

  const handleAddRow = () => {
    if (boardIds.length >= MAX_PINPOINT_COUNT) return;
    setBoardIds((prev) => [...prev, '']);
  };

  const handleRemoveRow = (index) => {
    setBoardIds((prev) => {
      if (prev.length === 1) return [''];
      return prev.filter((_, boardIndex) => boardIndex !== index);
    });
  };

  const handleMoveRow = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= boardIds.length) return;

    setBoardIds((prev) => {
      const nextBoardIds = [...prev];
      [nextBoardIds[index], nextBoardIds[nextIndex]] = [
        nextBoardIds[nextIndex],
        nextBoardIds[index],
      ];
      return nextBoardIds;
    });
  };

  return (
    <section
      className="w-full bg-white border border-[#EEE] shadow-sm mb-[3vw]"
      style={{ borderRadius: vw(10), padding: vw(24) }}
    >
      <div className="flex justify-between items-start" style={{ marginBottom: vw(24) }}>
        <div>
          <h2 className="font-bold text-[#1A1A1A] m-0" style={{ fontSize: vw(18) }}>
            pinpoint CRUD 관리
          </h2>
          <p className="text-[#777] m-0" style={{ fontSize: vw(13), marginTop: vw(8) }}>
            현재 설정을 불러온 뒤 게시글 ID를 추가, 수정, 삭제하고 순서를 저장합니다.
          </p>
        </div>
        <span
          className="bg-[#EAF6EF] text-[#2C9753] font-bold"
          style={{ fontSize: vw(12), padding: `${vw(6)} ${vw(12)}`, borderRadius: vw(4) }}
        >
          {boardIds.length}/{MAX_PINPOINT_COUNT}
        </span>
      </div>

      <div className="grid grid-cols-4" style={{ gap: vw(10), marginBottom: vw(20) }}>
        {['조회', '추가', '수정', '삭제'].map((label) => (
          <div
            key={label}
            className="bg-[#F7FBF8] border border-[#DDEFE3] text-[#2C9753] font-bold text-center"
            style={{ fontSize: vw(13), padding: `${vw(10)} ${vw(8)}`, borderRadius: vw(4) }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center" style={{ marginBottom: vw(12) }}>
        <h3 className="font-bold text-[#1A1A1A] m-0" style={{ fontSize: vw(15) }}>
          편집 목록
        </h3>
        <button
          type="button"
          onClick={onRefreshMainBoards}
          disabled={isMainBoardsLoading || isSubmitting}
          className="bg-white text-[#2C9753] font-bold cursor-pointer border border-[#2C9753] hover:bg-[#F1FAF4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: vw(12), padding: `${vw(7)} ${vw(12)}`, borderRadius: vw(4) }}
        >
          현재 설정 불러오기
        </button>
      </div>

      <div className="flex flex-col" style={{ gap: vw(12) }}>
        {boardIds.map((boardId, index) => (
          <div
            key={`pinpoint-${index}`}
            className="flex items-center bg-[#FAFAFA] border border-[#EEE]"
            style={{ gap: vw(12), padding: vw(14), borderRadius: vw(6) }}
          >
            <span
              className="bg-[#2C9753] text-white font-bold text-center shrink-0"
              style={{
                width: vw(28),
                height: vw(28),
                lineHeight: vw(28),
                borderRadius: vw(4),
                fontSize: vw(13),
              }}
            >
              {index + 1}
            </span>
            <label
              className="flex items-center flex-1 font-bold text-[#333]"
              style={{ gap: vw(10), fontSize: vw(14) }}
            >
              게시글 ID
              <input
                type="text"
                inputMode="numeric"
                value={boardId}
                onChange={handleBoardIdChange(index)}
                placeholder="예: 3"
                className="border border-[#DDD] bg-white outline-none transition-colors focus:border-[#2C9753] font-normal flex-1"
                style={{ padding: vw(10), fontSize: vw(14), borderRadius: vw(4) }}
              />
            </label>
            <div className="flex items-center" style={{ gap: vw(6) }}>
              <button
                type="button"
                aria-label={`${index + 1}번째 pinpoint 위로 이동`}
                onClick={() => handleMoveRow(index, -1)}
                disabled={index === 0 || isSubmitting}
                className="bg-white text-[#555] font-bold border border-[#DDD] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ width: vw(34), height: vw(34), borderRadius: vw(4), fontSize: vw(14) }}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`${index + 1}번째 pinpoint 아래로 이동`}
                onClick={() => handleMoveRow(index, 1)}
                disabled={index === boardIds.length - 1 || isSubmitting}
                className="bg-white text-[#555] font-bold border border-[#DDD] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ width: vw(34), height: vw(34), borderRadius: vw(4), fontSize: vw(14) }}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={`${index + 1}번째 pinpoint 삭제`}
                onClick={() => handleRemoveRow(index)}
                disabled={isSubmitting}
                className="bg-white text-[#D9534F] font-bold border border-[#F1C5C3] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ width: vw(34), height: vw(34), borderRadius: vw(4), fontSize: vw(14) }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddRow}
        disabled={boardIds.length >= MAX_PINPOINT_COUNT || isSubmitting}
        className="bg-white text-[#2C9753] font-bold cursor-pointer border border-[#2C9753] hover:bg-[#F1FAF4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          marginTop: vw(16),
          fontSize: vw(14),
          padding: `${vw(9)} ${vw(18)}`,
          borderRadius: vw(4),
        }}
      >
        + 게시글 추가
      </button>

      <div
        className="border border-[#EEE] bg-[#FAFAFA]"
        style={{ marginTop: vw(24), padding: vw(18), borderRadius: vw(6) }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: vw(14) }}>
          <div>
            <h3 className="font-bold text-[#1A1A1A] m-0" style={{ fontSize: vw(15) }}>
              조회된 메인 노출 목록
            </h3>
            <p className="text-[#777] m-0" style={{ fontSize: vw(12), marginTop: vw(6) }}>
              현재 메인 화면 API가 반환하는 최대 {MAX_PINPOINT_COUNT}개의 게시글입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshMainBoards}
            disabled={isMainBoardsLoading}
            className="bg-white text-[#2C9753] font-bold cursor-pointer border border-[#2C9753] hover:bg-[#F1FAF4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: vw(12), padding: `${vw(7)} ${vw(12)}`, borderRadius: vw(4) }}
          >
            새로고침
          </button>
        </div>

        {isMainBoardsLoading && (
          <div className="text-[#777]" style={{ fontSize: vw(13) }}>
            불러오는 중...
          </div>
        )}

        {!isMainBoardsLoading && mainBoardsError && (
          <div className="text-[#D9534F]" style={{ fontSize: vw(13) }}>
            {mainBoardsError}
          </div>
        )}

        {!isMainBoardsLoading && !mainBoardsError && mainBoards.length === 0 && (
          <div className="text-[#777]" style={{ fontSize: vw(13) }}>
            메인 노출 게시글이 없습니다.
          </div>
        )}

        {!isMainBoardsLoading && !mainBoardsError && mainBoards.length > 0 && (
          <div className="flex flex-col" style={{ gap: vw(10) }}>
            {mainBoards.map((board, index) => (
              <div
                key={board.boardId}
                className="bg-white border border-[#EEE] flex items-center"
                style={{ gap: vw(12), padding: vw(12), borderRadius: vw(6) }}
              >
                <span
                  className="text-center font-bold text-[#2C9753] shrink-0"
                  style={{ width: vw(24), fontSize: vw(13) }}
                >
                  {index + 1}
                </span>
                <div
                  className="bg-[#EDEDED] shrink-0 overflow-hidden"
                  style={{ width: vw(52), height: vw(52), borderRadius: vw(4) }}
                >
                  {board.imageUrl && (
                    <img
                      src={board.imageUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
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
                    {board.title}
                  </div>
                  <div className="text-[#777]" style={{ fontSize: vw(12), marginTop: vw(4) }}>
                    ID {board.boardId} · {board.authorNickname || '작성자 없음'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAddBoardId(board.boardId)}
                  disabled={
                    isSubmitting ||
                    boardIds.includes(String(board.boardId)) ||
                    boardIds.length >= MAX_PINPOINT_COUNT
                  }
                  className="bg-white text-[#2C9753] font-bold cursor-pointer border border-[#2C9753] hover:bg-[#F1FAF4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontSize: vw(12), padding: `${vw(7)} ${vw(12)}`, borderRadius: vw(4) }}
                >
                  추가
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center items-center" style={{ gap: vw(16), marginTop: vw(32) }}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-[#2C9753] text-white font-bold cursor-pointer border-none shadow-md hover:bg-[#257F46] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ fontSize: vw(15), padding: `${vw(11)} ${vw(46)}`, borderRadius: vw(4) }}
        >
          {isSubmitting ? '저장 중...' : 'pinpoint 저장'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-white text-[#555] font-bold cursor-pointer border border-[#DDD] shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ fontSize: vw(15), padding: `${vw(11)} ${vw(46)}`, borderRadius: vw(4) }}
        >
          취소
        </button>
      </div>
    </section>
  );
}

PinpointForm.propTypes = {
  boardIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  setBoardIds: PropTypes.func.isRequired,
  mainBoards: PropTypes.arrayOf(
    PropTypes.shape({
      imageUrl: PropTypes.string,
      title: PropTypes.string.isRequired,
      authorNickname: PropTypes.string,
      authorProfileImageUrl: PropTypes.string,
      boardId: PropTypes.number.isRequired,
    }),
  ).isRequired,
  isMainBoardsLoading: PropTypes.bool.isRequired,
  mainBoardsError: PropTypes.string.isRequired,
  onRefreshMainBoards: PropTypes.func.isRequired,
  onAddBoardId: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default PinpointForm;
