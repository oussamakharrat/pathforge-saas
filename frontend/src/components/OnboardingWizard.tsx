'use client';

import { useState, useCallback } from "react";
import { ArrowRight, Check, Sparkles, Briefcase, GraduationCap, Lightbulb, Users, HeartHandshake, Target, Code, PenLine, BarChart3, Globe, MessageCircle, Podcast, Hash } from "lucide-react";
import { FLAME, CARBON, DUST, ALABASTER } from "../lib/constants";
import { Btn } from "./Btn";
import { useAuth } from "../contexts/AuthContext";
import type { UserProfile } from "../data/types";

type StepKey = "targetRole" | "experience" | "education" | "challenges" | "referral";

interface StepDef {
  key: StepKey;
  title: string;
  subtitle: string;
  icon: typeof Target;
}

const STEPS: StepDef[] = [
  { key: "targetRole", title: "What's your target role?", subtitle: "We'll tailor your roadmap around this goal.", icon: Target },
  { key: "experience", title: "Years of experience", subtitle: "Helps us set realistic milestones and skill benchmarks.", icon: Briefcase },
  { key: "education", title: "Highest education level", subtitle: "We'll factor this into your growth path.", icon: GraduationCap },
  { key: "challenges", title: "What's holding you back?", subtitle: "Pick the biggest blockers — we'll prioritize them.", icon: Lightbulb },
  { key: "referral", title: "How did you find us?", subtitle: "Helps us improve the experience for engineers like you.", icon: HeartHandshake },
];

const EXPERIENCE_OPTIONS = [
  { value: "0-1" as const, label: "0–1 year", desc: "Just starting out" },
  { value: "1-3" as const, label: "1–3 years", desc: "Early career" },
  { value: "3-5" as const, label: "3–5 years", desc: "Mid-level" },
  { value: "5-10" as const, label: "5–10 years", desc: "Senior" },
  { value: "10+" as const, label: "10+ years", desc: "Staff / Lead" },
];

const EDUCATION_OPTIONS = [
  { value: "high-school" as const, label: "High School", desc: "Diploma / GED" },
  { value: "associate" as const, label: "Associate", desc: "2-year degree" },
  { value: "bachelor" as const, label: "Bachelor's", desc: "4-year degree" },
  { value: "master" as const, label: "Master's", desc: "Graduate degree" },
  { value: "phd" as const, label: "PhD", desc: "Doctorate" },
  { value: "bootcamp" as const, label: "Bootcamp", desc: "Coding bootcamp" },
];

const CHALLENGE_OPTIONS = [
  { value: "Resume not getting interviews", icon: FileTextIcon },
  { value: "Lack of relevant skills", icon: Code },
  { value: "No portfolio / projects", icon: PenLine },
  { value: "Interview anxiety / performance", icon: MicIcon },
  { value: "Career transition / pivot", icon: BarChart3 },
  { value: "Salary negotiation", icon: DollarIcon },
  { value: "Networking & referrals", icon: Users },
  { value: "Imposter syndrome", icon: Sparkles },
];

const REFERRAL_OPTIONS = [
  { value: "social-media" as const, label: "Social Media", desc: "LinkedIn, Twitter, TikTok", icon: Globe },
  { value: "google" as const, label: "Google Search", desc: "Found us while searching", icon: Hash },
  { value: "friend" as const, label: "Friend / Colleague", desc: "Someone referred you", icon: Users },
  { value: "podcast" as const, label: "Podcast", desc: "Heard about us on a show", icon: Podcast },
  { value: "blog" as const, label: "Blog / Newsletter", desc: "Read an article", icon: MessageCircle },
  { value: "other" as const, label: "Other", desc: "Somewhere else", icon: Globe },
];

