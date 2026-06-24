'use client';

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { toast } from "sonner";
import { User, Mail, Briefcase, Globe, Edit3, Check, Award, ExternalLink, X, Bell as BellIcon, Copy } from "lucide-react";
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Field } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { useCareerData } from "../contexts/CareerDataContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { purchasedServices } = useCareerData();
  const hasLinkedIn = purchasedServices.includes("LinkedIn Optimization");
  const [notif, setNotif] = useState(true);
  const [insights, setInsights] = useState(true);
  const [weekly, setWeekly] = useState(false);
  const [email, setEmail] = useState("jordan@example.com");
  const [name, setName] = useState("Jordan Lee");
  const [role, setRole] = useState("Full-Stack Engineer");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "billing" | "danger">("profile");

  const save = () => {
    if (!name.trim() || !email.trim()) { toast.error("Name and email are required"); return; }
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Settings saved!"); }, 1000);
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
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ background: "linear-gradient(135deg, #F15025, #FF9B6A)" }}>
                JL
                <button onClick={() => toast.info("Photo upload coming soon")} className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white"><Edit3 className="h-3 w-3" style={{ color: CARBON }} /></button>
              </div>
              <div><p className="text-[15px] font-semibold" style={{ color: CARBON }}>Jordan Lee</p><p className="text-[12px] text-muted-foreground">Free Plan · Member since Jan 2025</p></div>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-[#FFF7F1] px-3 py-1 text-[11px] font-semibold" style={{ color: FLAME }}>Profile complete · 82%</span>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Full Name" value={name} onChange={setName} Left={User} />
            <Field label="Email" type="email" value={email} onChange={setEmail} Left={Mail} />
            <Field label="Current Role" value={role} onChange={setRole} Left={Briefcase} />
            <Field label="Location" value="San Francisco, CA" onChange={() => toast.info("Location editing coming soon")} Left={Globe} />
          </div>
          <div className="flex justify-end border-t border-border px-5 py-4">
            <Btn size="sm" onClick={save} disabled={saving}>{saving ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving...</> : <><Check className="h-3.5 w-3.5" /> Save Changes</>}</Btn>
          </div>
          {/* ⭐ LinkedIn Optimization — unlocked with purchase */}
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
                    {["System Design", "Distributed Systems", "TypeScript", "React Architecture", "Team Leadership", "API Design", "Cloud Infrastructure", "CI/CD", "Agile", "Mentoring"].map(kw => (
                      <span key={kw} className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ backgroundColor: "#0A66C2", color: "white" }}>{kw}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Top keywords optimized for recruiter search algorithms</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#F8FAFC" }}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Profile Strength</p>
                    <p className="text-[16px] font-black" style={{ color: CARBON }}>92%</p>
                    <p className="text-[10px] text-muted-foreground">Top 5% of profiles in your field</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#F8FAFC" }}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Recruiter Reach</p>
                    <p className="text-[16px] font-black" style={{ color: "#0A66C2" }}>3.2x</p>
                    <p className="text-[10px] text-muted-foreground">Estimated profile view increase</p>
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(241,80,37,0.05)", border: "1px solid rgba(241,80,37,0.1)" }}>
                  <p className="text-[11px] font-black mb-1.5" style={{ color: CARBON }}>📝 Headline Suggestion</p>
                  <p className="text-[12px] italic text-muted-foreground">"Senior Full-Stack Engineer | React, TypeScript & Distributed Systems | Building at Scale"</p>
                  <button onClick={() => { navigator.clipboard?.writeText('Senior Full-Stack Engineer | React, TypeScript & Distributed Systems | Building at Scale'); toast.success("Headline copied!"); }} className="text-[10px] font-bold mt-1.5 flex items-center gap-1" style={{ color: FLAME }}>
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
              { label: "Push Notifications", desc: "Learning reminders and alerts", on: notif, set: setNotif },
              { label: "AI Daily Insights", desc: "Personalized career insights each morning", on: insights, set: setInsights },
              { label: "Weekly Report", desc: "Progress summary every Monday", on: weekly, set: setWeekly },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3.5">
                <div><p className="text-[13px] font-semibold" style={{ color: CARBON }}>{item.label}</p><p className="text-[12px] text-muted-foreground">{item.desc}</p></div>
                <Toggle on={item.on} set={(v) => { item.set(v); toast.success(`${item.label} ${v ? "enabled" : "disabled"}`); }} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "billing" && (
        <div className="space-y-4">
          <Card className="p-5" hover={false}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-[11px] font-medium uppercase tracking-[0.22em]" style={{ color: FLAME }}>Current Plan</p><h3 className="mt-1 text-[15px] font-semibold" style={{ color: CARBON }}>Free · 5 AI messages/month</h3></div>
              <span className="inline-flex w-fit items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold" style={{ color: CARBON }}>Free</span>
            </div>
            <div className="mt-4"><Btn full onClick={() => navigate("/pricing")}><Award className="h-4 w-4" /> Upgrade to Pro — $29/mo</Btn></div>
          </Card>
          <Card className="p-5" hover={false}>
            <h3 className="text-[14px] font-semibold mb-3" style={{ color: CARBON }}>Usage This Month</h3>
            <div className="space-y-3">
              {[{ label: "AI Coach Messages", used: 3, limit: 5 }, { label: "Resume Reviews", used: 0, limit: 1 }, { label: "Job Applications", used: 8, limit: 10 }].map(u => (
                <div key={u.label}>
                  <div className="mb-1.5 flex items-center justify-between"><span className="text-[12px] font-medium" style={{ color: CARBON }}>{u.label}</span><span className="text-[12px] text-muted-foreground">{u.used}/{u.limit}</span></div>
                  <Bar pct={(u.used / u.limit) * 100} color={u.used >= u.limit ? "#EF4444" : FLAME} h={4} />
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
            <button onClick={() => toast.info("Data export initiated — check your email in 5 minutes")} className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3.5 transition-all hover:bg-secondary">
              <div className="text-left"><p className="text-[13px] font-semibold" style={{ color: CARBON }}>Export All Data</p><p className="text-[11px] text-muted-foreground">Download a copy of all your career data</p></div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => { toast.error("Are you sure? This cannot be undone.", { action: { label: "Yes, delete", onClick: () => { logout(); navigate("/"); } } }); }} className="flex w-full items-center justify-between rounded-2xl border border-red-200 px-4 py-3.5 transition-all hover:bg-red-50">
              <div className="text-left"><p className="text-[13px] font-semibold text-red-600">Delete Account</p><p className="text-[11px] text-muted-foreground">Permanently delete your account and all data</p></div>
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
