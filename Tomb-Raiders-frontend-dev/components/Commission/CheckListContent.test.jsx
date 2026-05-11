import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import CheckListContent from './CheckListContent';
import { createCheckListStyles, getVw } from './checkListShared';

const styles = createCheckListStyles();

describe('CheckListContent', () => {
  it('renders cards with status, image, delete action, and filler slots', () => {
    const onOpen = vi.fn();
    const onDelete = vi.fn();

    render(
      <CheckListContent
        styles={styles}
        items={[
          {
            id: 1,
            title: '고양이 의뢰',
            imageUrl: 'cat.png',
            createdAt: '2026-05-07T12:30:00',
          },
        ]}
        loading={false}
        error={null}
        emptyMessage="비어 있음"
        totalPages={1}
        currentPage={0}
        visiblePageNumbers={[0]}
        onPageChange={vi.fn()}
        getKey={(item) => item.id}
        getTitle={(item) => item.title}
        getStatus={() => ({ label: '견적 완료', color: '#111', bgColor: '#eee' })}
        getImageSrc={(item) => item.imageUrl}
        isDisabled={() => false}
        getCardActionStyle={() => styles.cardActionBtn}
        onOpen={onOpen}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '고양이 의뢰 상세 보기' }));
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    expect(screen.getByRole('img', { name: '의뢰 이미지' })).toHaveAttribute('src', 'cat.png');
    expect(screen.getByText('견적 완료')).toBeInTheDocument();
    expect(screen.getAllByText('사진')).toHaveLength(3);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders pagination and blocks disabled cards', () => {
    const onOpen = vi.fn();
    const onPageChange = vi.fn();

    render(
      <CheckListContent
        styles={styles}
        items={[{ id: 1, title: '생성 중 의뢰' }]}
        loading={false}
        error={null}
        emptyMessage="비어 있음"
        totalPages={2}
        currentPage={0}
        visiblePageNumbers={[0, 1]}
        onPageChange={onPageChange}
        getKey={(item) => item.id}
        getTitle={(item) => item.title}
        getStatus={() => ({ label: '생성 중', color: '#111', bgColor: '#eee' })}
        getImageSrc={() => ''}
        isDisabled={() => true}
        getCardActionStyle={() => ({ ...styles.cardActionBtn, cursor: 'not-allowed' })}
        onOpen={onOpen}
        onDelete={vi.fn()}
      />,
    );

    const cardButton = screen.getByRole('button', { name: '생성 중 의뢰 상세 보기' });
    expect(cardButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onOpen).not.toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('exports responsive list styles through the shared vw helper', () => {
    expect(getVw(100)).toBe('clamp(65px, 5.208333333333334vw, 100px)');
  });
});
