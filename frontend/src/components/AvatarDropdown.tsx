'use client';

import { useState } from 'react';
import { useNavigate } from '@/lib/router';
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
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '../components/ui/sheet';
import { FLAME, CARBON } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from './UserAvatar';
import { cn } from '@/lib/utils';

const MENU_STAGGER_MS = 45;
const MENU_STAGGER_BASE_MS = 120;

export function AvatarDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, plan, planLabel, user, profile } = useAuth();

  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'User';
  const displayEmail = user?.email ?? '';
  const avatarUrl = profile?.avatarUrl || null;

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully. See you soon!');
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
      title: 'Account',
      items: [
        { icon: User, label: 'View Profile', description: 'Manage your personal info', action: () => { navigate('/app/settings'); setOpen(false); } },
        { icon: Settings, label: 'Account Settings', description: 'Password, email & more', action: () => { navigate('/app/settings'); setOpen(false); } },
        { icon: CreditCard, label: 'Subscription & Billing', description: 'Plans, payments & invoices', badge: planLabel, action: () => { navigate('/pricing'); setOpen(false); } },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: BellIcon, label: 'Notifications', description: 'Manage alerts & reminders', action: () => { navigate('/app/settings'); setOpen(false); toast.info('Scroll to Notifications section'); } },
        { icon: Palette, label: 'Appearance', description: 'Theme & display options', action: () => { toast.info('Theme settings coming in v2'); setOpen(false); } },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', description: 'Guides & FAQ', action: () => { toast.info('Opening help docs...'); setOpen(false); } },
        { icon: LogOut, label: 'Sign Out', description: 'Log out of your account', action: handleLogout, danger: true },
      ],
    },
  ];

  let menuItemIndex = 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tr-interactive cursor-pointer rounded-full ring-2 ring-transparent hover:opacity-80 hover:ring-orange-300/60 active:scale-95"
      >
        <UserAvatar src={avatarUrl} name={displayName} size="sm" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          data-avatar-drawer
          hideCloseButton
          className="flex w-full flex-col gap-0 overflow-hidden bg-white p-0 sm:max-w-sm"
        >
          {/* Profile header */}
          <div
            className="avatar-drawer-header relative flex-shrink-0 px-5 pb-6 pt-12"
            style={{ backgroundColor: CARBON }}
          >
            <div
              className="pointer-events-none absolute -top-6 -right-6 h-32 w-32 rounded-full opacity-20 blur-2xl"
              style={{ background: `radial-gradient(circle, ${FLAME}, transparent)` }}
            />
            <div
              className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full opacity-10 blur-2xl"
              style={{ background: 'radial-gradient(circle, #FBBF24, transparent)' }}
            />

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="anim-enter-item tr-interactive absolute right-4 top-4 z-20 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              style={{ animationDelay: '100ms' }}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-10 flex items-start gap-4">
              <div className="anim-enter-item" style={{ animationDelay: '140ms' }}>
                <UserAvatar src={avatarUrl} name={displayName} size="lg" className="shadow-lg" />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p
                  className="anim-enter-item truncate text-[16px] font-bold text-white"
                  style={{ animationDelay: '170ms' }}
                >
                  {displayName}
                </p>
                <p
                  className="anim-enter-item mt-0.5 truncate text-[12px] text-white/50"
                  style={{ animationDelay: '200ms' }}
                >
                  {displayEmail}
                </p>
                <div className="anim-enter-item mt-2 flex items-center gap-1.5" style={{ animationDelay: '230ms' }}>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: 'rgba(241,80,37,0.2)', color: FLAME }}
                  >
                    <Shield className="h-2.5 w-2.5" />
                    {planLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
            {sections.map((section, si) => (
              <div key={section.title}>
                {si > 0 && (
                  <div
                    className="anim-fade mx-2 my-2 h-px bg-border"
                    style={{ animationDelay: `${MENU_STAGGER_BASE_MS + menuItemIndex * MENU_STAGGER_MS}ms` }}
                  />
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const delay = MENU_STAGGER_BASE_MS + menuItemIndex * MENU_STAGGER_MS;
                  menuItemIndex += 1;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      style={{ animationDelay: `${delay}ms` }}
                      className={cn(
                        'anim-enter-item group mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left',
                        'tr-interactive hover:bg-secondary/80 active:scale-[0.98]',
                      )}
                    >
                      <div
                        className="tr-color flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: item.danger ? 'rgba(239,68,68,0.08)' : 'rgba(25,25,25,0.05)',
                        }}
                      >
                        <Icon
                          className="h-[17px] w-[17px]"
                          style={{ color: item.danger ? '#EF4444' : '#6B6F6B' }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[13px] font-semibold"
                            style={{ color: item.danger ? '#EF4444' : CARBON }}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                              style={{ backgroundColor: 'rgba(241,80,37,0.1)', color: FLAME }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <ChevronRight className="tr-opacity h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground/70" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Upgrade CTA */}
          {plan === 'free' && (
            <div
              className="avatar-drawer-footer flex-shrink-0 border-t border-border p-4"
              style={{ backgroundColor: 'rgba(251,191,36,0.04)' }}
            >
              <button
                type="button"
                onClick={() => { navigate('/pricing'); setOpen(false); }}
                className="tr-interactive flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[13px] font-semibold active:scale-[0.98]"
                style={{ backgroundColor: FLAME, color: 'white' }}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Unlock Premium Features
                </span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {plan !== 'free' && (
            <div className="avatar-drawer-footer flex-shrink-0 border-t border-border px-5 py-3">
              <p className="text-center text-[10px] font-medium text-muted-foreground/60">
                Career Growth AI · v1.0
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
