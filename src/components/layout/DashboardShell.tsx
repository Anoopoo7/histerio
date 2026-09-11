'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { LoadingSpinner, Button } from '@/components/ui';
import { Building2, Plus } from 'lucide-react';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { needsOrganization, isLoading: orgLoading } = useOrganization();
  const router = useRouter();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <LoadingSpinner label="Loading workspace..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full">
            <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCreateOrgModal={() => setIsCreateOrgModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {needsOrganization ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-3xl max-w-lg mx-auto">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4">
                <Building2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Welcome to Histeria</h2>
              <p className="text-xs text-zinc-400 mt-2 mb-6 max-w-sm leading-relaxed">
                You don&apos;t have an active organization yet. Create an organization to start managing email templates, API keys, and sending logs.
              </p>
              <Button
                onClick={() => setIsCreateOrgModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                size="lg"
              >
                Create First Organization
              </Button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <CreateOrganizationModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
      />
    </div>
  );
}
