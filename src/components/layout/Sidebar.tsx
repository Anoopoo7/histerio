'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCode,
  Mail,
  Key,
  Server,
  CreditCard,
  LogOut,
  Zap,
  Activity,
  CheckCircle2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getHealthApi } from '@/lib/api';

export interface SidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ onCloseMobile, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'error' | 'loading'>('loading');

  useEffect(() => {
    getHealthApi()
      .then((res) => {
        if (res.status === 'ok') setHealthStatus('healthy');
        else setHealthStatus('error');
      })
      .catch(() => setHealthStatus('error'));
  }, []);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Templates', href: '/dashboard/templates', icon: FileCode },
    { label: 'Emails', href: '/dashboard/emails', icon: Mail },
    { label: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { label: 'SMTP', href: '/dashboard/smtp', icon: Server },
    { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full select-none shrink-0 transition-[width] duration-200 ease-in-out`}
    >
      {/* Brand Header */}
      {isCollapsed ? (
        <div className="py-3 px-2 border-b border-zinc-900 flex flex-col items-center gap-2.5">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            title="Histeria Dashboard"
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform shrink-0"
          >
            <Zap className="w-5 h-5 fill-current" />
          </Link>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="h-16 px-4 border-b border-zinc-900 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-lg text-zinc-100 tracking-tight block leading-none truncate">
                Histeria
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase block">
                Email SaaS
              </span>
            </div>
          </Link>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Main Navigation */}
      {isCollapsed ? (
        <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto flex flex-col items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  aria-label={item.label}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 ${
                    active
                      ? 'bg-zinc-800/90 text-zinc-100 shadow-xs border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-400'}`} />
                </Link>
                {/* Floating Tooltip */}
                <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-lg shadow-xl border border-zinc-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </div>
              </div>
            );
          })}

          {onToggleCollapse && (
            <div className="pt-2 relative group">
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
                className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-lg shadow-xl border border-zinc-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Expand sidebar
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-zinc-800/90 text-zinc-100 shadow-xs border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {onToggleCollapse && (
            <div className="pt-2 px-1">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Collapse menu</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Health Status Indicator */}
      {isCollapsed ? (
        <div className="mx-auto mb-4 relative group">
          <div className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center cursor-default">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                healthStatus === 'healthy'
                  ? 'bg-emerald-400 animate-pulse'
                  : healthStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
          </div>
          <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-lg shadow-xl border border-zinc-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            API System: {healthStatus === 'healthy' ? 'Online' : healthStatus === 'error' ? 'Offline' : 'Checking'}
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 mx-4 mb-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-300 font-medium">API System</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                healthStatus === 'healthy'
                  ? 'bg-emerald-400 animate-pulse'
                  : healthStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <span
              className={`font-semibold text-[11px] uppercase tracking-wide ${
                healthStatus === 'healthy'
                  ? 'text-emerald-400'
                  : healthStatus === 'error'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {healthStatus === 'healthy' ? 'Online' : healthStatus === 'error' ? 'Offline' : 'Checking'}
            </span>
          </div>
        </div>
      )}

      {/* User Footer */}
      {isCollapsed ? (
        <div className="py-3 px-2 border-t border-zinc-900 flex flex-col items-center gap-2 bg-zinc-950">
          <div className="relative group">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0 cursor-default">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-zinc-900 text-zinc-100 text-xs font-medium rounded-lg shadow-xl border border-zinc-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              <p className="font-semibold">{user?.name || 'User'}</p>
              <p className="text-[10px] text-zinc-400">{user?.email}</p>
            </div>
          </div>
          <div className="relative group">
            <button
              onClick={logout}
              aria-label="Log out"
              className="text-zinc-500 hover:text-rose-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-zinc-900 text-rose-300 text-xs font-medium rounded-lg shadow-xl border border-zinc-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Log out
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-zinc-900 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name || 'User'}</p>
                {user?.emailVerified && (
                  <span title="Email Verified" className="shrink-0 flex items-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="text-zinc-500 hover:text-rose-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