// Inline icon components to avoid naming conflicts
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function MicIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="2" width="6" height="12" rx="3" ry="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
function DollarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { updateProfile } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState<UserProfile["experienceLevel"] | null>(null);
  const [education, setEducation] = useState<UserProfile["educationLevel"] | null>(null);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [referral, setReferral] = useState<UserProfile["referralSource"] | null>(null);

  const current = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canAdvance = useCallback(() => {
    switch (current.key) {
      case "targetRole": return targetRole.trim().length >= 2;
      case "experience": return experience !== null;
      case "education": return education !== null;
      case "challenges": return challenges.length > 0;
      case "referral": return referral !== null;
    }
  }, [current.key, targetRole, experience, education, challenges, referral]);

  const handleNext = () => {
    if (!canAdvance()) return;
    if (isLast) {
      // Save profile and complete
      updateProfile({
        name: "",
        email: "",
        targetRole: targetRole.trim(),
        experienceLevel: experience!,
        educationLevel: education!,
        biggestChallenges: challenges,
        referralSource: referral!,
        onboardingComplete: true,
      });
      onComplete();
    } else {
      setStepIndex(i => i + 1);
    }
  };

  const handleBack = () => {
    if (isFirst) return;
    setStepIndex(i => i - 1);
  };

  const toggleChallenge = (val: string) => {
    setChallenges(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel — decorative */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-8 md:p-10 lg:p-14 relative overflow-hidden" style={{ backgroundColor: CARBON }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 30% 70%, ${FLAME} 0%, transparent 60%)` }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-black" style={{ backgroundColor: FLAME }}>CG</div>
            <span className="text-white text-[13px] font-black">CareerGrowth</span>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-[1.1] mb-4 tracking-tight">
            Just a few details<br />
            <span style={{ color: FLAME }}>to personalize</span>
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: DUST }}>
            We&apos;ll use your answers to tailor your AI coach, learning roadmap, skill benchmarks, and career insights — built around <strong className="text-white">your</strong> goals.
          </p>
          <div className="mt-8 space-y-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: isDone ? FLAME : isActive ? "rgba(241,80,37,0.15)" : "transparent",
                      border: isDone ? "none" : `1px solid ${isActive ? FLAME : DUST}`,
                    }}>
                    {isDone ? <Check className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4" style={{ color: isActive ? FLAME : DUST }} />}
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: isActive ? "white" : isDone ? ALABASTER : DUST }}>{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <p className="text-[11px]" style={{ color: DUST }}>Step {stepIndex + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Right panel — the wizard */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-10 lg:p-14">
        <div className="w-full max-w-[520px]">
          {/* Mobile progress */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: DUST }}>
              <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: FLAME }} />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground">{stepIndex + 1}/{STEPS.length}</span>
          </div>

          {/* Step content */}
          <div key={current.key} className="transition-all duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
                <current.icon className="w-5 h-5" style={{ color: FLAME }} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: CARBON }}>{current.title}</h1>
                <p className="text-[13px] text-muted-foreground">{current.subtitle}</p>
              </div>
            </div>

            {/* Target Role */}
            {current.key === "targetRole" && (
              <div className="space-y-4">
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleNext()}
                    placeholder="e.g. Senior Frontend Engineer, Staff ML Engineer..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-border text-[14px] font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    style={{ backgroundColor: ALABASTER }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Be as specific as you&apos;d like — we&apos;ll use this to customize your roadmap.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Senior Frontend Engineer",
                    "Staff Software Engineer",
                    "Engineering Manager",
                    "Full-Stack Developer",
                    "ML/AI Engineer",
                    "DevOps / SRE",
                    "Tech Lead",
                    "Product Engineer",
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setTargetRole(suggestion)}
                      className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all hover:bg-secondary"
                      style={{ borderColor: DUST, color: CARBON }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {current.key === "experience" && (
              <div className="space-y-3">
                {EXPERIENCE_OPTIONS.map(opt => {
                  const selected = experience === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setExperience(opt.value)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                      style={{
                        borderColor: selected ? FLAME : "transparent",
                        backgroundColor: selected ? "rgba(241,80,37,0.05)" : ALABASTER,
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: selected ? FLAME : "white" }}>
                        {selected ? <Check className="w-4 h-4 text-white" /> : <Briefcase className="w-4 h-4" style={{ color: DUST }} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-bold" style={{ color: selected ? FLAME : CARBON }}>{opt.label}</p>
                        <p className="text-[12px] text-muted-foreground">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Education */}
            {current.key === "education" && (
              <div className="grid grid-cols-2 gap-3">
                {EDUCATION_OPTIONS.map(opt => {
                  const selected = education === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setEducation(opt.value)}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center"
                      style={{
                        borderColor: selected ? FLAME : "transparent",
                        backgroundColor: selected ? "rgba(241,80,37,0.05)" : ALABASTER,
                      }}
                    >
                      <GraduationCap className="w-5 h-5" style={{ color: selected ? FLAME : DUST }} />
                      <div>
                        <p className="text-[13px] font-bold" style={{ color: selected ? FLAME : CARBON }}>{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                      </div>
                      {selected && <Check className="w-4 h-4" style={{ color: FLAME }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Challenges */}
            {current.key === "challenges" && (
              <div className="space-y-2">
                <p className="text-[12px] font-bold text-muted-foreground mb-2">Select all that apply</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CHALLENGE_OPTIONS.map(opt => {
                    const selected = challenges.includes(opt.value);
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleChallenge(opt.value)}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left"
                        style={{
                          borderColor: selected ? FLAME : "transparent",
                          backgroundColor: selected ? "rgba(241,80,37,0.05)" : ALABASTER,
                        }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: selected ? FLAME : DUST }} />
                        <span className="text-[12px] font-semibold flex-1" style={{ color: selected ? FLAME : CARBON }}>{opt.value}</span>
                        {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FLAME }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Referral */}
            {current.key === "referral" && (
              <div className="space-y-3">
                {REFERRAL_OPTIONS.map(opt => {
                  const selected = referral === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setReferral(opt.value)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                      style={{
                        borderColor: selected ? FLAME : "transparent",
                        backgroundColor: selected ? "rgba(241,80,37,0.05)" : ALABASTER,
                      }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: selected ? FLAME : "white" }}>
                        <Icon className="w-4.5 h-4.5" style={{ color: selected ? "white" : DUST }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-bold" style={{ color: selected ? FLAME : CARBON }}>{opt.label}</p>
                        <p className="text-[12px] text-muted-foreground">{opt.desc}</p>
                      </div>
                      {selected && <Check className="w-4 h-4" style={{ color: FLAME }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={handleBack}
                disabled={isFirst}
                className="text-[12px] font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-30"
                style={{ color: CARBON }}
              >
                ← Back
              </button>

              {/* Step dots (desktop) */}
              <div className="hidden md:flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ backgroundColor: i === stepIndex ? FLAME : i < stepIndex ? FLAME : DUST, opacity: i === stepIndex ? 1 : i < stepIndex ? 0.6 : 0.3 }}
                  />
                ))}
              </div>

              <Btn onClick={handleNext} disabled={!canAdvance()} size="sm">
                {isLast ? (
                  <>Complete Setup <Sparkles className="w-3.5 h-3.5" /></>
                ) : (
                  <>Next <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
