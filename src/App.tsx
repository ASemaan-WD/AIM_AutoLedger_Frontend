import { Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from './providers/theme';
import { cx } from './utils/cx';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import FilesPage from './pages/FilesPage';
import InvoicesPage from './pages/InvoicesPage';
import Home2Page from './pages/Home2Page';
import UploadStatusDemoPage from './pages/UploadStatusDemoPage';
import PricingPage from './pages/PricingPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/theme.css';
import './styles/typography.css';

// Font variables - these are now loaded via CSS
const fontVariables = 'font-inter font-public-sans font-jetbrains-mono';

function App() {
  return (
    <div className={cx(fontVariables, 'bg-primary antialiased')}>
      <Theme>
        <Routes>
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Pricing page (outside app layout) */}
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* App routes (with layout) */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/home2" element={<Home2Page />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/upload-status-demo" element={<UploadStatusDemoPage />} />
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Theme>
    </div>
  );
}

export default App;

