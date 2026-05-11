/** @vitest-environment jsdom */
import { describe, test, expect, vi, afterEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import WriteView from './WriteView';

vi.mock('../../utils/style', () => ({
  vw: (val) => `${val}px`,
}));

afterEach(cleanup);

function WriteViewWrapper() {
  const [newPost, setNewPost] = useState({
    boardId: null,
    title: '',
    content: '',
    type: 'FREE_BOARD',
    images: [],
  });

  return <WriteView newPost={newPost} setNewPost={setNewPost} />;
}

describe('WriteView', () => {
  test('제목 입력 값이 상태에 반영된다', () => {
    render(<WriteViewWrapper />);

    const titleInput = screen.getByPlaceholderText('제목을 입력해 주세요');
    fireEvent.change(titleInput, { target: { value: '테스트 제목' } });

    expect(titleInput.value).toBe('테스트 제목');
  });

  test('게시판 선택 값이 API enum 값으로 변경된다', () => {
    render(<WriteViewWrapper />);

    const select = screen.getByLabelText('게시판 선택');
    fireEvent.change(select, { target: { value: 'BRAGGING_BOARD' } });

    expect(select.value).toBe('BRAGGING_BOARD');
  });
});
