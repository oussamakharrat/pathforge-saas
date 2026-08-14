'use client';

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "@/lib/router";
import { toast } from "sonner";
import { Plus, Search, Sparkles, X, Mic, DollarSign, Pencil, Trash2, Briefcase, Calendar, FileText } from "lucide-react";
import { FLAME, CARBON, ALABASTER } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { PageHeader } from "../components/PageHeader";
import { KANBAN_COLS } from "../lib/constants";
import { useCareerData } from "../contexts/CareerDataContext";
import { useJobs } from "../contexts/JobsContext";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";
import { api } from "@/lib/api";
import type { KanbanCard, KanbanCol } from "../data/types";

export default function JobTrackerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("skill") || "";
  const { skills, goals, trackApplication, trackInterview, trackOffer, recalculateJobMatch } = useCareerData();
  const { kanban: cols, moveCard, addCard, removeCard, updateApplicationNotes } = useJobs();

  const [dragging, setDragging] = useState<{ card: KanbanCard; from: KanbanCol } | null>(null);
  const [dragOver, setDragOver] = useState<KanbanCol | null>(null);
  const [selected, setSelected] = useState<KanbanCard | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [showAddCard, setShowAddCard] = useState<KanbanCol | null>(null);
  const [newCard, setNewCard] = useState({ company: "", role: "", salary: "$", notes: "", logo: "" });
  const [linkGoalId, setLinkGoalId] = useState<string>("");
  const [confirmDeleteCard, setConfirmDeleteCard] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState("");
  const [appDetail, setAppDetail] = useState<Record<string, unknown> | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "interviews" | "offers">("overview");
  const [interviewType, setInterviewType] = useState("behavioral");
  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().split("T")[0]);
  const [offerAmount, setOfferAmount] = useState("");

  useEffect(() => {
    if (!selected) {
      setAppDetail(null);
      setDetailTab("overview");
      return;
    }
    void api.getApplication(selected.id).then(setAppDetail).catch(() => setAppDetail(null));
  }, [selected]);

  // Dynamic match scores computed from current skills
  const skillPcts = useMemo(() => skills.map(s => ({ name: s.name, pct: s.pct })), [skills]);

  useEffect(() => {
    queueMicrotask(() => {
      if (initialSearch) setSearch(initialSearch);
    });
  }, [initialSearch]);

  const total = Object.values(cols).reduce((s, a) => s + a.length, 0);

  const handleDrop = (to: KanbanCol) => {
    if (!dragging || dragging.from === to) { setDragging(null); setDragOver(null); return; }
    void moveCard(dragging.card.id, dragging.from, to);
    const col = KANBAN_COLS.find(c => c.id === to);
    toast.success(`${dragging.card.company} moved to ${col?.label}`);

    if (to === "applied" && dragging.from === "saved") trackApplication();
    if (to === "interview") {
      trackInterview();
      toast.info("🎯 Interview added! Start mock interview prep now.", {
        action: { label: "Prep Now", onClick: () => navigate(`/app/interview?company=${dragging.card.company}&role=${dragging.card.role}`) }
      });
    }
    if (to === "offer") {
      trackOffer();
      toast.success("🎉 Offer received! Open Salary Negotiation Agent?", {
        action: { label: "Negotiate", onClick: () => navigate(`/app/negotiate?company=${dragging.card.company}&role=${dragging.card.role}&salary=${dragging.card.salary}`) }
      });
    }
    setDragging(null); setDragOver(null);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchParams({});
  };

  return (
    <div>
      <PageHeader
        title="Job Tracker"
        subtitle={`${total} applications · Drag cards to update status`}
        action={
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => {
                  const val = e.target.value;
                  setSearch(val);
                  if (!val) clearSearch();
                }}
                placeholder="Search..."
                className="h-9 pl-9 pr-4 rounded-xl border border-border bg-white text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-32 sm:w-44"
              />
            </div>
            <Btn size="sm" onClick={() => { setNewCard({ company: "", role: "", salary: "$", notes: "", logo: "" }); setShowAddCard("saved"); }}><Plus className="w-3.5 h-3.5" /> Add Job</Btn>
          </div>
        }
      />

      {total === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-12 h-12" style={{ color: FLAME }} />}
          title="No jobs tracked yet"
          description="Add your first job application to start tracking your progress across every stage of the pipeline."
          action={{ label: "Add a Job", onClick: () => { setNewCard({ company: "", role: "", salary: "$", notes: "", logo: "" }); setShowAddCard("saved"); } }}
        />
      ) : (
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 520 }}>
        {KANBAN_COLS.map(col => {
          const cards = cols[col.id].filter(c => {
            if (!search) return true;
            const query = search.toLowerCase();
            const isCompanyMatch = c.company.toLowerCase().includes(query);
            const isRoleMatch = c.role.toLowerCase().includes(query);
            return isCompanyMatch || isRoleMatch;
          });
          return (
            <div key={col.id} className="flex-shrink-0 w-60 flex flex-col rounded-2xl border-2 transition-all duration-150"
              style={{ borderColor: dragOver === col.id ? FLAME : "transparent" }}
              onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.id)}>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl mb-2" style={{ backgroundColor: col.color + "18" }}>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} /><span className="text-[12px] font-black" style={{ color: CARBON }}>{col.label}</span></div>
                <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md" style={{ backgroundColor: col.color + "25", color: col.color }}>{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2 px-2 flex-1">
                {cards.map(card => {
                  const dynMatch = recalculateJobMatch(card.company, skillPcts);
                  return (
                    <div key={card.id} draggable onDragStart={() => setDragging({ card, from: col.id })} onClick={() => setSelected(card)}
                      className="bg-white border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-orange-200 transition-all select-none"
                      style={{ opacity: dragging?.card.id === card.id ? 0.4 : 1 }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0" style={{ backgroundColor: CARBON }}>{card.logo}</div>
                        <div className="flex-1 min-w-0"><p className="text-[12px] font-black truncate" style={{ color: CARBON }}>{card.company}</p><p className="text-[11px] text-muted-foreground truncate">{card.role}</p></div>
                      </div>
                      <p className="text-[11px] font-black mb-1.5" style={{ color: CARBON }}>{card.salary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dynMatch >= 85 ? "#10B981" : dynMatch >= 70 ? FLAME : "#EF4444" }} /><span className="text-[10px] font-black" style={{ color: dynMatch >= 85 ? "#10B981" : dynMatch >= 70 ? FLAME : "#EF4444" }}>{dynMatch}% match</span></div>
                        {card.date && <span className="text-[10px] text-muted-foreground">{card.date}</span>}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => { setNewCard({ company: "", role: "", salary: "$", notes: "", logo: "" }); setShowAddCard(col.id); }} className="w-full py-2.5 rounded-xl border border-dashed border-border text-[11px] font-bold text-muted-foreground hover:border-orange-200 transition-all flex items-center justify-center gap-1 mt-1"><Plus className="w-3 h-3" /> Add</button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {selected && (() => {
        const dynMatchSelected = recalculateJobMatch(selected.company, skillPcts);
        const cardColId = Object.keys(cols).find(colId => cols[colId as KanbanCol].some(c => c.id === selected.id)) as KanbanCol;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <Card className="relative w-full max-w-md p-6 shadow-2xl z-10" hover={false}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl flex items-center justify-center text-[13px] font-black text-white" style={{ backgroundColor: CARBON }}>{selected.logo}</div><div><h2 className="text-[16px] font-black" style={{ color: CARBON }}>{selected.company}</h2><p className="text-[13px] text-muted-foreground">{selected.role}</p></div></div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setConfirmDeleteCard(selected.id); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: ALABASTER }}><p className="text-[11px] text-muted-foreground mb-0.5">Salary</p><p className="text-[13px] font-black" style={{ color: CARBON }}>{selected.salary}</p></div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: ALABASTER }}><p className="text-[11px] text-muted-foreground mb-0.5">Match</p><p className="text-[13px] font-black" style={{ color: dynMatchSelected >= 85 ? "#10B981" : FLAME }}>{dynMatchSelected}%</p></div>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: ALABASTER }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-muted-foreground">Notes</p>
                  <button onClick={() => { setEditingNotes(!editingNotes); setEditNotesText(selected.notes); }} className="text-[10px] font-bold flex items-center gap-1 hover:underline" style={{ color: FLAME }}>
                    <Pencil className="w-3 h-3" /> {editingNotes ? "Cancel" : "Edit"}
                  </button>
                </div>
                {editingNotes ? (
                  <div className="flex flex-col gap-2">
                    <textarea value={editNotesText} onChange={e => setEditNotesText(e.target.value)} rows={3}
                      className="w-full rounded-xl border border-border text-[13px] text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      style={{ backgroundColor: "white" }} />
                    <button onClick={async () => {
                      try {
                        await updateApplicationNotes(selected.id, editNotesText);
                        setSelected(prev => prev ? { ...prev, notes: editNotesText } : null);
                        setEditingNotes(false);
                        toast.success("Notes saved");
                      } catch {
                        toast.error("Failed to save notes");
                      }
                    }} className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border hover:border-orange-200 transition-all self-end" style={{ color: FLAME }}>Save Notes</button>
                  </div>
                ) : (
                  <p className="text-[13px]" style={{ color: CARBON }}>{selected.notes}</p>
                )}
              </div>
              <div className="flex gap-1 mb-3">
                {(["overview", "interviews", "offers"] as const).map((tab) => (
                  <button key={tab} onClick={() => setDetailTab(tab)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize"
                    style={{ backgroundColor: detailTab === tab ? FLAME : ALABASTER, color: detailTab === tab ? "white" : "#6B6F6B" }}>
                    {tab}
                  </button>
                ))}
              </div>

              {detailTab === "interviews" && (
                <div className="space-y-3 mb-3">
                  {((appDetail?.interviews as Record<string, unknown>[]) ?? []).map((iv) => (
                    <div key={String(iv.id)} className="p-3 rounded-xl border border-border text-[12px]">
                      <p className="font-bold" style={{ color: CARBON }}>{String(iv.type)} · {String(iv.date).split("T")[0]}</p>
                      <p className="text-muted-foreground">{String(iv.status ?? "scheduled")}{iv.score != null ? ` · Score ${iv.score}` : ""}</p>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl" style={{ backgroundColor: ALABASTER }}>
                    <p className="text-[11px] font-black mb-2" style={{ color: CARBON }}>Schedule Interview</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} className="h-9 px-2 rounded-lg border border-border text-[12px]">
                        <option value="behavioral">Behavioral</option>
                        <option value="technical">Technical</option>
                        <option value="system_design">System Design</option>
                      </select>
                      <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="h-9 px-2 rounded-lg border border-border text-[12px]" />
                    </div>
                    <Btn size="sm" full onClick={async () => {
                      try {
                        await api.createInterview(selected.id, {
                          type: interviewType,
                          date: interviewDate,
                          company: selected.company,
                          role: selected.role,
                        });
                        const detail = await api.getApplication(selected.id);
                        setAppDetail(detail);
                        if (cardColId !== "interview" && cardColId !== "final" && cardColId !== "offer") {
                          await moveCard(selected.id, cardColId, "interview");
                        }
                        trackInterview();
                        toast.success("Interview scheduled");
                      } catch {
                        toast.error("Failed to schedule interview");
                      }
                    }}><Calendar className="w-3.5 h-3.5" /> Schedule</Btn>
                  </div>
                </div>
              )}

              {detailTab === "offers" && (
                <div className="space-y-3 mb-3">
                  {((appDetail?.offers as Record<string, unknown>[]) ?? []).map((of) => {
                    const salary = of.baseSalary as Record<string, unknown> | undefined;
                    return (
                      <div key={String(of.id)} className="p-3 rounded-xl border border-border text-[12px]">
                        <p className="font-bold" style={{ color: CARBON }}>{String(of.company)} — {String(of.role)}</p>
                        <p className="text-muted-foreground">${Number(salary?.amount ?? 0).toLocaleString()} {String(salary?.currency ?? "USD")}</p>
                      </div>
                    );
                  })}
                  <div className="p-3 rounded-xl" style={{ backgroundColor: ALABASTER }}>
                    <p className="text-[11px] font-black mb-2" style={{ color: CARBON }}>Record Offer</p>
                    <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder="Base salary (USD)"
                      className="w-full h-9 px-3 rounded-lg border border-border text-[12px] mb-2" />
                    <Btn size="sm" full onClick={async () => {
                      const amount = parseInt(offerAmount) || 0;
                      if (amount < 1000) { toast.error("Enter a valid salary amount"); return; }
                      try {
                        await api.addOffer(selected.id, {
                          company: selected.company,
                          role: selected.role,
                          baseSalary: { amount, currency: "USD" },
                        });
                        const detail = await api.getApplication(selected.id);
                        setAppDetail(detail);
                        if (cardColId !== "offer") {
                          await moveCard(selected.id, cardColId, "offer");
                        }
                        trackOffer();
                        setOfferAmount("");
                        toast.success("Offer recorded");
                      } catch {
                        toast.error("Failed to record offer");
                      }
                    }}><FileText className="w-3.5 h-3.5" /> Save Offer</Btn>
                  </div>
                </div>
              )}

              {detailTab === "overview" && (
              <>
              <div className="p-3 rounded-xl flex items-start gap-2" style={{ backgroundColor: "rgba(241,80,37,0.04)", border: `1px solid rgba(241,80,37,0.2)` }}>
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: FLAME }} />
                <div><p className="text-[11px] font-black mb-1" style={{ color: CARBON }}>Tip</p><p className="text-[12px] text-muted-foreground leading-relaxed">{dynMatchSelected >= 85 ? "Strong match! Apply with confidence and emphasize your top skills." : "Close match. Highlight system design and relevant project experience."}</p></div>
              </div>
              </>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Btn full disabled={cardColId !== "saved"} onClick={() => {
                    if (cardColId !== "saved") return;
                    void moveCard(selected.id, "saved", "applied").then(() => {
                      trackApplication();
                      toast.success(`Application submitted to ${selected.company}!`);
                      setSelected(null);
                    });
                  }}>{cardColId === "saved" ? "Apply Now" : "Applied"}</Btn>
                  <Btn variant="outline" onClick={() => { navigate(`/app/interview?company=${selected.company}&role=${selected.role}`); setSelected(null); }}><Mic className="w-3.5 h-3.5" /> Prep</Btn>
                </div>
                {cardColId === "offer" && (
                  <Btn full className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { navigate(`/app/negotiate?company=${selected.company}&role=${selected.role}&salary=${selected.salary}`); setSelected(null); }}><DollarSign className="w-4 h-4" /> Negotiate Offer</Btn>
                )}
              </div>
            </div>
          </Card>
        </div>
      );
      })()}

      <Modal open={showAddCard !== null} onClose={() => setShowAddCard(null)} title="Add Job">
        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Company</label>
            <input value={newCard.company} onChange={e => setNewCard(p => ({ ...p, company: e.target.value, logo: e.target.value.charAt(0).toUpperCase() || "?" }))}
              placeholder="e.g. Google"
              className="w-full h-11 px-4 rounded-xl border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: ALABASTER }} />
          </div>
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Role</label>
            <input value={newCard.role} onChange={e => setNewCard(p => ({ ...p, role: e.target.value }))}
              placeholder="e.g. Senior SWE"
              className="w-full h-11 px-4 rounded-xl border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: ALABASTER }} />
          </div>
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Salary Range</label>
            <input value={newCard.salary} onChange={e => setNewCard(p => ({ ...p, salary: e.target.value }))}
              placeholder="$150–200k"
              className="w-full h-11 px-4 rounded-xl border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: ALABASTER }} />
          </div>
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Notes</label>
            <textarea value={newCard.notes} onChange={e => setNewCard(p => ({ ...p, notes: e.target.value }))} rows={2}
              placeholder="Any notes about this position..."
              className="w-full rounded-xl border border-border text-[13px] text-foreground placeholder:text-muted-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              style={{ backgroundColor: ALABASTER }} />
          </div>
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Link to goal (optional)</label>
            <select value={linkGoalId} onChange={e => setLinkGoalId(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: ALABASTER }}>
              <option value="">No goal linked</option>
              {goals.map(g => (
                <option key={g.id} value={g.apiId}>{g.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Add to column</label>
            <div className="flex flex-wrap gap-1.5">
              {KANBAN_COLS.map(col => (
                <button key={col.id} onClick={() => setShowAddCard(col.id)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  style={{ backgroundColor: showAddCard === col.id ? FLAME : ALABASTER, color: showAddCard === col.id ? "white" : "#6B6F6B" }}>
                  {col.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Btn variant="outline" full onClick={() => setShowAddCard(null)}>Cancel</Btn>
            <Btn full onClick={() => {
              if (!newCard.company.trim() || !newCard.role.trim() || !showAddCard) { toast.error("Company and role are required"); return; }
              void addCard(showAddCard, {
                company: newCard.company.trim(),
                role: newCard.role.trim(),
                salary: newCard.salary || "$—",
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                match: recalculateJobMatch(newCard.company.trim(), skillPcts),
                notes: newCard.notes || "",
                logo: newCard.company.trim().charAt(0).toUpperCase(),
              }, linkGoalId || undefined);
              setShowAddCard(null);
              setLinkGoalId("");
              setNewCard({ company: "", role: "", salary: "$", notes: "", logo: "" });
            }}>Add Job</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={confirmDeleteCard !== null} onClose={() => setConfirmDeleteCard(null)} maxWidth="sm" className="text-center">
        <Trash2 className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h2 className="text-[16px] font-black mb-2" style={{ color: CARBON }}>Remove this job?</h2>
        <p className="text-[13px] text-muted-foreground mb-5">This will remove the card from your tracker.</p>
        <div className="flex gap-3">
          <Btn variant="outline" full onClick={() => setConfirmDeleteCard(null)}>Cancel</Btn>
          <Btn variant="danger" full onClick={() => {
            if (confirmDeleteCard) {
              const colId = (Object.keys(cols) as KanbanCol[]).find((c) =>
                cols[c].some((card) => card.id === confirmDeleteCard),
              );
              if (colId) void removeCard(confirmDeleteCard, colId);
            }
            setSelected(null);
            setConfirmDeleteCard(null);
          }}>Remove</Btn>
        </div>
      </Modal>
    </div>
  );
}
