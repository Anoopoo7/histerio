'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Organization } from '@/types';
import { getOrganizationsApi, createOrganizationApi, getStoredOrgId, setStoredOrgId } from '@/lib/api';
import { useAuth } from './AuthProvider';

interface OrganizationContextValue {
  organizations: Organization[];
  currentOrg: Organization | null;
  isLoading: boolean;
  needsOrganization: boolean;
  selectOrganization: (orgId: string) => void;
  fetchOrganizations: () => Promise<void>;
  createOrganization: (name: string) => Promise<Organization>;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectOrganization = useCallback((orgId: string) => {
    setStoredOrgId(orgId);
    setOrganizations((prev) => {
      const match = prev.find((o) => o.id === orgId);
      if (match) {
        setCurrentOrg(match);
      }
      return prev;
    });
  }, []);

  const fetchOrganizations = useCallback(async () => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setCurrentOrg(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const orgs = await getOrganizationsApi();
      setOrganizations(orgs);

      if (orgs.length > 0) {
        const storedId = getStoredOrgId();
        const existing = orgs.find((o) => o.id === storedId);

        if (existing) {
          setCurrentOrg(existing);
        } else {
          setCurrentOrg(orgs[0]);
          setStoredOrgId(orgs[0].id);
        }
      } else {
        setCurrentOrg(null);
        setStoredOrgId(null);
      }
    } catch {
      // Failed to load organizations
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      getOrganizationsApi().then((orgs) => {
        if (!isMounted) return;
        setOrganizations(orgs);
        if (orgs.length > 0) {
          const storedId = getStoredOrgId();
          const existing = orgs.find((o) => o.id === storedId);
          if (existing) {
            setCurrentOrg(existing);
          } else {
            setCurrentOrg(orgs[0]);
            setStoredOrgId(orgs[0].id);
          }
        } else {
          setCurrentOrg(null);
          setStoredOrgId(null);
        }
        setIsLoading(false);
      }).catch(() => {
        if (isMounted) setIsLoading(false);
      });
    } else {
      Promise.resolve().then(() => {
        if (isMounted) setIsLoading(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const createOrganization = async (name: string): Promise<Organization> => {
    const newOrg = await createOrganizationApi({ name });
    setOrganizations((prev) => [...prev, newOrg]);
    setCurrentOrg(newOrg);
    setStoredOrgId(newOrg.id);
    return newOrg;
  };

  const needsOrganization = isAuthenticated && !isLoading && organizations.length === 0;

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        isLoading,
        needsOrganization,
        selectOrganization,
        fetchOrganizations,
        createOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
