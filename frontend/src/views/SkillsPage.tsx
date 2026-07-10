'use client';

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Brain, Zap } from "lucide-react";
import { FLAME, CARBON, ALABASTER } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { ImpactBadge } from "../components/ImpactBadge";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";
import { SkillAutocomplete, type SkillCatalogOption } from "../components/SkillAutocomplete";
import { useCareerData } from "../contexts/CareerDataContext";
import { useGamification } from "../contexts/GamificationContext";
import { SKILL_QUIZ_DATA } from "../data/initial-data";
import type { QuizQuestion } from "../data/types";

const NEW_SKILL_CATS = ["Language", "Frontend", "Backend", "Database", "API", "DevOps", "Architecture", "Cloud", "Quality", "Mobile", "AI/ML", "Tools", "Soft Skill"];

function getQuizQuestions(skillName: string): QuizQuestion[] {
  if (SKILL_QUIZ_DATA[skillName]) return SKILL_QUIZ_DATA[skillName];
  const key = Object.keys(SKILL_QUIZ_DATA).find(
    (k) => skillName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(skillName.toLowerCase()),
  );
  if (key) return SKILL_QUIZ_DATA[key];
  return [
    { q: `What best describes your hands-on experience with ${skillName}?`, options: ["No experience", "Tutorial level", "Production projects", "Expert / mentor others"], correct: 2 },
    { q: `How often do you use ${skillName} in your current work?`, options: ["Never", "Occasionally", "Weekly", "Daily"], correct: 3 },
    { q: `Could you explain a real problem you solved using ${skillName}?`, options: ["Not yet", "Only in theory", "Yes, with guidance", "Yes, independently"], correct: 3 },
  ];
}

