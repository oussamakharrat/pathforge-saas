'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "@/lib/router";
import { toast } from "sonner";
import { User, Mail, Briefcase, Globe, Edit3, Check, Award, ExternalLink, X, Copy, Lock } from "lucide-react";
import { FLAME, CARBON, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Field } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { api } from "@/lib/api";
import { useCareerData } from "../contexts/CareerDataContext";
import { prepareAvatarImage } from "../lib/avatar-image";
import { UserAvatar } from "../components/UserAvatar";
import type { Plan, UserProfile } from "../data/types";

const PLAN_DETAILS: Record<Plan, { tagline: string; aiLimit: number; resumeLimit: number; jobLimit: number }> = {
  free: { tagline: "5 AI messages/month", aiLimit: 5, resumeLimit: 1, jobLimit: 10 },
  pro: { tagline: "Unlimited AI coaching", aiLimit: 999, resumeLimit: 999, jobLimit: 999 },
  premium: { tagline: "Full career accelerator", aiLimit: 999, resumeLimit: 999, jobLimit: 999 },
};

const PLAN_STYLE: Record<Plan, { bg: string; border: string; badgeBg: string; badgeColor: string; accent: string }> = {
  free: {
    bg: "rgba(107,114,128,0.05)",
    border: "rgba(107,114,128,0.22)",
    badgeBg: "rgba(107,114,128,0.14)",
    badgeColor: "#4B5563",
    accent: "#6B7280",
  },
  pro: {
    bg: "rgba(241,80,37,0.06)",
    border: "rgba(241,80,37,0.28)",
    badgeBg: "rgba(241,80,37,0.14)",
    badgeColor: FLAME,
    accent: FLAME,
  },
  premium: {
    bg: "rgba(139,92,246,0.07)",
    border: "rgba(139,92,246,0.3)",
    badgeBg: "rgba(139,92,246,0.16)",
    badgeColor: "#6D28D9",
    accent: "#7C3AED",
  },
};

