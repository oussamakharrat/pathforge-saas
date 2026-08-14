'use client';

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "@/lib/router";
import { toast } from "sonner";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Globe, Github } from "lucide-react";
import { FLAME, CARBON, DUST, ALABASTER } from "../lib/constants";
import { Btn } from "../components/Btn";
import { Field } from "../components/Field";
import { BrandLogo } from "../components/BrandLogo";
import { useAuth } from "../contexts/AuthContext";
import OnboardingWizard from "../components/OnboardingWizard";
import { api } from "@/lib/api";
import { Modal } from "../components/Modal";

export default function AuthPage({ mode: initialMode }: { mode: "login" | "register" }) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oauthProviders, setOauthProviders] = useState({ google: false, github: false });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, register, updateProfile } = useAuth();

  useEffect(() => {
    const verifyToken = searchParams.get('verify');
    const resetFromUrl = searchParams.get('reset');
    const oauthError = searchParams.get('error');
    if (resetFromUrl) {
      setResetToken(resetFromUrl);
      setShowForgot(true);
    }
    if (verifyToken) {
      navigate(`/auth/verify?token=${encodeURIComponent(verifyToken)}`);
      return;
    }
    if (oauthError === 'oauth_failed') {
      toast.error('Social sign-in failed. Try again or use email.');
      setSearchParams({});
    }
    if (oauthError === 'oauth_not_configured') {
      toast.error('That sign-in provider is not configured yet.');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, navigate]);

  useEffect(() => {
    void api.getOAuthProviders()
      .then(setOauthProviders)
      .catch(() => setOauthProviders({ google: false, github: false }));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "register" && !name.trim()) e.name = "Name is required";
    if (!email.includes("@")) e.email = "Enter a valid email address";
    if (pw.length < 6) e.pw = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email.trim(), pw, name.trim());
        updateProfile({ name: name.trim(), email: email.trim() });
        setShowOnboarding(true);
        toast.success("Account created! Let's personalize your experience");
      } else {
        await login(email.trim(), pw);
        navigate('/app/dashboard');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      toast.error(
        message === 'Invalid credentials'
          ? 'Invalid email or password. Register first, or use demo@pathforge.dev / password123'
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    navigate('/app/dashboard');
  };

  // Show onboarding wizard after registration
  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel — trust & outcomes */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-8 md:p-10 lg:p-14 relative overflow-hidden" style={{ backgroundColor: CARBON }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 30% 70%, ${FLAME} 0%, transparent 60%)` }} />
        <div className="relative z-10"><BrandLogo light /></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-4 tracking-tight">From Skill Gaps<br /><span style={{ color: FLAME }}>to Job Offers.</span></h2>
          <p className="text-[14px] leading-relaxed mb-7" style={{ color: DUST }}>Your AI-powered Career Operating System — personalized roadmaps, skill analysis, interview prep, and salary negotiation in one focused workspace.</p>

          {/* Mini value dashboard — outcomes, not features */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              { value: "+37%", label: "More Interview Invitations", color: "#10B981" },
              { value: "+24%", label: "Faster Skill Growth", color: "#3B82F6" },
              { value: "€5,800", label: "Avg Salary Increase", color: FLAME },
              { value: "500+", label: "Skills Tracked", color: "#8B5CF6" },
            ].map(m => (
              <div key={m.label} className="p-3.5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xl font-black" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: DUST }}>{m.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="p-4 rounded-xl relative" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-3xl absolute -top-1 left-3 opacity-20" style={{ color: FLAME }}>&ldquo;</span>
            <p className="text-[13px] leading-relaxed italic pl-1" style={{ color: ALABASTER }}>
              PathForge helped me identify the exact skills missing for my first senior engineering role.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: FLAME }}>MT</div>
              <div>
                <p className="text-[11px] font-semibold text-white">Marcus T.</p>
                <p className="text-[9px]" style={{ color: DUST }}>Software Engineer</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-[12px]" style={{ color: DUST }}>Built for software engineers, IT professionals, and tech leaders.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-10 lg:p-14">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 lg:hidden"><BrandLogo /></div>
          <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: CARBON }}>{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="text-[13px] text-muted-foreground mb-7">{mode === "login" ? "Sign in to your career dashboard." : "Start accelerating your career today."}</p>

          {(oauthProviders.google || oauthProviders.github) && (
          <div className="space-y-2.5 mb-6">
            {oauthProviders.google && (
              <button type="button" onClick={() => { window.location.href = api.getGoogleOAuthUrl(); }}
                className="w-full h-10 rounded-xl border border-border bg-white text-[13px] font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-2.5" style={{ color: CARBON }}>
                <Globe className="w-4 h-4" /> Continue with Google
              </button>
            )}
            {oauthProviders.github && (
              <button type="button" onClick={() => { window.location.href = api.getGithubOAuthUrl(); }}
                className="w-full h-10 rounded-xl border border-border bg-white text-[13px] font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-2.5" style={{ color: CARBON }}>
                <Github className="w-4 h-4" /> Continue with GitHub
              </button>
            )}
          </div>
          )}

          {(oauthProviders.google || oauthProviders.github) && (
          <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-border" /><span className="text-[11px] font-semibold text-muted-foreground">or email</span><div className="flex-1 h-px bg-border" /></div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && <Field label="Full Name" placeholder="Jordan Lee" value={name} onChange={setName} Left={User} error={errors.name} />}
            <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} Left={Mail} error={errors.email} />
            <Field label="Password" type={showPw ? "text" : "password"} placeholder="••••••••" value={pw} onChange={setPw} Left={Lock}
              Right={<button type="button" onClick={() => setShowPw(!showPw)} className="text-muted-foreground hover:text-foreground">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
              error={errors.pw} />
            {mode === "login" && <div className="text-right"><button type="button" onClick={() => setShowForgot(true)} className="text-[12px] font-bold hover:underline" style={{ color: FLAME }}>Forgot password?</button></div>}
            <Btn type="submit" full size="md" disabled={loading}>
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {mode === "login" ? "Signing In..." : "Creating Account..."}</> : <>{mode === "login" ? "Sign In" : "Create Free Account"} <ArrowRight className="w-4 h-4" /></>}
            </Btn>
          </form>

          {/* Sign-up CTA — more prominent */}
          {mode === "login" ? (
            <div className="mt-6 p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "rgba(241,80,37,0.25)", backgroundColor: "rgba(241,80,37,0.03)" }}>
              <p className="text-[13px] font-bold mb-1" style={{ color: CARBON }}>Start with a free account</p>
              <p className="text-[11px] text-muted-foreground mb-3">No credit card required — full access, no limits.</p>
              <button onClick={() => { setMode("register"); setErrors({}); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:shadow-md"
                style={{ backgroundColor: FLAME }}>
                Create Free Account <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-center text-[13px] text-muted-foreground mt-5">
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setErrors({}); }} className="font-black hover:underline" style={{ color: FLAME }}>Sign in</button>
            </p>
          )}

          {/* Security signals */}
          <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure Authentication</span>
          </div>
        </div>
      </div>

      <Modal open={showForgot} onClose={() => setShowForgot(false)} title="Reset Password">
        <div className="space-y-4">
          {!resetToken ? (
            <>
              <Field label="Email" type="email" value={email} onChange={setEmail} Left={Mail} />
              <Btn full onClick={async () => {
                try {
                  const res = await api.forgotPassword(email);
                  if (res.resetToken) {
                    setResetToken(res.resetToken);
                    toast.success("Reset token generated (dev mode)");
                  } else {
                    toast.success(res.message);
                  }
                } catch {
                  toast.error("Failed to request reset");
                }
              }}>Send Reset Link</Btn>
            </>
          ) : (
            <>
              <Field label="Reset Token" value={resetToken} onChange={setResetToken} />
              <Field label="New Password" type="password" value={newPassword} onChange={setNewPassword} Left={Lock} />
              <Btn full onClick={async () => {
                try {
                  await api.resetPassword(resetToken, newPassword);
                  toast.success("Password updated — sign in now");
                  setShowForgot(false);
                  setResetToken("");
                  setNewPassword("");
                } catch {
                  toast.error("Reset failed");
                }
              }}>Update Password</Btn>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
