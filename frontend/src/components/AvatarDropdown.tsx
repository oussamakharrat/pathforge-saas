'use client';

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import {
  User,
  Settings,
  CreditCard,
  Bell as BellIcon,
  Palette,
  HelpCircle,
  LogOut,
  Sparkles,
  ChevronRight,
  Shield,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "../components/ui/sheet";
import { FLAME, CARBON } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { UserAvatar } from "./UserAvatar";

export function AvatarDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, plan, planLabel, user, profile } = useAuth();

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "User";
  const displayEmail = user?.email ?? "";
  const avatarUrl = profile?.avatarUrl || null;

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully. See you soon!");
  };

  type MenuItem = {
    icon: React.ElementType;
    label: string;
    description?: string;
    action: () => void;
    danger?: boolean;
    badge?: string;
  };

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Account",
      items: [
        { icon: User, label: "View Profile", description: "Manage your personal info", action: () => { navigate("/app/settings"); setOpen(false); } },
        { icon: Settings, label: "Account Settings", description: "Password, email & more", action: () => { navigate("/app/settings"); setOpen(false); } },
        { icon: CreditCard, label: "Subscription & Billing", description: "Plans, payments & invoices", badge: planLabel, action: () => { navigate("/pricing"); setOpen(false); } },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: BellIcon, label: "Notifications", description: "Manage alerts & reminders", action: () => { navigate("/app/settings"); setOpen(false); toast.info("Scroll to Notifications section"); } },
        { icon: Palette, label: "Appearance", description: "Theme & display options", action: () => { toast.info("Theme settings coming in v2"); setOpen(false); } },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", description: "Guides & FAQ", action: () => { toast.info("Opening help docs..."); setOpen(false); } },
        { icon: LogOut, label: "Sign Out", description: "Log out of your account", action: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <>
      {/* Avatar trigger */}
      <button onClick={() => setOpen(true)} className="cursor-pointer hover:opacity-80 transition-all ring-2 ring-transparent hover:ring-orange-300/60 active:scale-95 rounded-full">
        <UserAvatar src={avatarUrl} name={displayName} size="sm" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col bg-white">
          {/* ===== HEADER: Profile Card ===== */}
          <div className="relative flex-shrink-0 px-5 pt-10 pb-6" style={{ backgroundColor: CARBON }}>
            {/* Decorative gradient orb */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
              style={{ background: `radial-gradient(circle, ${FLAME}, transparent)` }} />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
              style={{ background: `radial-gradient(circle, #FBBF24, transparent)` }} />

            <div className="flex items-start gap-4 relative z-10">
              <UserAvatar src={avatarUrl} name={displayName} size="lg" className="shadow-lg" />
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-[16px] font-bold text-white truncate">{displayName}</p>
                <p className="text-[12px] text-white/50 truncate mt-0.5">{displayEmail}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase"
                    style={{ backgroundColor: "rgba(241,80,37,0.2)", color: FLAME }}>
                    <Shield className="w-2.5 h-2.5" />
                    {planLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== BODY: Scrollable menu items ===== */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {sections.map((section, si) => (
              <div key={si}>
                {si > 0 && <div className="h-px bg-border mx-2 my-2" />}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={item.action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group hover:bg-secondary/80 active:scale-[0.98] text-left">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          backgroundColor: item.danger ? "rgba(239,68,68,0.08)" : "rgba(25,25,25,0.05)",
                        }}>
                        <Icon className="w-[17px] h-[17px]"
                          style={{ color: item.danger ? "#EF4444" : "#6B6F6B" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold" style={{ color: item.danger ? "#EF4444" : CARBON }}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                              style={{ backgroundColor: "rgba(241,80,37,0.1)", color: FLAME }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ===== FOOTER: Quick upgrade prompt ===== */}
          {plan === "free" && (
            <div className="flex-shrink-0 border-t border-border p-4"
              style={{ backgroundColor: "rgba(251,191,36,0.04)" }}>
              <button onClick={() => { navigate("/pricing"); setOpen(false); }}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl font-semibold text-[13px] transition-all active:scale-[0.98]"
                style={{ backgroundColor: FLAME, color: "white" }}>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Unlock Premium Features
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ===== BOTTOM SAFE AREA ===== */}
          {plan !== "free" && (
            <div className="flex-shrink-0 border-t border-border px-5 py-3">
              <p className="text-[10px] text-center text-muted-foreground/60 font-medium">
                Career Growth AI · v1.0
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
