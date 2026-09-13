'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, ShieldAlert, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { getAllPolicyMetadata, getCompanyLegalConfig, checkLegalPlaceholders } from '@/lib/legal';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const policies = getAllPolicyMetadata();
  const company = getCompanyLegalConfig();
  const [placeholders] = useState<string[]>(() => checkLegalPlaceholders());


  const activeDocType = pathname.replace('/legal/', '').split('/')[0] || 'terms';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-base text-zinc-100 tracking-tight">Histeria</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Legal & Compliance Center
          </span>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 font-medium px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </header>

      {/* Development Placeholder Warning Banner */}
      {process.env.NODE_ENV === 'development' && placeholders.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-8 py-2.5 flex items-center gap-2 text-xs text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">
            Development Notice: Legal configuration contains {placeholders.length} unreplaced placeholder(s) (e.g. {company.legalName}). Review content/legal/company.json before commercial production deployment.
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block space-y-6">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Policy Index
            </h3>
            <p className="text-[11px] text-zinc-500">Official versioned agreements</p>
          </div>

          <nav className="space-y-1">
            {policies.map((p) => {
              const href = `/legal/${p.documentType}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={p.documentType}
                  href={href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="truncate">{p.title}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{p.version}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 space-y-2 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Legal Review Notice
            </div>
            <p className="leading-relaxed">
              These documents are professionally structured drafts. Consult qualified legal counsel before commercial deployment.
            </p>
          </div>
        </aside>

        {/* Mobile Dropdown Selector */}
        <div className="md:hidden w-full space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Select Legal Document:
          </label>
          <select
            value={activeDocType}
            onChange={(e) => router.push(`/legal/${e.target.value}`)}
            className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-100 focus:outline-none focus:border-indigo-500"
          >
            {policies.map((p) => (
              <option key={p.documentType} value={p.documentType}>
                {p.title} (v{p.version})
              </option>
            ))}
          </select>
        </div>

        {/* Legal Page Main Document Content */}
        <main className="flex-1 min-w-0 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 sm:p-10 shadow-xl select-text">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 px-4 text-center text-xs text-zinc-500 space-y-2">
        <p>© {new Date().getFullYear()} {company.brandName}. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
          {policies.map((p) => (
            <Link
              key={p.documentType}
              href={`/legal/${p.documentType}`}
              className="hover:text-zinc-300 transition-colors"
            >
              {p.title}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
