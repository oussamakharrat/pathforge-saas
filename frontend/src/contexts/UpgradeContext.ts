'use client';

import { createContext, useContext } from "react";

export interface UpgradeContextType {
  requestUpgrade: (pageId: string, pageLabel: string) => void;
  dismissUpgrade: () => void;
}

export const UpgradeContext = createContext<UpgradeContextType | null>(null);

/**
 * Access the upgrade prompt system. Returns a no-op fallback if used
 * outside UpgradeProvider (handles HMR edge cases with React.lazy).
 */
export function useUpgrade(): UpgradeContextType {
  const ctx = useContext(UpgradeContext);
  if (!ctx) return { requestUpgrade: () => {}, dismissUpgrade: () => {} };
  return ctx;
}
