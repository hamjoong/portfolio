/**
 * @file React 애플리케이션의 메인 진입점입니다.
 * @author Your Name
 * @see {@link https://reactjs.org/docs/strict-mode.html|StrictMode}
 * @see {@link https://reactjs.org/docs/react-dom-client.html|createRoot}
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
