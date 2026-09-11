'use client';

import React, { useState } from 'react';
import { Building2, ChevronDown, Plus, Menu } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';

export interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenCreateOrgModal: () => void;
}

export function Navbar({ onOpenMobileSidebar, onOpenCreateOrgModal }: NavbarProps) {
  const { organizations, currentOrg, selectOrganization } = useOrganization();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-900"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Organization Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors shadow-xs"
          >
            <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="max-w-[140px] truncate">{currentOrg?.name || 'Select Organization'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Organizations
                </div>
                {organizations.map((org) => {
                  const isSelected = org.id === currentOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        selectOrganization(org.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-800/60'
                      }`}
                    >
                      <span className="truncate">{org.name}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </button>
                  );
                })}

                <div className="border-t border-zinc-800 my-1" />

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenCreateOrgModal();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Organization</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
