'use client';

import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "@/lib/router";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowRight, Sparkles, Brain, BookOpen, Zap, Layers, Check, Clock, Target, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { FLAME, CARBON, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Chip } from "../components/Chip";
import { Field } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { ImpactBadge } from "../components/ImpactBadge";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";
import { useCareerData } from "../contexts/CareerDataContext";
import { useJobs } from "../contexts/JobsContext";
import { useGamification } from "../contexts/GamificationContext";
import { SkillAutocomplete, type SkillCatalogOption } from "../components/SkillAutocomplete";

// Helper to parse deadline like "Dec 2025" or "Jun 2026" and check if overdue
function isGoalOverdue(deadline: string, progress: number): boolean {
  if (progress >= 100) return false;
  const match = deadline.match(/(\w+)\s*(\d{4})?/);
  if (!match) return false;
  const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const monthIdx = months.indexOf(match[1].toLowerCase().slice(0, 3));
  if (monthIdx === -1) return false;
  const year = match[2] ? parseInt(match[2]) : new Date().getFullYear();
  return new Date(year, monthIdx + 1, 0) < new Date();
}

export default function GoalsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightedSkill = searchParams.get("skill") || "";
  const { goals, learningSteps, skills, addGoal, updateGoal, deleteGoal, toggleMilestone, addMilestone } = useCareerData();
  const { kanban } = useJobs();
  const { referenceSkills } = useGamification();

  const [sel, setSel] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [editGoal, setEditGoal] = useState({ id: 0, title: "", deadline: "" });
  const [newGoal, setNewGoal] = useState({ title: "", deadline: "", skillIds: [] as string[] });
  const [editGoalSkills, setEditGoalSkills] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const goal = goals.find(g => g.id === sel);

  const catalogOptions: SkillCatalogOption[] = referenceSkills.map((skill) => ({
    id: String(skill.id),
    name: String(skill.name),
    category: String(skill.category ?? 'Tools'),
    marketDemand: skill.marketDemand ? String(skill.marketDemand) : undefined,
  }));

  const allApps = useMemo(() => Object.values(kanban).flat(), [kanban]);

  const overdueIds = useMemo(() => {
    return new Set(goals.filter(g => isGoalOverdue(g.deadline, g.progress)).map(g => g.id));
  }, [goals]);

  if (goal) return (
    <div>
      <button onClick={() => setSel(null)} className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground hover:text-foreground mb-4"><ChevronLeft className="w-3.5 h-3.5" /> Back to goals</button>
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <Card className="p-4" hover={false}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black" style={{ color: CARBON }}>{goal.title}</h1>
                  {overdueIds.has(goal.id) && <Chip variant="default"><span className="text-red-500">⚠ Overdue</span></Chip>}
                </div>
                <p className="text-[13px] text-muted-foreground">Due {goal.deadline} · {goal.done}/{goal.steps} steps</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditGoal({ id: goal.id, title: goal.title, deadline: goal.deadline }); setEditGoalSkills(goal.linkedSkills?.map((s) => s.id) ?? []); setShowEdit(true); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDelete(goal.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-2xl font-black ml-2" style={{ color: FLAME }}>{goal.progress}%</span>
              </div>
            </div>
            <Bar pct={goal.progress} h={8} />
            {goal.linkedSkills && goal.linkedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {goal.linkedSkills.map((s) => (
                  <Chip key={s.id} variant="ghost">{s.name}</Chip>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-4" hover={false}>
            <h2 className="text-[14px] font-black mb-3" style={{ color: CARBON }}>Milestones</h2>
            {goal.milestones.length === 0 ? (
              <p className="text-[13px] text-muted-foreground italic">No milestones yet.</p>
            ) : (
              <div className="space-y-2">
                {goal.milestones.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMilestone(goal.id, m.id)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl border border-border hover:border-orange-200 transition-all text-left"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0 mt-0.5"
                      style={m.completed ? { backgroundColor: FLAME, borderColor: FLAME } : { borderColor: DUST }}>
                      {m.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-[13px] font-bold", m.completed && "line-through text-muted-foreground")} style={!m.completed ? { color: CARBON } : {}}>{m.title}</p>
                      {m.description && <p className="text-[11px] text-muted-foreground mt-0.5">{m.description}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddMilestone(true)} className="mt-3 text-[12px] font-bold hover:underline" style={{ color: FLAME }}>+ Add milestone</button>
          </Card>
          <div>
            {(() => {
              const goalSteps = learningSteps.filter((s) => s.goalLegacyId === goal.id);
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[14px] font-black" style={{ color: CARBON }}>Roadmap</h2>
                    <ImpactBadge label="learning steps linked" count={goalSteps.length} onClick={() => navigate(`/app/learning?goalId=${goal.id}`)} />
                  </div>
                  {goalSteps.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground italic bg-secondary p-4 rounded-xl border border-border/60">No learning steps currently linked to this goal. You can add them in the Learning Plan page or ask the AI Coach to suggest some.</p>
                  ) : (
                    goalSteps.map((s, i) => (
                      <div key={s.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 animate-fade-in"
                            style={s.done ? { backgroundColor: FLAME, borderColor: FLAME } : s.active ? { borderColor: FLAME, backgroundColor: "rgba(241,80,37,0.08)" } : { borderColor: DUST, backgroundColor: "var(--card)" }}>
                            {s.done ? <Check className="w-3 h-3 text-white" /> : s.active ? <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: FLAME }} /> : null}
                          </div>
                          {i < goalSteps.length - 1 && <div className="w-px h-6 bg-border" />}
                        </div>
                        <Card className={cn("flex-1 px-4 py-2.5 mb-2 transition-all duration-200", s.active && "border-orange-200 shadow-sm")} hover={false}>
                          <div className="flex justify-between items-center">
                            <span className={cn("text-[13px]", s.done ? "line-through text-muted-foreground" : "font-bold")} style={!s.done ? { color: CARBON } : {}}>{s.title}</span>
                            <div className="flex gap-1.5 items-center">
                              <Chip variant="ghost">{s.range}</Chip>
                              {s.active && <Chip variant="flame">In Progress</Chip>}
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))
                  )}
                </>
              );
            })()}
          </div>
        </div>
        <div className="space-y-3">
          <Card className="p-4" hover={false}>
            <h3 className="text-[12px] font-black mb-2.5" style={{ color: CARBON }}>Next Steps</h3>
            <div className="space-y-2">
              {goal.progress < 100 && (
                <p className="text-[12px]" style={{ color: CARBON }}>
                  {goal.done < goal.steps
                    ? `Complete ${goal.steps - goal.done} more milestone${goal.steps - goal.done > 1 ? 's' : ''} to reach 100%.`
                    : 'Keep working toward your deadline.'}
                </p>
              )}
              {learningSteps.filter((s) => s.goalLegacyId === goal.id && !s.done).length > 0 && (
                <p className="text-[12px]" style={{ color: CARBON }}>
                  {learningSteps.filter((s) => s.goalLegacyId === goal.id && !s.done).length} learning step(s) remaining — open your roadmap to continue.
                </p>
              )}
              {skills.filter((s) => s.pct < 50).length > 0 && (
                <p className="text-[12px]" style={{ color: CARBON }}>
                  Strengthen {skills.filter((s) => s.pct < 50).slice(0, 2).map((s) => s.name).join(' and ')} to improve job matches.
                </p>
              )}
            </div>
          </Card>
          <Card className="p-4" hover={false}>
            <h3 className="text-[12px] font-black mb-2.5" style={{ color: CARBON }}>Connected Modules</h3>
            <div className="space-y-2">
              {(() => {
                const stepCount = learningSteps.filter((s) => s.goalLegacyId === goal.id).length;
                const jobCount = allApps.filter((a) => a.goalId === goal.apiId).length;
                const skillCount = goal.linkedSkills?.length ?? 0;
                return [
                  { label: "Learning Plan", desc: `${stepCount} step${stepCount !== 1 ? 's' : ''} linked`, page: `/app/learning?goalId=${goal.id}`, icon: BookOpen },
                  { label: "Skills", desc: `${skillCount} skill${skillCount !== 1 ? 's' : ''} linked`, page: "/app/skills", icon: Zap },
                  { label: "Job Tracker", desc: `${jobCount} role${jobCount !== 1 ? 's' : ''} in pipeline`, page: "/app/tracker", icon: Layers },
                ];
              })().map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.label} onClick={() => navigate(m.page)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-orange-200 transition-all text-left">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: FLAME }} />
                    <div className="flex-1"><p className="text-[12px] font-bold" style={{ color: CARBON }}>{m.label}</p><p className="text-[11px] text-muted-foreground">{m.desc}</p></div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Career Hub"
        subtitle="Map your journey from where you are to where you want to be."
        action={<Btn size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5" /> New Goal</Btn>}
      />

      {goals.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map(g => {
            const isLinked = highlightedSkill && g.title.toLowerCase().includes(highlightedSkill.toLowerCase());
            return (
              <Card key={g.id} className={cn("p-4 group transition-all duration-300", isLinked ? "ring-2 ring-primary border-primary bg-primary/5" : "", overdueIds.has(g.id) && "border-red-300 bg-red-50/50")} onClick={() => setSel(g.id)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-3">
                    <h3 className="text-[14px] font-black mb-1" style={{ color: CARBON }}>{g.title}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {overdueIds.has(g.id) ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={cn("text-[11px]", overdueIds.has(g.id) ? "text-red-500 font-bold" : "text-muted-foreground")}>
                        {overdueIds.has(g.id) ? "Overdue" : `Due ${g.deadline}`}
                      </span>
                      {isLinked && <span className="ml-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary">Requires {highlightedSkill}</span>}
                    </div>
                  </div>
                  <span className="text-xl font-black" style={{ color: FLAME }}>{g.progress}%</span>
                </div>
                <Bar pct={g.progress} h={5} />
                <div className="flex justify-between mt-2.5 items-center">
                  <span className="text-[11px] text-muted-foreground">{g.done}/{g.steps} steps</span>
                  <span className="text-[11px] font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5" style={{ color: FLAME }}>View <ChevronRight className="w-3 h-3" /></span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Target className="w-12 h-12" style={{ color: FLAME }} />}
          title="No career goals yet"
          description="Goals help you stay focused. Create your first goal to start tracking your career growth."
          action={{ label: "Create a Goal", onClick: () => setShowAdd(true) }}
        />
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Career Goal">
        <div className="space-y-4">
          <Field label="Goal Title" placeholder="e.g. Become a Senior Engineer" value={newGoal.title} onChange={v => setNewGoal(p => ({ ...p, title: v }))} Left={Target} />
          <Field label="Target Deadline" type="month" value={newGoal.deadline} onChange={v => setNewGoal(p => ({ ...p, deadline: v }))} Left={Clock} />
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Linked Skills (optional)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {newGoal.skillIds.map((id) => {
                const skill = catalogOptions.find((s) => s.id === id);
                return skill ? (
                  <Chip key={id} variant="ghost">
                    {skill.name}
                    <button className="ml-1" onClick={() => setNewGoal((p) => ({ ...p, skillIds: p.skillIds.filter((x) => x !== id) }))}>×</button>
                  </Chip>
                ) : null;
              })}
            </div>
            <SkillAutocomplete
              value=""
              onValueChange={(_name, option) => {
                if (option && !newGoal.skillIds.includes(option.id)) {
                  setNewGoal((p) => ({ ...p, skillIds: [...p.skillIds, option.id] }));
                }
              }}
              options={catalogOptions.filter((o) => !newGoal.skillIds.includes(o.id))}
              placeholder="Add skills to track for this goal…"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Btn variant="outline" full onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn full onClick={() => { if (!newGoal.title.trim()) { toast.error("Please enter a goal title"); return; } addGoal(newGoal.title, newGoal.deadline, newGoal.skillIds); setShowAdd(false); setNewGoal({ title: "", deadline: "", skillIds: [] }); }}>Create Goal</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Goal">
        <div className="space-y-4">
          <Field label="Goal Title" placeholder="e.g. Become a Senior Engineer" value={editGoal.title} onChange={v => setEditGoal(p => ({ ...p, title: v }))} Left={Target} />
          <Field label="Target Deadline" type="month" value={editGoal.deadline} onChange={v => setEditGoal(p => ({ ...p, deadline: v }))} Left={Clock} />
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Linked Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {editGoalSkills.map((id) => {
                const skill = catalogOptions.find((s) => s.id === id);
                return skill ? (
                  <Chip key={id} variant="ghost">
                    {skill.name}
                    <button className="ml-1" onClick={() => setEditGoalSkills((prev) => prev.filter((x) => x !== id))}>×</button>
                  </Chip>
                ) : null;
              })}
            </div>
            <SkillAutocomplete
              value=""
              onValueChange={(_name, option) => {
                if (option && !editGoalSkills.includes(option.id)) {
                  setEditGoalSkills((prev) => [...prev, option.id]);
                }
              }}
              options={catalogOptions.filter((o) => !editGoalSkills.includes(o.id))}
              placeholder="Add skills…"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Btn variant="outline" full onClick={() => setShowEdit(false)}>Cancel</Btn>
            <Btn full onClick={() => { if (!editGoal.title.trim()) { toast.error("Please enter a goal title"); return; } updateGoal(editGoal.id, { title: editGoal.title, deadline: editGoal.deadline, skillCatalogIds: editGoalSkills }); setShowEdit(false); }}>Save Changes</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={showAddMilestone} onClose={() => setShowAddMilestone(false)} title="Add Milestone">
        <div className="space-y-4">
          <Field label="Milestone Title" placeholder="e.g. Complete certification" value={newMilestoneTitle} onChange={setNewMilestoneTitle} Left={Target} />
          <div className="flex gap-3 pt-1">
            <Btn variant="outline" full onClick={() => setShowAddMilestone(false)}>Cancel</Btn>
            <Btn full onClick={() => {
              if (!newMilestoneTitle.trim() || sel === null) { toast.error("Enter a milestone title"); return; }
              addMilestone(sel, newMilestoneTitle.trim());
              setNewMilestoneTitle("");
              setShowAddMilestone(false);
            }}>Add</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} maxWidth="sm" className="text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h2 className="text-[16px] font-black mb-2" style={{ color: CARBON }}>Delete this goal?</h2>
        <p className="text-[13px] text-muted-foreground mb-5">This will also remove linked learning steps. This cannot be undone.</p>
        <div className="flex gap-3">
          <Btn variant="outline" full onClick={() => setConfirmDelete(null)}>Cancel</Btn>
          <Btn variant="danger" full onClick={() => { deleteGoal(confirmDelete); setConfirmDelete(null); if (sel === confirmDelete) setSel(null); }}>Delete</Btn>
        </div>
      </Modal>
    </div>
  );
}
