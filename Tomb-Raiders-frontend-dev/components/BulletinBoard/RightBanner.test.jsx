/**
 * @vitest-environment jsdom
 */
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';
import RightBanner from './RightBanner';

describe('Static Components', () => {
  test('RightBanner가 오류 없이 렌더링된다', () => {
    render(<RightBanner />);
  });

  test('SearchBar가 렌더링되고 input 요소를 포함한다', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('검색');
    expect(input).toBeInTheDocument();
  });
});
