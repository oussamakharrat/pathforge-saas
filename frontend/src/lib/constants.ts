import { LayoutDashboard, Target, Zap, FileText, BookOpen, Layers, MessageSquare, Mic, DollarSign, Package, Award, Settings, FolderKanban, Trophy, Users, BarChart3, HelpCircle } from "lucide-react";
import type { KanbanCol } from "../data/types";

export const FLAME = "#F15025";
export const CARBON = "#191919";
export const ALABASTER = "#E6E8E6";
export const DUST = "#CED0CE";

// ── Spacing Scale (in px / Tailwind units) ──
export const SPACE = {
  micro: 1,   // 4px   — gap-1
  tight: 2,   // 8px   — gap-2
  small: 3,   // 12px  — gap-3
  base: 4,    // 16px  — gap-4
  section: 6, // 24px  — gap-6
  major: 8,   // 32px  — gap-8
} as const;

export type NavGroup = "core" | "growth" | "premium" | "other";

export const NAV_ITEMS: { id: string; label: string; icon: any; group: NavGroup }[] = [
  // ── Core ──
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "core" },
  { id: "goals", label: "Career Hub", icon: Target, group: "core" },
  { id: "coach", label: "AI Coach", icon: MessageSquare, group: "core" },
  { id: "tracker", label: "Jobs", icon: Layers, group: "core" },
  // ── Growth ──
  { id: "skills", label: "Skills", icon: Zap, group: "growth" },
  { id: "learning", label: "Learning", icon: BookOpen, group: "growth" },
  { id: "resume", label: "Resume", icon: FileText, group: "growth" },
  // ── Premium ──
  { id: "interview", label: "Mock Interview", icon: Mic, group: "premium" },
  { id: "negotiate", label: "Negotiate", icon: DollarSign, group: "premium" },
  { id: "services", label: "Services", icon: Package, group: "premium" },
  // ── More ──
  { id: "portfolio", label: "Portfolio", icon: FolderKanban, group: "other" },
  { id: "achievements", label: "Achievements", icon: Trophy, group: "other" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "other" },
  { id: "community", label: "Community", icon: Users, group: "other" },
  { id: "badges", label: "Badges", icon: Trophy, group: "other" },
];

export const NAV_GROUPS: { key: NavGroup; label: string }[] = [
  { key: "core", label: "Core" },
  { key: "growth", label: "Growth" },
  { key: "premium", label: "Premium" },
  { key: "other", label: "More" },
];

export const KANBAN_COLS: { id: KanbanCol; label: string; color: string }[] = [
  { id: "saved", label: "Saved", color: "#6B7280" },
  { id: "applied", label: "Applied", color: "#3B82F6" },
  { id: "screening", label: "Screening", color: "#8B5CF6" },
  { id: "interview", label: "Interview", color: FLAME },
  { id: "final", label: "Final Round", color: "#F59E0B" },
  { id: "offer", label: "Offer 🎉", color: "#10B981" },
  { id: "rejected", label: "Rejected", color: "#EF4444" },
] as const;

export const PUBLIC_PAGES = new Set(["landing", "login", "register", "pricing", "services"]);
