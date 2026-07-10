'use client';

import { useState } from "react";
import { useNavigate, useSearchParams } from "@/lib/router";
import { toast } from "sonner";
import { RefreshCw, Check, Sparkles, Cpu, Trash2, BookOpen, Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { FLAME, CARBON, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Field } from "../components/Field";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { useCareerData } from "../contexts/CareerDataContext";
import { EmptyState } from "../components/EmptyState";

export default function LearningPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterGoalId = searchParams.get("goalId") ? Number(searchParams.get("goalId")) : null;
  const { learningSteps, toggleStep, deleteLearningStep, addLearningItem } = useCareerData();
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepTag, setNewStepTag] = useState("Skills");

  const filteredSteps = filterGoalId
    ? learningSteps.filter((s) => s.goalLegacyId === filterGoalId)
    : learningSteps;

  const done = filteredSteps.filter(s => s.done).length;

  const clearFilter = () => {
    setSearchParams({});
  };

  return (
    <div>
      <PageHeader
        title="Learning Plan"
        subtitle="AI-generated roadmap to Senior Engineer."
        action={
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" onClick={() => setShowAddStep(true)}><Plus className="w-3.5 h-3.5" /> Add Step</Btn>
          </div>
        }
      />

      {filterGoalId && (
        <div className="mb-4 flex items-center justify-between p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[12px] font-medium">
          <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Filtered by Goal Roadmap</span>
          <button onClick={clearFilter} className="underline font-bold hover:text-orange-700">Clear Filter</button>
        </div>
      )}

      <Card className="p-5 mb-5" hover={false}>
        <div className="flex justify-between mb-3">
          <div><p className="text-[13px] font-black" style={{ color: CARBON }}>Plan Progress</p><p className="text-[12px] text-muted-foreground">{done} of {filteredSteps.length} steps · Completing steps improves your skills</p></div>
          <span className="text-2xl font-black" style={{ color: FLAME }}>{filteredSteps.length > 0 ? Math.round((done / filteredSteps.length) * 100) : 0}%</span>
        </div>
        <Bar pct={filteredSteps.length > 0 ? (done / filteredSteps.length) * 100 : 0} h={6} />
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "#6B6F6B" }}>
            <Cpu className="w-3.5 h-3.5" /> Each step you complete updates your skill levels and job match scores.
          </div>
          <button onClick={() => navigate("/app/skills")} className="text-[11px] font-bold hover:underline" style={{ color: FLAME }}>View Skills →</button>
        </div>
      </Card>

      {filteredSteps.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" style={{ color: FLAME }} />}
          title="No learning steps yet"
          description="Learning steps are generated based on your goals. Create a goal first, then come back here to see your personalized roadmap."
          action={{ label: "Go to Goals", onClick: () => navigate("/app/goals") }}
        />
      ) : (
        filteredSteps.map((step, i) => {
        const linkedSkill = step.tag;
        return (
          <div key={step.id} className="flex gap-3 mb-1">
            <div className="flex flex-col items-center">
              <button onClick={() => toggleStep(step.id)} className="w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all"
                style={step.done ? { backgroundColor: FLAME, borderColor: FLAME } : step.active ? { borderColor: FLAME, backgroundColor: "rgba(241,80,37,0.08)" } : { borderColor: DUST, backgroundColor: "white" }}>
                {step.done ? <Check className="w-3.5 h-3.5 text-white" /> : step.active ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: FLAME }} /> : null}
              </button>
              {i < filteredSteps.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
            </div>
            <Card className={cn("flex-1 px-4 py-3 mb-3", step.active && "border-orange-200")} hover={false}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className={cn("text-[13px] font-bold", step.done ? "line-through text-muted-foreground" : "")} style={!step.done ? { color: CARBON } : {}}>{step.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">{step.range}</span>
                    <Chip variant={step.done ? "green" : step.active ? "flame" : "ghost"}>{step.done ? "Done" : step.active ? "In Progress" : step.tag}</Chip>
                    {linkedSkill && <button onClick={() => navigate("/app/skills")} className="text-[10px] font-bold hover:underline" style={{ color: FLAME }}>→ {linkedSkill} skill</button>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleStep(step.id)} className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:border-orange-200 transition-all">
                    {step.done ? "Undo" : "Mark Done"}
                  </button>
                  <button onClick={() => deleteLearningStep(step.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        );
      })
      )}

      <Modal open={showAddStep} onClose={() => setShowAddStep(false)} title="Add Learning Step">
        <div className="space-y-4">
          <Field label="Step Title" value={newStepTitle} onChange={setNewStepTitle} />
          <Field label="Tag / Skill" value={newStepTag} onChange={setNewStepTag} />
          <div className="flex gap-3">
            <Btn variant="outline" full onClick={() => setShowAddStep(false)}>Cancel</Btn>
            <Btn full onClick={() => {
              if (!newStepTitle.trim()) { toast.error("Enter a step title"); return; }
              addLearningItem(filterGoalId, newStepTitle.trim(), newStepTag.trim());
              setNewStepTitle("");
              setShowAddStep(false);
            }}>Add Step</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
