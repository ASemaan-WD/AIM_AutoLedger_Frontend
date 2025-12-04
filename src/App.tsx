import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { JSX, useEffect, useState } from 'react';
import { Theme } from './providers/theme';
import { cx } from './utils/cx';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import FilesPage from './pages/FilesPage';
import InvoicesPage from './pages/InvoicesPage';
import Home2Page from './pages/Home2Page';
import UploadStatusDemoPage from './pages/UploadStatusDemoPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import { getToken, validateToken, logout } from './services/auth-service';
import { LoadingIndicator } from './components/application/loading-indicator/loading-indicator';
import './styles/theme.css';
import './styles/typography.css';

// Font variables - these are now loaded via CSS
const fontVariables = 'font-inter font-public-sans font-jetbrains-mono';

// Auth Wrapper Component
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      // If no token, we are done checking
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      // If token exists, validate it
      try {
        const isValid = await validateToken();
        if (!isValid) {
          logout(); // This clears token
          // If not valid, redirect to login
          if (location.pathname !== '/login') {
             navigate('/login');
          }
        } else {
          // If valid and on login page or root, redirect to home
          if (location.pathname === '/login' || location.pathname === '/') {
            navigate('/home');
          }
        }
      } catch (error) {
        console.error('Auth check failed', error);
        logout();
        if (location.pathname !== '/login') {
            navigate('/login');
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]); 

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-primary">
         <LoadingIndicator size="lg" label="Verifying session..." />
      </div>
    );
  }

  return (
    <div className={cx(fontVariables, 'bg-primary antialiased')}>
      <Theme>
        <Routes>
          {/* Public Route: Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Pricing page */}
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* App routes (with layout) - PROTECTED */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/home2" element={<Home2Page />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/upload-status-demo" element={<UploadStatusDemoPage />} />
          </Route>
          
          {/* Unknown routes -> Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Theme>
    </div>
  );
}

export default App;
