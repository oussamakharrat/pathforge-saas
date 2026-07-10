'use client';

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "@/lib/router";
import { toast } from "sonner";
import { FileText, Upload, TrendingUp, Sparkles, Brain, CheckCircle2, AlertCircle, Plus, Pencil, Save } from "lucide-react";
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { Modal } from "../components/Modal";
import { useCareerData } from "../contexts/CareerDataContext";
import { useResume } from "../contexts/ResumeContext";
import { scoreResumeContent, parseTextToSections } from "@/lib/resume-scoring";
import { api } from "@/lib/api";

const SECTION_TYPES = [
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "custom", label: "Custom" },
];

export default function ResumePage() {
  const navigate = useNavigate();
  const { purchasedServices, skills } = useCareerData();
  const { resumes, loading, createResume, updateResume, addSection, updateSection } = useResume();
  const hasResumeReview = purchasedServices.includes("Resume Review");
  const hasFullRewrite = purchasedServices.includes("CV Full Rewrite");
  const [drag, setDrag] = useState(false);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<{ id: string; title: string; content: string } | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSection, setNewSection] = useState({ type: "summary", title: "Summary", content: "" });
  const [saving, setSaving] = useState(false);

  const active = useMemo(() => {
    if (!resumes.length) return null;
    return resumes.find((r) => r.id === activeResumeId) ?? resumes[0];
  }, [resumes, activeResumeId]);

  const score = useMemo(() => {
    if (!active) return null;
    return scoreResumeContent(
      active.sections.map((s) => ({ title: s.title, content: s.content })),
      skills.map((s) => s.name),
    );
  }, [active, skills]);

  const persistScore = useCallback(async () => {
    if (!active || !score) return;
    setSaving(true);
    try {
      await updateResume(active.id, {
        atsScore: score.atsScore,
        detectedKeywords: score.detectedKeywords,
        missingKeywords: score.missingKeywords,
        suggestions: score.suggestions,
      });
      toast.success("Resume score saved");
    } finally {
      setSaving(false);
    }
  }, [active, score, updateResume]);

  const handleFileDrop = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx", "txt", "md"].includes(ext ?? "")) {
      toast.error("Unsupported format. Use PDF, DOC, DOCX, or TXT.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit");
      return;
    }

    try {
      let sections: { type: string; title: string; content: string }[] = [];
      if (ext === "txt" || ext === "md") {
        const text = await file.text();
        sections = parseTextToSections(text);
      } else {
        toast.info("Binary file saved as new version — add sections manually or paste text in a .txt file.");
        sections = [{ type: "summary", title: "Imported Resume", content: `Uploaded: ${file.name}` }];
      }
      const created = await createResume(file.name.replace(/\.[^.]+$/, ""), sections);
      if (created) {
        setActiveResumeId(created.id);
        const scored = scoreResumeContent(sections, skills.map((s) => s.name));
        await api.updateResume(created.id, {
          atsScore: scored.atsScore,
          detectedKeywords: scored.detectedKeywords,
          missingKeywords: scored.missingKeywords,
          suggestions: scored.suggestions,
        });
        toast.success("Resume uploaded and scored");
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  const displayScore = active?.atsScore || score?.atsScore || 0;
  const breakdown = score?.breakdown ?? { impact: 0, clarity: 0, keywords: 0, ats: 0 };
  const suggestions = active?.suggestions?.length ? active.suggestions : (score?.suggestions ?? []);
  const detected = active?.detectedKeywords?.length ? active.detectedKeywords : (score?.detectedKeywords ?? []);
  const missing = active?.missingKeywords?.length ? active.missingKeywords : (score?.missingKeywords ?? []);

  return (
    <div>
      <PageHeader
        title="Resume"
        subtitle="Build sections, upload files, and track ATS readiness."
        action={
          <Btn variant="outline" size="sm" onClick={() => { void createResume(`Resume v${resumes.length + 1}`); }}>
            {loading ? "Loading..." : <><Upload className="w-3.5 h-3.5" /> New Resume</>}
          </Btn>
        }
      />
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {active ? (
            <Card className="p-5" hover={false}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-black" style={{ color: CARBON }}>{active.title}</p>
                  <p className="text-[12px] text-muted-foreground">v{active.version} · Updated {active.updatedAt.split("T")[0]}</p>
                </div>
                <Chip variant="green">{displayScore > 0 ? "Scored" : "Draft"}</Chip>
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-center" hover={false}>
              <p className="text-[13px] text-muted-foreground">No resume yet. Create one or upload a file.</p>
            </Card>
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const file = e.dataTransfer.files[0];
              if (file) void handleFileDrop(file);
            }}
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center text-center cursor-pointer transition-all"
            style={{ borderColor: drag ? FLAME : DUST, backgroundColor: drag ? "rgba(241,80,37,0.03)" : "transparent" }}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              className="hidden"
              id="resume-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileDrop(file);
                e.target.value = "";
              }}
            />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl mb-3 flex items-center justify-center" style={{ backgroundColor: ALABASTER }}>
                <Upload className="w-5 h-5" style={{ color: FLAME }} />
              </div>
              <p className="text-[13px] font-black mb-1" style={{ color: CARBON }}>Drag & drop or click to upload</p>
              <p className="text-[12px] text-muted-foreground">TXT/MD auto-parsed into sections · PDF/DOC saved as new version</p>
            </label>
          </div>

          {active && (
            <Card className="p-4" hover={false}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-black" style={{ color: CARBON }}>Sections</h2>
                <button onClick={() => setShowAddSection(true)} className="text-[12px] font-bold flex items-center gap-1" style={{ color: FLAME }}>
                  <Plus className="w-3.5 h-3.5" /> Add section
                </button>
              </div>
              {active.sections.length === 0 ? (
                <p className="text-[12px] text-muted-foreground italic">No sections yet. Add summary, experience, and skills.</p>
              ) : (
                <div className="space-y-2">
                  {active.sections.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-bold" style={{ color: CARBON }}>{s.title}</p>
                        <button
                          onClick={() => setEditingSection({ id: s.id, title: s.title, content: s.content })}
                          className="text-[11px] font-bold flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      </div>
                      <p className="text-[12px] text-muted-foreground line-clamp-3 whitespace-pre-wrap">{s.content || "(empty)"}</p>
                    </div>
                  ))}
                </div>
              )}
              {score && (
                <Btn size="sm" className="w-full mt-3" onClick={() => void persistScore()} disabled={saving}>
                  <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save ATS Score"}
                </Btn>
              )}
            </Card>
          )}

          {resumes.length > 1 && (
            <div>
              <h2 className="text-[14px] font-black mb-3" style={{ color: CARBON }}>Version History</h2>
              {resumes.map((r) => (
                <Card key={r.id} className="px-4 py-3 mb-2 flex items-center gap-4">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold" style={{ color: CARBON }}>{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">{r.updatedAt.split("T")[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-black" style={{ color: (r.atsScore || 0) >= 75 ? "#10B981" : FLAME }}>{r.atsScore || 0}/100</p>
                  </div>
                  <button
                    onClick={() => setActiveResumeId(r.id)}
                    disabled={active?.id === r.id}
                    className="text-[11px] font-bold hover:underline disabled:opacity-40 disabled:no-underline"
                    style={{ color: FLAME }}
                  >
                    {active?.id === r.id ? "Active" : "Open"}
                  </button>
                </Card>
              ))}
            </div>
          )}

          {active && displayScore > 0 && (
            <Card className="p-4" hover={false} style={{ borderColor: "rgba(241,80,37,0.15)" }}>
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4" style={{ color: FLAME }} /><span className="text-[13px] font-black" style={{ color: CARBON }}>Resume Impact</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Career Score", value: `+${Math.max(0, displayScore - 50)}pts`, sub: `ATS score ${displayScore}/100` },
                  { label: "Keywords Found", value: String(detected.length), sub: detected.slice(0, 3).join(", ") || "Add more tech terms" },
                  { label: "Gaps", value: String(missing.length), sub: missing.slice(0, 2).join(", ") || "Looking good" },
                ].map((m) => (
                  <div key={m.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: ALABASTER }}>
                    <p className="text-[13px] font-black" style={{ color: FLAME }}>{m.value}</p>
                    <p className="text-[11px] font-bold" style={{ color: CARBON }}>{m.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4" style={{ color: FLAME }} /><span className="text-[13px] font-black">ATS Score</span></div>
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="38" fill="none" strokeWidth="7" style={{ stroke: ALABASTER }} />
                  <circle cx="48" cy="48" r="38" fill="none" strokeWidth="7" strokeLinecap="round" style={{ stroke: FLAME }} strokeDasharray={`${displayScore * 2.39} 239`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: CARBON }}>{displayScore}</span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
              </div>
            </div>
            {[{ l: "Impact", v: breakdown.impact }, { l: "Clarity", v: breakdown.clarity }, { l: "Keywords", v: breakdown.keywords }, { l: "ATS", v: breakdown.ats }].map((m) => (
              <div key={m.l} className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-muted-foreground w-14">{m.l}</span>
                <Bar pct={m.v} h={4} className="flex-1" />
                <span className="text-[11px] font-black w-6 text-right" style={{ color: CARBON }}>{m.v}</span>
              </div>
            ))}
          </Card>
          <Card className="p-5" hover={false}>
            <h3 className="text-[13px] font-black mb-3" style={{ color: CARBON }}>Recommendations</h3>
            {detected.length > 0 && (
              <>
                <p className="text-[11px] font-black text-emerald-600 mb-1.5 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Detected</p>
                {detected.slice(0, 4).map((s) => <p key={s} className="text-[12px] text-muted-foreground mb-1 ml-5">· {s}</p>)}
              </>
            )}
            {suggestions.length > 0 && (
              <>
                <p className="text-[11px] font-black text-amber-600 mt-3 mb-1.5 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />To Improve</p>
                {suggestions.map((s) => <p key={s} className="text-[12px] text-muted-foreground mb-1 ml-5">· {s}</p>)}
              </>
            )}
            <Btn size="sm" className="w-full mt-3" onClick={() => { navigate("/app/coach"); toast.info("Opening AI Coach with resume context..."); }}>
              <Brain className="w-3.5 h-3.5" /> Get AI Rewrite
            </Btn>
          </Card>
          {(hasResumeReview || hasFullRewrite) && (
            <Card className="p-5" hover={false} style={{ borderColor: "rgba(16,185,129,0.25)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: FLAME }} />
                <span className="text-[13px] font-black" style={{ color: CARBON }}>Premium Services Active</span>
              </div>
              {hasResumeReview && (
                <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: "rgba(16,185,129,0.06)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold" style={{ color: CARBON }}>Resume Review</span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Applied</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Keyword optimization boosts your ATS breakdown</p>
                </div>
              )}
              {hasFullRewrite && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(16,185,129,0.06)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold" style={{ color: CARBON }}>CV Full Rewrite</span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Applied</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Professional rewrite service unlocked</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <Modal open={showAddSection} onClose={() => setShowAddSection(false)} title="Add Section">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {SECTION_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setNewSection((p) => ({ ...p, type: t.id, title: t.label }))}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold"
                style={{ backgroundColor: newSection.type === t.id ? FLAME : ALABASTER, color: newSection.type === t.id ? "white" : "#6B6F6B" }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={newSection.title}
            onChange={(e) => setNewSection((p) => ({ ...p, title: e.target.value }))}
            placeholder="Section title"
            className="w-full h-10 px-3 rounded-xl border border-border text-[13px]"
          />
          <textarea
            value={newSection.content}
            onChange={(e) => setNewSection((p) => ({ ...p, content: e.target.value }))}
            placeholder="Section content..."
            rows={6}
            className="w-full px-3 py-2 rounded-xl border border-border text-[13px] resize-none"
          />
          <div className="flex gap-3">
            <Btn variant="outline" full onClick={() => setShowAddSection(false)}>Cancel</Btn>
            <Btn full onClick={() => {
              if (!active) return;
              void addSection(active.id, newSection).then(() => {
                setShowAddSection(false);
                setNewSection({ type: "summary", title: "Summary", content: "" });
              });
            }}>Add</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={editingSection !== null} onClose={() => setEditingSection(null)} title="Edit Section">
        {editingSection && active && (
          <div className="space-y-4">
            <input
              value={editingSection.title}
              onChange={(e) => setEditingSection((p) => p ? { ...p, title: e.target.value } : p)}
              className="w-full h-10 px-3 rounded-xl border border-border text-[13px]"
            />
            <textarea
              value={editingSection.content}
              onChange={(e) => setEditingSection((p) => p ? { ...p, content: e.target.value } : p)}
              rows={8}
              className="w-full px-3 py-2 rounded-xl border border-border text-[13px] resize-none"
            />
            <div className="flex gap-3">
              <Btn variant="outline" full onClick={() => setEditingSection(null)}>Cancel</Btn>
              <Btn full onClick={() => {
                void updateSection(active.id, editingSection.id, {
                  title: editingSection.title,
                  content: editingSection.content,
                }).then(() => setEditingSection(null));
              }}>Save</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
