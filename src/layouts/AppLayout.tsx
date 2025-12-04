import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { HelpCircle, LogOut01 } from '@untitledui/icons';
import { NavItemButton } from '@/components/application/app-navigation/base-components/nav-item-button';
import { cx } from '@/utils/cx';
import { logout } from '@/services/auth-service';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isCurrentPath = (href: string) => {
    return location.pathname === href;
  };

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', href: '/home' },
    { id: 'files', label: 'Files', href: '/files' },
    { id: 'invoices', label: 'Invoices', href: '/invoices' },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className="flex flex-col h-screen bg-primary">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 border-b border-secondary bg-primary px-6 flex-shrink-0">
        <div className="flex items-center justify-between relative h-16">
          {/* Centered Navigation Items */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center h-full gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={cx(
                  'flex items-center h-full gap-2 text-md font-semibold px-1 rounded-none border-b-2 transition duration-100 ease-linear cursor-pointer',
                  isCurrentPath(item.href)
                    ? 'border-fg-brand-primary_alt text-brand-secondary'
                    : 'border-transparent text-quaternary hover:border-fg-brand-primary_alt hover:text-brand-secondary'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="ml-auto flex items-center gap-1">
            <NavItemButton
              size="md"
              icon={LogOut01}
              label="Sign out"
              onClick={handleLogout}
              tooltipPlacement="bottom"
            />
            <NavItemButton
              size="md"
              icon={HelpCircle}
              label="Help"
              href="#"
              tooltipPlacement="bottom"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
