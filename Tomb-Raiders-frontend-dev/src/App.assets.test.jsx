import React from 'react';
import PropTypes from 'prop-types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import App from './App';
import * as authUtils from './utils/authUtils';

vi.mock('./utils/authUtils', () => ({
  getToken: vi.fn(),
  getUserRoleFromToken: vi.fn(),
  getLoginId: vi.fn(),
}));

vi.mock('./api/apiClient', () => ({
  get: vi.fn().mockResolvedValue({ data: { isSuccess: true, data: {} } }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  function MockBrowserRouter({ children }) {
    return (
      <actual.MemoryRouter initialEntries={[globalThis.location.pathname]}>
        {children}
      </actual.MemoryRouter>
    );
  }

  MockBrowserRouter.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return {
    ...actual,
    BrowserRouter: MockBrowserRouter,
  };
});

vi.mock('./pages/Asset/CheckAssetPage.jsx', () => ({
  default: () => <div>Asset route page</div>,
}));

describe('App asset route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authUtils.getToken.mockReturnValue('valid-token');
    authUtils.getUserRoleFromToken.mockReturnValue('USER');
  });

  it('renders the copied asset page at /asset', async () => {
    globalThis.history.pushState({}, 'Asset page', '/asset');

    render(<App />);

    expect(await screen.findByText('Asset route page')).toBeInTheDocument();
  });
});