const EXPERIENCE_OPTIONS: { value: UserProfile["experienceLevel"]; label: string }[] = [
  { value: "0-1", label: "0–1 years" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10+", label: "10+ years" },
];

function computeProfileCompletion(
  name: string,
  email: string,
  role: string,
  location: string,
  targetRole: string,
): number {
  const fields = [name, email, role, location, targetRole];
  const filled = fields.filter((value) => value.trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

function formatMemberSince(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout, user, profile, plan, planLabel, updateProfile, cancelPlan, changePassword, isLoading } = useAuth();
  const { purchasedServices, outcomes, careerScore, skills } = useCareerData();
  const hasLinkedIn = purchasedServices.includes("LinkedIn Optimization");

  const [notif, setNotif] = useState(true);
  const [insights, setInsights] = useState(true);
  const [weekly, setWeekly] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<UserProfile["experienceLevel"]>("1-3");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "billing" | "danger">("profile");

  useEffect(() => {
    queueMicrotask(() => {
      setName(user?.name ?? profile?.name ?? "");
      setRole(profile?.currentRole ?? "");
      setTargetRole(profile?.targetRole ?? "");
      setExperienceLevel(profile?.experienceLevel ?? "1-3");
      setBio(profile?.bio ?? "");
      setLocation(profile?.location ?? "");
      setAvatarUrl(profile?.avatarUrl ?? "");
      setNotif(profile?.notifyPush !== false);
      setInsights(profile?.notifyInsights !== false);
      setWeekly(profile?.notifyWeekly === true);
    });
  }, [user, profile]);

  const saveNotificationPref = async (
    key: "notifyPush" | "notifyInsights" | "notifyWeekly",
    value: boolean,
    label: string,
  ) => {
    try {
      await updateProfile({ [key]: value });
      toast.success(`${label} ${value ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to save notification preference");
    }
  };

  const email = user?.email ?? profile?.email ?? "";
  const memberSince = user?.createdAt ? formatMemberSince(user.createdAt) : "Recently";
  const profileCompletion = computeProfileCompletion(
    name,
    email,
    role,
    location,
    targetRole,
  );

  const topSkills = useMemo(
    () => [...skills].sort((a, b) => b.pct - a.pct).slice(0, 10),
    [skills],
  );

  const linkedInHeadline = useMemo(() => {
    const title = role || profile?.targetRole || "Professional";
    const skillNames = topSkills.slice(0, 3).map((s) => s.name);
    if (skillNames.length === 0) return title;
    return `${title} | ${skillNames.join(", ")}`;
  }, [role, profile?.targetRole, topSkills]);

  const planInfo = PLAN_DETAILS[plan];

  const confirmCancelPlan = () => {
    toast(`Cancel your ${planLabel} plan?`, {
      description: 'You will lose access to premium features and return to the Free plan immediately.',
      action: {
        label: 'Yes, cancel plan',
        onClick: () => {
          void (async () => {
            setCancelling(true);
            try {
              await cancelPlan();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Failed to cancel plan');
            } finally {
              setCancelling(false);
            }
          })();
        },
      },
    });
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        currentRole: role.trim(),
        targetRole: targetRole.trim(),
        experienceLevel,
        bio: bio.trim(),
        location: location.trim(),
      });
      toast.success("Settings saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const dataUrl = await prepareAvatarImage(file);
      await updateProfile({ avatarUrl: dataUrl });
      setAvatarUrl(dataUrl);
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Enter your current and new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const removeAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await updateProfile({ avatarUrl: "" });
      setAvatarUrl("");
      toast.success("Profile photo removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
    <button onClick={() => set(!on)} className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0" style={{ backgroundColor: on ? FLAME : DUST }}>
      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );

  const tabs = [
    { id: "profile" as const, label: "Profile" },
    { id: "notifications" as const, label: "Notifications" },
    { id: "billing" as const, label: "Billing" },
    { id: "danger" as const, label: "Danger Zone" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl space-y-5">
        <PageHeader title="Settings" subtitle="Loading your profile..." />
        <Card className="p-8 animate-pulse" hover={false}>
          <div className="h-24 w-24 rounded-3xl bg-secondary mb-4" />
          <div className="h-8 w-64 bg-secondary rounded mb-2" />
          <div className="h-4 w-40 bg-secondary rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-5">
      <PageHeader title="Settings" subtitle="Manage your account, notifications, and billing preferences." />

      <div className="rounded-2xl border border-border bg-white p-1 shadow-sm">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="rounded-xl px-2 sm:px-3 py-2 text-[11px] sm:text-[12px] font-semibold transition-all whitespace-nowrap"
              style={{ backgroundColor: activeTab === tab.id ? "white" : "transparent", color: activeTab === tab.id ? CARBON : "#6B6F6B", boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "profile" && (
        <Card className="overflow-hidden p-0" hover={false}>
          <div className="flex flex-col gap-6 border-b border-border p-6 sm:p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative shrink-0">
                <UserAvatar
                  src={avatarUrl}
                  name={name || email}
                  size="2xl"
                  className={uploadingAvatar ? "opacity-60" : undefined}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white shadow-sm disabled:opacity-50"
                  aria-label="Change profile photo"
                >
                  <Edit3 className="h-4 w-4" style={{ color: CARBON }} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => void handleAvatarChange(e)}
                />
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: CARBON }}>
                  {name || "Your Profile"}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {planLabel} Plan · Member since {memberSince}
                  {user?.streakDays ? ` · ${user.streakDays}-day streak` : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="text-[13px] font-semibold hover:underline disabled:opacity-50"
                    style={{ color: FLAME }}
                  >
                    {uploadingAvatar ? "Uploading..." : "Change photo"}
                  </button>
                  {avatarUrl && (
                    <>
                      <span className="text-[13px] text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={() => void removeAvatar()}
                        disabled={uploadingAvatar}
                        className="text-[13px] font-semibold text-muted-foreground hover:text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <span className="inline-flex w-fit items-center self-center rounded-full bg-[#FFF7F1] px-3.5 py-1.5 text-xs font-semibold sm:self-auto" style={{ color: FLAME }}>
              Profile complete · {profileCompletion}%
            </span>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Full Name" value={name} onChange={setName} Left={User} />
            <Field label="Email" type="email" value={email} onChange={() => undefined} Left={Mail} readOnly />
            <Field label="Current Role" value={role} onChange={setRole} Left={Briefcase} placeholder="e.g. Full-Stack Engineer" />
            <Field label="Target Role" value={targetRole} onChange={setTargetRole} Left={Briefcase} placeholder="e.g. Senior Engineer" />
            <Field label="Location" value={location} onChange={setLocation} Left={Globe} placeholder="City, Country" />
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as UserProfile["experienceLevel"])}
                className="tr-input h-11 w-full rounded-xl border border-border bg-input-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[12px] font-semibold text-muted-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us about your career goals and background..."
                className="tr-input w-full rounded-xl border border-border bg-input-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="border-t border-border px-5 py-5">
            <p className="mb-3 text-[13px] font-black" style={{ color: CARBON }}>Change Password</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} Left={Lock} />
              <Field label="New Password" type="password" value={newPassword} onChange={setNewPassword} Left={Lock} />
              <Field label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} Left={Lock} className="sm:col-span-2" />
            </div>
            <div className="mt-4 flex justify-end">
              <Btn size="sm" onClick={() => void handlePasswordChange()} disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update Password"}
              </Btn>
            </div>
          </div>
          <div className="flex justify-end border-t border-border px-5 py-4">
            <Btn size="sm" onClick={() => void save()} disabled={saving}>{saving ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving...</> : <><Check className="h-3.5 w-3.5" /> Save Changes</>}</Btn>
          </div>
          {hasLinkedIn && (
            <div className="border-t border-border px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0A66C2" }}>
                  <span className="text-white text-[10px] font-black">in</span>
                </div>
                <span className="text-[14px] font-black" style={{ color: CARBON }}>LinkedIn Optimization</span>
                <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl p-4" style={{ backgroundColor: "#F8FAFC" }}>
                  <p className="text-[11px] font-black mb-2" style={{ color: CARBON }}>🏆 Keyword Optimization</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(topSkills.length > 0
                      ? topSkills.map((s) => s.name)
                      : ["Add skills to generate keywords"]
                    ).map(kw => (
                      <span key={kw} className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ backgroundColor: "#0A66C2", color: "white" }}>{kw}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Keywords based on your tracked skills</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#F8FAFC" }}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Profile Strength</p>
                    <p className="text-[16px] font-black" style={{ color: CARBON }}>{careerScore}%</p>
                    <p className="text-[10px] text-muted-foreground">Based on your career metrics</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#F8FAFC" }}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Skills Tracked</p>
                    <p className="text-[16px] font-black" style={{ color: "#0A66C2" }}>{skills.length}</p>
                    <p className="text-[10px] text-muted-foreground">Active skills on your profile</p>
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(241,80,37,0.05)", border: "1px solid rgba(241,80,37,0.1)" }}>
                  <p className="text-[11px] font-black mb-1.5" style={{ color: CARBON }}>📝 Headline Suggestion</p>
                  <p className="text-[12px] italic text-muted-foreground">&ldquo;{linkedInHeadline}&rdquo;</p>
                  <button onClick={() => { navigator.clipboard?.writeText(linkedInHeadline); toast.success("Headline copied!"); }} className="text-[10px] font-bold mt-1.5 flex items-center gap-1" style={{ color: FLAME }}>
                    <Copy className="w-3 h-3" /> Copy to clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card className="p-5" hover={false}>
          <div className="space-y-3">
            {[
              { label: "Push Notifications", desc: "Learning reminders and alerts", on: notif, set: setNotif, key: "notifyPush" as const },
              { label: "AI Daily Insights", desc: "Personalized career insights each morning", on: insights, set: setInsights, key: "notifyInsights" as const },
              { label: "Weekly Report", desc: "Progress summary every Monday", on: weekly, set: setWeekly, key: "notifyWeekly" as const },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3.5">
                <div><p className="text-[13px] font-semibold" style={{ color: CARBON }}>{item.label}</p><p className="text-[12px] text-muted-foreground">{item.desc}</p></div>
                <Toggle on={item.on} set={(v) => { item.set(v); void saveNotificationPref(item.key, v, item.label); }} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "billing" && (
        <div className="space-y-4">
          <Card
            className="p-5"
            hover={false}
            style={{
              borderColor: PLAN_STYLE[plan].border,
              backgroundColor: PLAN_STYLE[plan].bg,
              boxShadow: `inset 4px 0 0 0 ${PLAN_STYLE[plan].accent}`,
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em]" style={{ color: FLAME }}>Current Plan</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[26px] font-black leading-none" style={{ color: PLAN_STYLE[plan].accent }}>{planLabel}</span>
                  <span className="text-[14px] font-medium text-muted-foreground">· {planInfo.tagline}</span>
                </div>
              </div>
              <span
                className="inline-flex w-fit items-center rounded-full px-4 py-1.5 text-[12px] font-black uppercase tracking-[0.08em]"
                style={{ backgroundColor: PLAN_STYLE[plan].badgeBg, color: PLAN_STYLE[plan].badgeColor }}
              >
                {planLabel}
              </span>
            </div>
            {plan === "free" && (
              <div className="mt-4"><Btn full onClick={() => navigate("/pricing")}><Award className="h-4 w-4" /> Upgrade to Pro — $29/mo</Btn></div>
            )}
          </Card>
          {plan !== "free" && (
            <Card className="p-5" hover={false}>
              <h3 className="text-[14px] font-semibold mb-1" style={{ color: CARBON }}>Manage Subscription</h3>
              <p className="text-[12px] text-muted-foreground mb-4">
                You&apos;re currently on the {planLabel} plan. Cancel anytime to return to the Free plan — no questions asked.
              </p>
              <Btn variant="outline" onClick={confirmCancelPlan} disabled={cancelling}>
                {cancelling ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel plan & return to Free'
                )}
              </Btn>
            </Card>
          )}
          <Card className="p-5" hover={false}>
            <h3 className="text-[14px] font-semibold mb-3" style={{ color: CARBON }}>Usage This Month</h3>
            <div className="space-y-3">
              {[
                { label: "Job Applications Tracked", used: outcomes.totalApplications, limit: planInfo.jobLimit },
                { label: "Interviews Completed", used: outcomes.interviewsCompleted, limit: planInfo.jobLimit },
                { label: "Offers Received", used: outcomes.totalOffers, limit: planInfo.jobLimit },
              ].map(u => (
                <div key={u.label}>
                  <div className="mb-1.5 flex items-center justify-between"><span className="text-[12px] font-medium" style={{ color: CARBON }}>{u.label}</span><span className="text-[12px] text-muted-foreground">{u.used}{plan === "free" ? `/${u.limit}` : ""}</span></div>
                  <Bar pct={plan === "free" ? Math.min(100, (u.used / u.limit) * 100) : Math.min(100, u.used * 10)} color={plan === "free" && u.used >= u.limit ? "#EF4444" : FLAME} h={4} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "danger" && (
        <Card className="p-5" hover={false} style={{ borderColor: "rgba(220,38,38,0.22)" }}>
          <div className="mb-3">
            <h2 className="text-[14px] font-semibold text-red-600">Danger Zone</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">These actions cannot be undone.</p>
          </div>
          <div className="space-y-3">
            <button onClick={async () => {
              try {
                const data = await api.exportUserData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `pathforge-export-${new Date().toISOString().split("T")[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Data exported");
              } catch {
                toast.error("Export failed");
              }
            }} className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3.5 transition-all hover:bg-secondary">
              <div className="text-left"><p className="text-[13px] font-semibold" style={{ color: CARBON }}>Export All Data</p><p className="text-[11px] text-muted-foreground">Download a copy of all your career data</p></div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => {
              toast.error("Delete your account permanently?", {
                action: {
                  label: "Yes, delete",
                  onClick: async () => {
                    try {
                      await api.deleteAccount();
                      logout();
                      navigate("/");
                      toast.success("Account deleted");
                    } catch {
                      toast.error("Failed to delete account");
                    }
                  },
                },
              });
            }} className="flex w-full items-center justify-between rounded-2xl border border-red-200 px-4 py-3.5 transition-all hover:bg-red-50">
              <div className="text-left"><p className="text-[13px] font-semibold text-red-600">Delete Account</p><p className="text-[11px] text-muted-foreground">Permanently delete your account and all data</p></div>
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