export default function SkillsPage() {
  const navigate = useNavigate();
  const { skills, addSkill, updateSkill, deleteSkill, submitQuiz } = useCareerData();
  const { referenceSkills } = useGamification();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", cat: "Frontend", level: "Beginner" as string, pct: 25 });
  const [showEdit, setShowEdit] = useState(false);
  const [editSkill, setEditSkill] = useState({ name: "", cat: "", level: "Intermediate" as string, pct: 55 });
  const [confirmDeleteSkill, setConfirmDeleteSkill] = useState<string | null>(null);
  const [quizSkill, setQuizSkill] = useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const cats = ["All", ...Array.from(new Set(skills.map(s => s.cat)))];
  const list = skills.filter(s => (filter === "All" || s.cat === filter) && s.name.toLowerCase().includes(search.toLowerCase()));

  const catalogOptions: SkillCatalogOption[] = referenceSkills.map((skill) => ({
    id: String(skill.id),
    name: String(skill.name),
    category: String(skill.category ?? 'Tools'),
    marketDemand: skill.marketDemand ? String(skill.marketDemand) : undefined,
  }));

  const startQuiz = (skillName: string) => {
    setQuizSkill(skillName);
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizDone(false);
  };

  const quizQuestions = quizSkill ? getQuizQuestions(quizSkill) : [];
  const currentQ = quizQuestions[quizIndex];

  const answerQuiz = (optionIdx: number) => {
    if (!quizSkill || !currentQ) return;
    const nextAnswers = [...quizAnswers, optionIdx];
    setQuizAnswers(nextAnswers);
    if (quizIndex + 1 >= quizQuestions.length) {
      const correct = nextAnswers.filter((a, i) => a === quizQuestions[i].correct).length;
      submitQuiz(quizSkill, correct, quizQuestions.length);
      setQuizDone(true);
    } else {
      setQuizIndex(quizIndex + 1);
    }
  };

  const closeQuiz = () => {
    setQuizSkill(null);
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizDone(false);
  };

  return (
    <div>
      <PageHeader
        title="Skills"
        subtitle="Your technical competency map."
        action={<Btn size="sm" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5" /> Add Skill</Btn>}
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[{ label: "Advanced", count: skills.filter(s => s.level === "Advanced").length }, { label: "Intermediate", count: skills.filter(s => s.level === "Intermediate").length }, { label: "Beginner", count: skills.filter(s => s.level === "Beginner").length }].map(s => (
          <Card key={s.label} className="p-3 sm:p-4 text-center" hover={false}><p className="text-xl sm:text-2xl font-black" style={{ color: FLAME }}>{s.count}</p><p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">{s.label}</p></Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <div className="relative flex-1 min-w-[160px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..." className="w-full h-9 pl-9 pr-4 rounded-xl border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" style={{ backgroundColor: ALABASTER }} /></div>
        <div className="flex gap-1.5 flex-wrap">
          {cats.map(c => <button key={c} onClick={() => setFilter(c)} className="px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all" style={{ backgroundColor: filter === c ? FLAME : ALABASTER, color: filter === c ? "white" : "#6B6F6B" }}>{c}</button>)}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(s => {
          const catalogMatch = referenceSkills.find(r => String(r.name) === s.name);
          return (
            <Card key={s.name} className="p-4 group">
              <div className="flex justify-between items-start mb-3">
                <div><p className="text-[13px] font-black" style={{ color: CARBON }}>{s.name}</p><p className="text-[11px] text-muted-foreground">{s.cat}</p></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditSkill({ name: s.name, cat: s.cat, level: s.level, pct: s.pct }); setShowEdit(true); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-secondary transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setConfirmDeleteSkill(s.name)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Chip variant={s.level === "Advanced" ? "flame" : s.level === "Intermediate" ? "amber" : "ghost"}>{s.level}</Chip>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Bar pct={s.pct} h={4} className="flex-1" />
                <span className="text-[11px] font-black text-muted-foreground w-7 text-right">{s.pct}%</span>
              </div>
              {catalogMatch && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  <Chip variant="ghost">Demand: {String(catalogMatch.marketDemand ?? 'medium')}</Chip>
                  <ImpactBadge label="jobs" count={1} onClick={() => navigate(`/app/tracker?skill=${s.name}`)} />
                </div>
              )}
              <button onClick={() => startQuiz(s.name)} className="mt-2.5 w-full py-1.5 rounded-xl border border-border text-[11px] font-bold text-muted-foreground hover:border-orange-200 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                <Brain className="w-3 h-3 inline-block mr-1" /> Take Quiz
              </button>
            </Card>
          );
        })}
      </div>

      {list.length === 0 && skills.length === 0 && (
        <EmptyState
          icon={<Zap className="w-12 h-12" style={{ color: FLAME }} />}
          title="No skills yet"
          description="Start building your skill profile. Add your first technical skill to track your growth."
          action={{ label: "Add a Skill", onClick: () => setShowAdd(true) }}
        />
      )}
      {list.length === 0 && skills.length > 0 && (
        <EmptyState
          icon={<Search className="w-12 h-12" style={{ color: FLAME }} />}
          title="No skills match your search"
          description="Try a different search term or clear the filter."
          action={{ label: "Clear Filters", onClick: () => { setSearch(""); setFilter("All"); } }}
        />
      )}


      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add a Skill">
        <div className="space-y-4">
          {/* Skill Name */}
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Skill Name</label>
            <SkillAutocomplete
              value={newSkill.name}
              onValueChange={(name, option) => setNewSkill((prev) => ({
                ...prev,
                name,
                cat: option?.category ?? prev.cat,
              }))}
              options={catalogOptions}
              excludeNames={skills.map((skill) => skill.name)}
              placeholder="Search skills or type your own…"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Pick from suggestions or add a custom skill that isn&apos;t listed.
            </p>
          </div>
          {/* Category */}
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Category</label>
            <div className="flex flex-wrap gap-1.5">
              {NEW_SKILL_CATS.map(cat => (
                <button key={cat} onClick={() => setNewSkill(p => ({ ...p, cat }))}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  style={{ backgroundColor: newSkill.cat === cat ? FLAME : ALABASTER, color: newSkill.cat === cat ? "white" : "#6B6F6B" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Proficiency Level */}
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Proficiency</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Beginner", pct: 25, desc: "Learning" },
                { id: "Intermediate", pct: 55, desc: "Hands-on" },
                { id: "Advanced", pct: 82, desc: "Deep expertise" },
              ].map(lvl => (
                <button key={lvl.id} onClick={() => setNewSkill(p => ({ ...p, level: lvl.id, pct: lvl.pct }))}
                  className="p-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    backgroundColor: newSkill.level === lvl.id ? "rgba(241,80,37,0.06)" : "white",
                    borderColor: newSkill.level === lvl.id ? FLAME : "#E6E8E6",
                  }}>
                  <p className="text-[12px] font-black" style={{ color: newSkill.level === lvl.id ? FLAME : CARBON }}>{lvl.id}</p>
                  <p className="text-[10px] text-muted-foreground">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Btn variant="outline" full onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn full onClick={() => {
              if (!newSkill.name.trim()) { toast.error("Please enter a skill name"); return; }
              if (skills.some(s => s.name.toLowerCase() === newSkill.name.trim().toLowerCase())) {
                toast.error(`"${newSkill.name.trim()}" is already in your skills.`);
                return;
              }
              addSkill(newSkill.name.trim(), newSkill.cat, newSkill.level, newSkill.pct);
              setShowAdd(false);
              setNewSkill({ name: "", cat: "Frontend", level: "Beginner", pct: 25 });
            }}>Add Skill</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Skill">
        <div className="space-y-4">
          <div>
            <p className="text-[13px] font-black mb-1" style={{ color: CARBON }}>{editSkill.name}</p>
            <p className="text-[11px] text-muted-foreground">Current: {editSkill.level} · {editSkill.pct}%</p>
          </div>
          {/* Category */}
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Category</label>
            <div className="flex flex-wrap gap-1.5">
              {NEW_SKILL_CATS.map(cat => (
                <button key={cat} onClick={() => setEditSkill(p => ({ ...p, cat }))}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  style={{ backgroundColor: editSkill.cat === cat ? FLAME : ALABASTER, color: editSkill.cat === cat ? "white" : "#6B6F6B" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Proficiency Level */}
          <div>
            <label className="text-[13px] font-black block mb-1.5" style={{ color: CARBON }}>Proficiency</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Beginner", pct: 25, desc: "Learning" },
                { id: "Intermediate", pct: 55, desc: "Hands-on" },
                { id: "Advanced", pct: 82, desc: "Deep expertise" },
              ].map(lvl => (
                <button key={lvl.id} onClick={() => setEditSkill(p => ({ ...p, level: lvl.id, pct: lvl.pct }))}
                  className="p-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    backgroundColor: editSkill.level === lvl.id ? "rgba(241,80,37,0.06)" : "white",
                    borderColor: editSkill.level === lvl.id ? FLAME : "#E6E8E6",
                  }}>
                  <p className="text-[12px] font-black" style={{ color: editSkill.level === lvl.id ? FLAME : CARBON }}>{lvl.id}</p>
                  <p className="text-[10px] text-muted-foreground">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Btn variant="outline" full onClick={() => setShowEdit(false)}>Cancel</Btn>
            <Btn full onClick={() => { updateSkill(editSkill.name, { cat: editSkill.cat, level: editSkill.level, pct: editSkill.pct }); setShowEdit(false); }}>Save Changes</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={quizSkill !== null} onClose={closeQuiz} title={quizDone ? "Quiz Complete" : `Quiz: ${quizSkill}`}>
        {quizDone ? (
          <div className="text-center space-y-4">
            <p className="text-[14px] font-black" style={{ color: CARBON }}>
              {quizAnswers.filter((a, i) => a === quizQuestions[i]?.correct).length}/{quizQuestions.length} correct
            </p>
            <p className="text-[13px] text-muted-foreground">Your skill level has been updated based on your score.</p>
            <Btn full onClick={closeQuiz}>Done</Btn>
          </div>
        ) : currentQ ? (
          <div className="space-y-4">
            <p className="text-[11px] text-muted-foreground">Question {quizIndex + 1} of {quizQuestions.length}</p>
            <p className="text-[14px] font-black" style={{ color: CARBON }}>{currentQ.q}</p>
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answerQuiz(i)}
                  className="w-full text-left p-3 rounded-xl border border-border hover:border-orange-200 text-[13px] font-medium transition-all"
                  style={{ color: CARBON }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={confirmDeleteSkill !== null} onClose={() => setConfirmDeleteSkill(null)} maxWidth="sm" className="text-center">
        <Trash2 className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h2 className="text-[16px] font-black mb-2" style={{ color: CARBON }}>Remove &ldquo;{confirmDeleteSkill}&rdquo;?</h2>
        <p className="text-[13px] text-muted-foreground mb-5">This skill will be removed from your profile. Job matches may be affected.</p>
        <div className="flex gap-3">
          <Btn variant="outline" full onClick={() => setConfirmDeleteSkill(null)}>Cancel</Btn>
          <Btn variant="danger" full onClick={() => { deleteSkill(confirmDeleteSkill!); setConfirmDeleteSkill(null); }}>Remove</Btn>
        </div>
      </Modal>
    </div>
  );
}
