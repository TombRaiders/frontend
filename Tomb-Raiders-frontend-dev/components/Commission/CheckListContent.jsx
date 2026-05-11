import React from 'react';
import PropTypes from 'prop-types';

function CheckListContent({
  styles,
  items,
  loading,
  error,
  emptyMessage,
  totalPages,
  currentPage,
  visiblePageNumbers,
  onPageChange,
  getKey,
  getTitle,
  getStatus,
  getImageSrc,
  isDisabled,
  getCardActionStyle,
  onOpen,
  onDelete,
}) {
  if (loading) {
    return <div style={styles.noticeStyle}>의뢰 내역을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div style={styles.noticeStyle}>{error}</div>;
  }

  if (items.length === 0) {
    return <div style={styles.noticeStyle}>{emptyMessage}</div>;
  }

  const emptyCount = items.length < 4 ? 4 - (items.length % 4 || 4) : 0;
  const dummyKeys = ['dummy-1', 'dummy-2', 'dummy-3'].slice(0, emptyCount);

  return (
    <>
      <div style={styles.gridContainer}>
        {items.map((item) => {
          const title = getTitle(item);
          const status = getStatus(item);
          const imageSrc = getImageSrc(item);
          const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-';
          const disabled = isDisabled(item);

          return (
            <article key={getKey(item)} style={styles.cardStyle}>
              {onDelete ? (
                <button
                  type="button"
                  style={{ ...styles.deleteBtn, zIndex: 10 }}
                  onClick={(e) => onDelete(e, item)}
                  aria-label="삭제"
                >
                  ✕
                </button>
              ) : null}

              <button
                type="button"
                style={getCardActionStyle(item, disabled)}
                onClick={() => onOpen(item)}
                disabled={disabled}
                aria-label={`${title} 상세 보기`}
              >
                <div style={styles.imgWrapper}>
                  {imageSrc ? (
                    <img src={imageSrc} alt="의뢰 이미지" style={styles.cardImg} />
                  ) : (
                    <div style={styles.placeholderImg}>사진</div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{title}</h3>
                  <p style={styles.cardDate}>생성일 : {date}</p>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: status.bgColor,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </div>
                </div>
              </button>
            </article>
          );
        })}

        {dummyKeys.map((key) => (
          <article key={key} style={{ ...styles.cardStyle, cursor: 'default' }}>
            <div style={styles.cardActionBtn}>
              <div style={{ ...styles.imgWrapper, backgroundColor: '#FFF' }}>
                <div style={styles.placeholderImg}>사진</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav style={styles.paginationStyle} aria-label="의뢰 목록 페이지네이션">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={loading || currentPage <= 0}
            style={styles.getPaginationButtonStyle(loading || currentPage <= 0)}
          >
            이전
          </button>

          <div style={styles.pageNumberGroupStyle}>
            {visiblePageNumbers.map((pageNumber) => {
              const isActive = pageNumber === currentPage;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  disabled={loading || isActive}
                  aria-current={isActive ? 'page' : undefined}
                  style={styles.getPageNumberButtonStyle(isActive)}
                >
                  {pageNumber + 1}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={loading || currentPage >= totalPages - 1}
            style={styles.getPaginationButtonStyle(loading || currentPage >= totalPages - 1)}
          >
            다음
          </button>
        </nav>
      )}
    </>
  );
}

CheckListContent.propTypes = {
  styles: PropTypes.object.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  emptyMessage: PropTypes.string.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  visiblePageNumbers: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPageChange: PropTypes.func.isRequired,
  getKey: PropTypes.func.isRequired,
  getTitle: PropTypes.func.isRequired,
  getStatus: PropTypes.func.isRequired,
  getImageSrc: PropTypes.func.isRequired,
  isDisabled: PropTypes.func.isRequired,
  getCardActionStyle: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

export default CheckListContent;
