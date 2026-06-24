'use client';

import { Lock } from "lucide-react";
import { useNavigate, useLocation } from "@/lib/router";
import { cn } from "../lib/utils";
import { FLAME, NAV_ITEMS } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { requiredPlanMeta, type Page } from "../data/types";
import { useUpgrade } from "../contexts/UpgradeContext";

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccess } = useAuth();
  const { requestUpgrade } = useUpgrade();
  const currentPath = location.pathname.split("/").pop() || "dashboard";

  const goTo = (p: Page) => {
    const navItem = NAV_ITEMS.find((item) => item.id === p);
    if (!canAccess(p)) {
      requestUpgrade(p, navItem?.label ?? p);
      return;
    }
    navigate(`/app/${p}`);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border bg-white pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex">
        {NAV_ITEMS.slice(0, 5).map(item => {
          const Icon = item.icon;
          const active = currentPath === item.id;
          const locked = !canAccess(item.id);
          const lockMeta = locked ? requiredPlanMeta(item.id) : null;
          return (
            <button key={item.id} onClick={() => goTo(item.id as Page)}
              className="flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-black transition-colors"
              style={{ color: active ? FLAME : locked ? "#D1D5DB" : "#9CA3AF" }}>
              <div className="relative">
                <Icon className={cn("w-5 h-5", locked && "opacity-40")} />
                {locked && lockMeta && (
                  <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1" style={{ color: lockMeta.color }} />
                )}
              </div>
              {locked && lockMeta ? (
                <span className="text-[8px] uppercase tracking-wider font-bold" style={{ color: lockMeta.color }}>
                  {lockMeta.label}
                </span>
              ) : (
                item.label.split(" ")[0]
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
