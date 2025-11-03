/**
 * AppLayout - Main application shell
 * Left nav + Top bar + Main content area (no global search, with notifications)
 */

import React, { useState } from 'react';
import {
  Home,
  Target,
  Lightbulb,
  Boxes,
  FolderKanban,
  Settings as SettingsIcon,
  Bell,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent } from './ui/sheet';
import { cn } from './ui/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'optimize', label: 'Optimize', icon: Target },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'simulation', label: 'Simulation', icon: Boxes },
  { id: 'plans', label: 'Plans', icon: FolderKanban },
  { id: 'settings', label: 'Settings', icon: SettingsIcon }
];

const initialNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'Layout optimized',
    message: 'Eye-level placement improved by 12%',
    time: '5m ago',
    unread: true
  },
  {
    id: 2,
    type: 'info',
    title: 'New insights available',
    message: 'Seasonal trends detected for Q4',
    time: '1h ago',
    unread: true
  },
  {
    id: 3,
    type: 'warning',
    title: 'Low visibility alert',
    message: '3 products below 40% visibility',
    time: '2h ago',
    unread: false
  },
  {
    id: 4,
    type: 'success',
    title: 'Simulation complete',
    message: 'Layout A shows 18% improvement',
    time: '3h ago',
    unread: false
  }
];

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
    // Mark all as read when closing
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="flex h-screen bg-[#FAFBFC]">
      {/* Left Navigation Sidebar */}
      <aside className="w-64 bg-white border-r border-[rgba(33,38,63,0.12)]">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[rgba(33,38,63,0.12)]">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="appLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M 8 24 Q 8 8, 16 8 Q 24 8, 24 16 Q 24 24, 16 24"
                stroke="url(#appLogoGradient)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[18px] font-semibold text-[#21263F] tracking-tight">Pathwise</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200',
                  isActive
                    ? 'bg-[#F3F4F6] text-[#21263F] font-semibold'
                    : 'text-[#676F8E] hover:bg-[#FAFBFC] hover:text-[#21263F]'
                )}
              >
                <Icon size={20} />
                <span className="text-[15px]">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(33,38,63,0.12)] bg-white">
          <div className="text-[13px] text-[#676F8E] text-center">
            <div className="font-semibold text-[#21263F] mb-1">Pathwise</div>
            <div>Unveil the path behind every experience.</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - No search, just notifications and user menu */}
        <header className="h-16 bg-white border-b border-[rgba(33,38,63,0.12)] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-semibold text-[#21263F] capitalize">
              {currentPage}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(true)}
              className="relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#3D4468] text-white text-[13px]">
                      SK
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuItem>
                  <div>
                    <div className="font-medium">Sarah Kim</div>
                    <div className="text-[13px] text-[#676F8E]">sarah@pathwise.com</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[#EF4444]">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Notifications Panel */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent
          side="right"
          className="w-[360px] bg-white p-0 border-l border-[rgba(33,38,63,0.12)]"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[rgba(33,38,63,0.12)] flex items-center justify-between">
              <h3 className="text-[#21263F]">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationsClose}
              >
                <X size={20} />
              </Button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={48} className="mx-auto mb-3 text-[#676F8E]/30" />
                  <div className="text-[#676F8E]">You're all caught up.</div>
                </div>
              ) : (
                <>
                  {/* Today */}
                  {notifications.some(n => n.unread) && (
                    <div>
                      <div className="text-[13px] font-semibold text-[#676F8E] mb-2">Today</div>
                      {notifications
                        .filter(n => n.unread)
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[12px] p-4 mb-2 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                notification.type === 'success' && 'bg-[#22C55E]/10',
                                notification.type === 'info' && 'bg-[#3B82F6]/10',
                                notification.type === 'warning' && 'bg-[#F59E0B]/10'
                              )}>
                                {notification.type === 'success' && <CheckCircle2 size={16} className="text-[#22C55E]" />}
                                {notification.type === 'info' && <Bell size={16} className="text-[#3B82F6]" />}
                                {notification.type === 'warning' && <AlertCircle size={16} className="text-[#F59E0B]" />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-semibold text-[#21263F] mb-1">
                                  {notification.title}
                                </div>
                                <div className="text-[13px] text-[#676F8E] mb-2">
                                  {notification.message}
                                </div>
                                <div className="flex items-center gap-1 text-[12px] text-[#676F8E]">
                                  <Clock size={12} />
                                  {notification.time}
                                </div>
                              </div>

                              {notification.unread && (
                                <div className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0 mt-2" />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Earlier */}
                  {notifications.some(n => !n.unread) && (
                    <div>
                      <div className="text-[13px] font-semibold text-[#676F8E] mb-2 mt-4">Earlier</div>
                      {notifications
                        .filter(n => !n.unread)
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[12px] p-4 mb-2 opacity-60"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                notification.type === 'success' && 'bg-[#22C55E]/10',
                                notification.type === 'info' && 'bg-[#3B82F6]/10',
                                notification.type === 'warning' && 'bg-[#F59E0B]/10'
                              )}>
                                {notification.type === 'success' && <CheckCircle2 size={16} className="text-[#22C55E]" />}
                                {notification.type === 'info' && <Bell size={16} className="text-[#3B82F6]" />}
                                {notification.type === 'warning' && <AlertCircle size={16} className="text-[#F59E0B]" />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-semibold text-[#21263F] mb-1">
                                  {notification.title}
                                </div>
                                <div className="text-[13px] text-[#676F8E] mb-2">
                                  {notification.message}
                                </div>
                                <div className="flex items-center gap-1 text-[12px] text-[#676F8E]">
                                  <Clock size={12} />
                                  {notification.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[rgba(33,38,63,0.12)]">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleNotificationsClose}
              >
                Mark all as read
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
