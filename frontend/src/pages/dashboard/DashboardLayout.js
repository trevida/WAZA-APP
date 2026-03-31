import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, Bot, Users, MessageCircle, Megaphone, BarChart3, 
  CreditCard, Settings, LogOut, Menu, X, MessageCircle as Logo 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import useWorkspaceStore from '@/store/workspaceStore';
import LanguageToggle from '@/components/LanguageToggle';
import { useNotificationWS } from '@/hooks/useWebSocket';
import { useState } from 'react';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { unreadCount, clearUnread } = useNotificationWS();

  const navigation = [
    { name: t('dashboard.home'), href: '/dashboard', icon: Home },
    { name: t('dashboard.agents'), href: '/dashboard/agents', icon: Bot },
    { name: t('dashboard.contacts'), href: '/dashboard/contacts', icon: Users },
    { name: t('dashboard.conversations'), href: '/dashboard/conversations', icon: MessageCircle, badge: unreadCount },
    { name: t('dashboard.broadcasts'), href: '/dashboard/broadcasts', icon: Megaphone },
    { name: t('dashboard.analytics'), href: '/dashboard/analytics', icon: BarChart3 },
    { name: t('dashboard.billing'), href: '/dashboard/billing', icon: CreditCard },
    { name: t('dashboard.settings'), href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-surface border-r border-border flex-shrink-0 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Logo className="w-8 h-8 text-primary flex-shrink-0" />
            {sidebarOpen && <span className="text-xl font-heading font-black">WAZA</span>}
          </Link>
        </div>

        {/* Workspace info */}
        {sidebarOpen && currentWorkspace && (
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">Workspace</div>
            <div className="text-sm font-semibold truncate">{currentWorkspace.name}</div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            const isConversations = item.href.includes('conversations');
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => { if (isConversations) clearUnread(); }}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors relative ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
                data-testid={`nav-${item.name.toLowerCase()}-link`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
                {/* Unread badge */}
                {item.badge > 0 && (
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1"
                    data-testid="unread-badge"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          {sidebarOpen && <div className="mb-3 flex justify-center"><LanguageToggle /></div>}
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{user?.full_name}</div>
                <div className="text-xs text-text-muted truncate">{user?.plan}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          {sidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
