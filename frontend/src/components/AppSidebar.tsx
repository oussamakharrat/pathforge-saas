'use client';

import { ChevronLeft, ChevronRight, Award, Settings, Lock, type LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "@/lib/router";
import { cn } from "../lib/utils";
import { FLAME, CARBON, NAV_ITEMS, NAV_GROUPS } from "../lib/constants";
import { BrandLogo } from "./BrandLogo";
import { useAuth } from "../contexts/AuthContext";
import { useUpgrade } from "../contexts/UpgradeContext";
import type { Page } from "../data/types";
import { requiredPlanMeta } from "../data/types";

export function AppSidebar({ expanded, setExpanded }: { expanded: boolean; setExpanded: (v: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccess } = useAuth();
  const { requestUpgrade } = useUpgrade();
  const currentPath = location.pathname.split("/").pop() || "dashboard";

  const goTo = (p: Page) => {
    if (p === "pricing") navigate("/pricing");
    else navigate(`/app/${p}`);
  };

  const renderNavItem = (item: { id: string; label: string; icon: LucideIcon }) => {
    const Icon = item.icon;
    const active = currentPath === item.id;
    const locked = !canAccess(item.id);
    const lockMeta = locked ? requiredPlanMeta(item.id) : null;
    return (
      <div key={item.id} className="relative group">
        <button onClick={() => locked ? requestUpgrade(item.id, item.label) : goTo(item.id as Page)}
          className="w-full h-8 rounded-xl flex items-center transition-all duration-150"
          style={{
            backgroundColor: active ? "rgba(241,80,37,0.18)" : undefined,
            color: active ? FLAME : locked ? "rgba(230,232,230,0.18)" : "rgba(230,232,230,0.4)",
            justifyContent: expanded ? "flex-start" : "center",
            padding: expanded ? "0 0.75rem" : "0",
          }}
          onMouseEnter={e => {
            if (locked) return;
            if (!active) { e.currentTarget.style.backgroundColor = "rgba(241,80,37,0.08)"; e.currentTarget.style.color = "rgba(241,80,37,0.85)"; }
          }}
          onMouseLeave={e => {
            if (locked) return;
            if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(230,232,230,0.4)"; }
          }}>
          <div className="relative">
            <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", locked && "opacity-40")} />
            {locked && lockMeta && (
              <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1" style={{ color: lockMeta.color }} />
            )}
          </div>
          {expanded && (
            <span className="ml-3 text-[12px] font-semibold whitespace-nowrap flex items-center gap-1.5">
              {item.label}
              {locked && lockMeta && (
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold"
                  style={{ color: lockMeta.color, backgroundColor: lockMeta.bg }}>
                  {lockMeta.label}
                </span>
              )}
            </span>
          )}
        </button>
        {/* Tooltip */}
        {!expanded && (
          <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-popover border border-border text-foreground text-[12px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              {locked && lockMeta ? `${item.label} · Requires ${lockMeta.label}` : item.label}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className="fixed top-0 left-0 h-full z-40 flex flex-col py-2 gap-0 transition-all duration-200 ease-in-out"
      style={{
        width: expanded ? 256 : 56,
        backgroundColor: CARBON,
        borderRight: `1px solid rgba(255,255,255,0.05)`
      }}
    >
      <div className={cn("flex items-center px-2 mb-3 flex-shrink-0", expanded ? "justify-between gap-2" : "justify-center")}>
        <div className="flex items-center justify-center flex-shrink-0">
          <BrandLogo light compact={!expanded} />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-8 h-8 rounded-lg hidden md:flex items-center justify-center transition-all hover:bg-white/5"
          style={{ color: "rgba(230,232,230,0.7)" }}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 flex flex-col w-full px-2 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map(group => {
          const groupItems = NAV_ITEMS.filter(i => i.group === group.key);
          if (groupItems.length === 0) return null;
          return (
              <div key={group.key} className="mb-1">
              {expanded && (
                  <div className="px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/20">
                  {group.label}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {groupItems.map(renderNavItem)}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="flex flex-col gap-0 w-full px-2 mt-0 border-t border-white/5 pt-2">
        {[{ id: "pricing", label: "Upgrade", icon: Award, highlight: true }, { id: "settings", label: "Settings", icon: Settings, highlight: false }].map(item => {
          const Icon = item.icon;
          const active = currentPath === item.id;
          const isUpgrade = item.highlight;
          return (
            <div key={item.id} className="relative group">
              <button onClick={() => goTo(item.id as Page)}
                className="w-full h-8 rounded-xl flex items-center transition-all duration-150"
                style={{
                  backgroundColor: isUpgrade && !active ? "rgba(251,191,36,0.12)" : active ? "rgba(241,80,37,0.18)" : undefined,
                  color: active ? FLAME : isUpgrade ? "#FBBF24" : "rgba(230,232,230,0.35)",
                  justifyContent: expanded ? "flex-start" : "center",
                  padding: expanded ? "0 0.75rem" : "0",
                  border: isUpgrade && !active ? "1px solid rgba(251,191,36,0.25)" : undefined,
                }}
                onMouseEnter={e => {
                  if (isUpgrade) { e.currentTarget.style.backgroundColor = "rgba(251,191,36,0.2)"; e.currentTarget.style.color = "#FCD34D"; }
                  else if (!active) { e.currentTarget.style.backgroundColor = "rgba(241,80,37,0.08)"; e.currentTarget.style.color = "rgba(241,80,37,0.85)"; }
                }}
                onMouseLeave={e => {
                  if (isUpgrade) { e.currentTarget.style.backgroundColor = "rgba(251,191,36,0.12)"; e.currentTarget.style.color = "#FBBF24"; }
                  else if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(230,232,230,0.35)"; }
                }}>
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {expanded && <span className="ml-3 text-[12px] font-semibold whitespace-nowrap">{item.label}</span>}
              </button>
              {!expanded && (
                <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-popover border border-border text-foreground text-[12px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
