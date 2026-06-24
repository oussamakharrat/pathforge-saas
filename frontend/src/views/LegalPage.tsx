'use client';

import { useNavigate } from "@/lib/router";
import { Shield, FileText, Eye, Lock, Database, Mail, ArrowRight } from "lucide-react";
import { FLAME, CARBON, DUST, ALABASTER } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { BrandLogo } from "../components/BrandLogo";

interface LegalPageProps {
  page: "privacy" | "terms";
}

export default function LegalPage({ page }: LegalPageProps) {
  const navigate = useNavigate();
  const isPrivacy = page === "privacy";

  const content = isPrivacy ? {
    title: "Privacy Policy",
    subtitle: "Last updated: June 15, 2026",
    icon: Shield,
    sections: [
      { h: "Information We Collect", icon: Eye, body: "We collect information you provide when creating an account: name, email address, career goals, skill assessments, resume data, and job application tracking information. We also collect usage data such as pages visited, features used, and session duration to improve our service." },
      { h: "How We Use Your Data", icon: FileText, body: "Your data is used to personalize your career coaching experience, generate learning roadmaps, provide AI-powered feedback, and improve our algorithms. We never sell your personal information to third parties." },
      { h: "Data Storage & Security", icon: Lock, body: "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We use industry-standard security practices to protect your information. You retain full ownership of all data you provide." },
      { h: "Data Retention", icon: Database, body: "We retain your data for as long as your account is active. You can request complete deletion at any time from Settings → Danger Zone. Deleted data is permanently removed within 30 days." },
      { h: "Third-Party Services", icon: Mail, body: "We integrate with Stripe for payment processing (they never share your full card details with us) and may use analytics providers to understand usage patterns. Each third party operates under their own privacy policy." },
      { h: "Your Rights", icon: Shield, body: "You have the right to access, correct, export, or delete your data at any time. Manage these from Settings → Data. For questions, contact hello@careergrowth.dev." },
    ],
  } : {
    title: "Terms of Service",
    subtitle: "Last updated: June 15, 2026",
    icon: FileText,
    sections: [
      { h: "Acceptance of Terms", icon: Shield, body: "By creating an account and using CareerGrowth AI, you agree to these Terms of Service. If you do not agree, do not use the service. We may update these terms; continued use constitutes acceptance of changes." },
      { h: "Account Responsibilities", icon: Eye, body: "You are responsible for maintaining the confidentiality of your password and for all activity under your account. You must provide accurate information and keep it updated. One account per person." },
      { h: "Subscription & Billing", icon: Lock, body: "Free accounts have access to basic features. Pro and Premium plans are billed monthly or annually. You can upgrade, downgrade, or cancel anytime. Refunds are handled per Stripe's refund policy." },
      { h: "Service Purchases", icon: Database, body: "One-time service purchases (Resume Review, LinkedIn Optimization, etc.) are non-refundable after delivery. Digital service credits do not expire. Contact support within 48 hours if unsatisfied." },
      { h: "Acceptable Use", icon: FileText, body: "You agree not to misuse the service: no scraping, no automated accounts, no impersonation, no uploading malicious content. Violation may result in immediate termination without refund." },
      { h: "Limitation of Liability", icon: Mail, body: "CareerGrowth AI provides tools and guidance but does not guarantee job offers, interview invitations, or salary outcomes. We are not liable for decisions made based on AI-generated recommendations." },
    ],
  };

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-[12px] font-bold hover:underline" style={{ color: CARBON }}>Sign in</button>
            <Btn size="sm" onClick={() => navigate("/register")}>Get Started</Btn>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
            <Icon className="w-7 h-7" style={{ color: FLAME }} />
          </div>
          <h1 className="text-3xl font-black mb-1" style={{ color: CARBON }}>{content.title}</h1>
          <p className="text-[13px] text-muted-foreground">{content.subtitle}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 mb-8 p-1 rounded-2xl border border-border bg-white shadow-sm">
          {[{ id: "privacy", label: "Privacy Policy" }, { id: "terms", label: "Terms of Service" }].map(tab => (
            <button key={tab.id} onClick={() => navigate(`/${tab.id}`)}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all text-center"
              style={{
                backgroundColor: isPrivacy === (tab.id === "privacy") ? "white" : "transparent",
                color: isPrivacy === (tab.id === "privacy") ? CARBON : "#6B6F6B",
                boxShadow: isPrivacy === (tab.id === "privacy") ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {content.sections.map((section, i) => {
            const SecIcon = section.icon;
            return (
              <Card key={i} className="p-6" hover={false}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
                    <SecIcon className="w-4.5 h-4.5" style={{ color: FLAME }} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black mb-2" style={{ color: CARBON }}>{section.h}</h2>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">{section.body}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center border-t border-border pt-6">
          <p className="text-[12px] text-muted-foreground mb-4">Have questions about these terms? We're here to help.</p>
          <Btn variant="outline" onClick={() => { window.location.href = "mailto:hello@careergrowth.dev"; }}>
            <Mail className="w-4 h-4" /> hello@careergrowth.dev
          </Btn>
        </div>
      </div>
    </div>
  );
}
