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
  LogOut,
  Zap,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getHealthApi } from '@/lib/api';

export interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
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
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full select-none shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-bold text-lg text-zinc-100 tracking-tight block leading-none">
              Histeria
            </span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
              Email SaaS
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
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
              <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Health Status Indicator */}
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

      {/* User Footer */}
      <div className="p-4 border-t border-zinc-900 flex items-center justify-between bg-zinc-950">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name || 'User'}</p>
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
    </aside>
  );
}
