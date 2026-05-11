import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AlertProvider } from './components/Common/AlertProvider';
import './style.css';

// 리액트 애플리케이션의 시작점으로 루트 컴포넌트를 DOM에 렌더링함
const container = document.querySelector('#app');

if (container) {
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <AlertProvider>
        <App />
      </AlertProvider>
    </React.StrictMode>,
  );
} else {
  console.error("ID가 'app'인 요소를 찾을 수 없습니다.");
}
