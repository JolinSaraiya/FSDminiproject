import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AuthProvider from './context/AuthContext.jsx';
import SocketProvider from './context/SocketContext.jsx';
import { HotelProvider } from './context/HotelContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <CurrencyProvider>
            <HotelProvider>
              <App />
            </HotelProvider>
          </CurrencyProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
