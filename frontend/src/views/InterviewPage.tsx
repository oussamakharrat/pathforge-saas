'use client';

import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "@/lib/router";
import { toast } from "sonner";
import { Mic, ArrowRight, Award, Brain, PlayCircle, Briefcase, Building, Sparkles } from "lucide-react";
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Bar } from "../components/Bar";
import { Field } from "../components/Field";
import { INTERVIEW_QUESTIONS } from "../data/initial-data";
import { useCareerData } from "../contexts/CareerDataContext";

// Rubric-based scoring: evaluates answer quality on length, structure, and keyword depth
function scoreAnswer(answer: string, type: string): { score: number; feedback: string } {
  const text = answer.trim();
  const wordCount = text.split(/\s+/).length;

  // Length score (0-40 points)
  let lengthScore = 0;
  if (wordCount >= 80) lengthScore = 40;
  else if (wordCount >= 50) lengthScore = 32;
  else if (wordCount >= 30) lengthScore = 22;
  else if (wordCount >= 15) lengthScore = 12;
  else lengthScore = 5;

  // Structure score (0-30 points) — look for numbered lists, bullets, STAR markers
  let structureScore = 0;
  const hasNumbers = /^\d+[.)]/m.test(text);
  const hasBullets = /^[•\-→]/m.test(text);
  const hasSTAR = /\b(Situation|Task|Action|Result|STAR)\b/i.test(text);
  const hasArrows = /→/.test(text);
  const hasSection = /(First|Second|Third|Finally|Initially|Then|After)\b/i.test(text);
  const structureHints = [hasNumbers, hasBullets, hasSTAR, hasArrows, hasSection].filter(Boolean).length;
  structureScore = Math.min(30, structureHints * 6);

  // Depth score (0-30 points) — look for technical terms and concrete details
  const depthTerms = type === "technical" || type === "system"
    ? ["scale", "latency", "throughput", "consistency", "availability", "partition", "cache", "queue",
       "database", "shard", "replica", "load balancer", "microservice", "async", "event", "stream",
       "p99", "sla", "failover", "backup", "monitor", "observability", "metric", "alert"]
    : ["example", "project", "team", "led", "built", "shipped", "designed", "architected",
       "improved", "reduced", "increased", "launched", "mentored", "collaborated", "result",
       "impact", "outcome", "lesson", "challenge", "conflict", "resolve"];

  const lower = text.toLowerCase();
  const termMatches = depthTerms.filter(t => lower.includes(t)).length;
  let depthScore = Math.min(30, termMatches * 6);

  // Specific number mention bonus
  const hasNumbers_detail = /\d+[%x]/.test(text) || /\d{3,}/.test(text);
  if (hasNumbers_detail) depthScore = Math.min(30, depthScore + 5);

  const totalScore = lengthScore + structureScore + depthScore;
  const clamped = Math.min(98, Math.max(15, totalScore));

  // Generate contextual feedback
  let feedback = "";
  if (wordCount < 20) feedback = "Answer is too brief. Expand with specific details and examples.";
  else if (structureHints === 0) feedback = "Good start. Add structure — use bullet points or a framework like STAR.";
  else if (termMatches < 2) feedback = "Relevant answer. Include more technical specifics to strengthen your response.";
  else if (clamped >= 80) feedback = "Strong, well-structured answer with good technical depth and concrete examples.";
  else if (clamped >= 60) feedback = "Solid response. Add more metrics and specific outcomes to elevate it further.";
  else feedback = "Decent foundation. Try using a clear structure and quantifying your impact.";

  return { score: clamped, feedback };
}

export default function InterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCompany = searchParams.get("company") || "";
  const initialRole = searchParams.get("role") || "";
  const { completeMockInterview, purchasedServices } = useCareerData();
  const hasInterviewCoach = purchasedServices.includes("Interview Coaching");

  const [screen, setScreen] = useState<"setup" | "interview" | "scorecard">("setup");
  const [role, setRole] = useState(initialRole || "Senior Software Engineer");
  const [company, setCompany] = useState(initialCompany || "Vercel");
  const [type, setType] = useState<"behavioral" | "technical" | "system">("technical");
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<{ q: string; a: string; score: number; feedback: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const questions = useMemo(() => {
    const base = INTERVIEW_QUESTIONS[type] || [];
    if (!hasInterviewCoach) return base;
    const premium: Record<string, string[]> = {
      behavioral: [
        "Tell me about a time you influenced a strategic decision without direct authority.",
        "Describe a situation where you had to deliver tough feedback to a peer or manager.",
        "How have you driven engineering excellence across your organization?",
        "Tell me about a time you had to balance technical debt against feature velocity.",
        "Describe your approach to leading through organizational change.",
      ],
      technical: [
        "Design a multi-tenant SaaS database schema that isolates customer data efficiently.",
        "How would you implement optimistic UI updates with rollback guarantees?",
        "Design a rate-limiting system for a high-traffic API gateway handling 100k req/s.",
        "Explain how you'd build a feature flag system with gradual rollouts and A/B testing.",
        "Design a data pipeline processing 10M events/day with exactly-once guarantees.",
      ],
      system: [
        "Design a globally distributed Raft consensus cluster across 5 regions.",
        "How would you architect a serverless computing platform from scratch?",
        "Design a monitoring system that detects anomalies across 10k microservices.",
        "How would you build a multi-region active-active database with conflict resolution?",
        "Design a recommendation engine for a platform with 100M users and 10M items.",
      ],
    };
    return [...base, ...(premium[type] || [])];
  }, [type, hasInterviewCoach]);
  const avgScore = answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length) : 0;

  // Per-question score breakdown for the scorecard
  const scoreBreakdown = useMemo(() => {
    if (answers.length === 0) return null;
    return {
      avg: avgScore,
      best: Math.max(...answers.map(a => a.score)),
      worst: Math.min(...answers.map(a => a.score)),
      trend: answers.length >= 2 ? (answers[answers.length - 1].score - answers[0].score) : 0,
    };
  }, [answers, avgScore]);

  const submitAnswer = () => {
    if (!answer.trim()) { toast.error("Please type your answer before submitting"); return; }
    setLoading(true);
    setTimeout(() => {
      const { score, feedback } = scoreAnswer(answer, type);
      setAnswers(p => [...p, { q: questions[qIndex], a: answer, score, feedback }]);
      setAnswer("");
      setLoading(false);
      if (qIndex + 1 >= questions.length) {
        const newAnswers = [...answers, { q: questions[qIndex], a: answer, score, feedback }];
        const avg = Math.round(newAnswers.reduce((s, a) => s + a.score, 0) / newAnswers.length);
        setScreen("scorecard");
        void completeMockInterview({
          company,
          role,
          type,
          score: avg,
          feedback: `Completed ${type} mock interview with average score ${avg}/100`,
          answers: newAnswers,
        });
        toast.success("Interview complete! Scorecard ready.");
      } else {
        setQIndex(i => i + 1);
        toast.success(`Answer ${qIndex + 1} — Score: ${score}/100`);
      }
    }, 1000);
  };

  if (screen === "scorecard") return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: avgScore >= 80 ? "#10B981" : FLAME }}><Award className="w-8 h-8 text-white" /></div>
        <h1 className="text-xl font-black mb-1" style={{ color: CARBON }}>Interview Complete</h1>
        <p className="text-[12px] text-muted-foreground">{role} at {company} · {type} round</p>
      </div>
      <Card className="p-5 mb-4 text-center" hover={false}>
        <p className="text-[12px] font-black uppercase tracking-widest text-muted-foreground mb-2">Overall Score</p>
        <p className="text-4xl sm:text-6xl font-black mb-2" style={{ color: avgScore >= 80 ? "#10B981" : FLAME }}>{avgScore}</p>
        <p className="text-[13px] text-muted-foreground mb-4">{avgScore >= 80 ? "Strong performance — ready to apply!" : "Good foundation — a few more sessions will sharpen you."}</p>
        <div className="p-3 rounded-xl text-left" style={{ backgroundColor: "rgba(241,80,37,0.05)", border: `1px solid rgba(241,80,37,0.15)` }}>
          <p className="text-[11px] font-black mb-1" style={{ color: CARBON }}>AI Career Insight</p>
          <p className="text-[12px] text-muted-foreground">This {type} interview result has been added to your career profile. Your AI coach will use this to update your interview readiness score and recommend next practice sessions.</p>
        </div>
      </Card>
      {/* Performance breakdown */}
      {scoreBreakdown && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
          <Card className="p-2 sm:p-3 text-center" hover={false}>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground">Average</p>
            <p className="text-lg sm:text-xl font-black" style={{ color: FLAME }}>{scoreBreakdown.avg}</p>
          </Card>
          <Card className="p-2 sm:p-3 text-center" hover={false}>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground">Best</p>
            <p className="text-lg sm:text-xl font-black" style={{ color: "#10B981" }}>{scoreBreakdown.best}</p>
          </Card>
          <Card className="p-2 sm:p-3 text-center" hover={false}>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground">Trend</p>
            <p className="text-lg sm:text-xl font-black" style={{ color: scoreBreakdown.trend >= 0 ? "#10B981" : FLAME }}>
              {scoreBreakdown.trend >= 0 ? `+${scoreBreakdown.trend}` : scoreBreakdown.trend}
            </p>
          </Card>
        </div>
      )}

      <div className="space-y-3 mb-5">
        {answers.map((a, i) => (
          <Card key={i} className="p-4" hover={false}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[12px] font-bold flex-1 pr-4" style={{ color: CARBON }}>Q{i + 1}: {a.q}</p>
              <span className="text-[14px] font-black flex-shrink-0" style={{ color: a.score >= 80 ? "#10B981" : FLAME }}>{a.score}/100</span>
            </div>
            <Bar pct={a.score} color={a.score >= 80 ? "#10B981" : FLAME} h={4} />
            <p className="text-[11px] text-muted-foreground mt-1">Your answer ({a.a.split(/\s+/).length} words)</p>
            <p className="text-[11px] font-medium mt-1.5" style={{ color: CARBON }}>{a.feedback}</p>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Btn full onClick={() => { setScreen("setup"); setAnswers([]); setQIndex(0); }}><Mic className="w-4 h-4" /> Try Again</Btn>
        <Btn variant="outline" full onClick={() => navigate("/app/coach")}><Brain className="w-3.5 h-3.5" /> Discuss with AI</Btn>
      </div>
    </div>
  );

  if (screen === "interview") return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-base font-black" style={{ color: CARBON }}>{role}</h1><p className="text-[12px] text-muted-foreground">{company} · {type} round</p></div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-muted-foreground">Q {qIndex + 1}/{questions.length}</span>
          <Bar pct={(qIndex / questions.length) * 100} h={4} className="w-24" />
        </div>
      </div>
      <Card className="p-5 mb-4" hover={false} style={{ borderColor: "rgba(241,80,37,0.25)" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: FLAME }}><Mic className="w-3.5 h-3.5 text-white" /></div>
          <span className="text-[12px] font-black" style={{ color: CARBON }}>AI Interviewer</span>
          <span className="ml-auto text-[11px] font-bold text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Recording</span>
        </div>
        <p className="text-[15px] font-bold leading-relaxed" style={{ color: CARBON }}>{questions[qIndex]}</p>
      </Card>
      <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={6}
        placeholder="Type your answer here. Be specific and structured — use STAR format for behavioral questions."
        className="w-full rounded-2xl border border-border text-[13px] text-foreground placeholder:text-muted-foreground px-5 py-4 focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
        style={{ backgroundColor: ALABASTER }} />
      <div className="flex gap-2">
        <Btn full onClick={submitAnswer} disabled={!answer.trim() || loading}>
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Evaluating...</> : <>{qIndex + 1 >= questions.length ? "Finish & Score" : "Submit Answer"} <ArrowRight className="w-4 h-4" /></>}
        </Btn>
        <Btn variant="outline" onClick={() => { setScreen("setup"); toast.info("Interview session ended"); }}>End</Btn>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: FLAME }}><Mic className="w-7 h-7 text-white" /></div>
        <h1 className="text-xl font-black mb-1.5" style={{ color: CARBON }}>Mock Interview</h1>
        <p className="text-[12px] text-muted-foreground">AI-powered interviews with real-time scoring. Results feed into your career profile.</p>
      </div>
      <Card className="p-5" hover={false}>
        <div className="space-y-4">
          <Field label="Target Role" value={role} onChange={setRole} Left={Briefcase} />
          <Field label="Company" value={company} onChange={setCompany} Left={Building} />
          <div>
            <label className="text-[13px] font-black block mb-2" style={{ color: CARBON }}>Interview Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["technical", "behavioral", "system"] as const).map(t => (
                <button key={t} onClick={() => setType(t)} className="py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-[12px] font-black capitalize transition-all border-2 leading-tight"
                  style={{ backgroundColor: type === t ? FLAME : "white", color: type === t ? "white" : "#6B6F6B", borderColor: type === t ? FLAME : DUST }}>
                  {t === "system" ? "System Design" : t}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: ALABASTER }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] font-black" style={{ color: CARBON }}>{questions.length} questions · ~{hasInterviewCoach ? "30–45" : "20–30"} min</p>
              {hasInterviewCoach && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <Sparkles className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground">
              {type === "behavioral" ? "STAR-format leadership and communication questions." : type === "technical" ? "Deep technical architecture and database questions." : "Design large-scale distributed systems from scratch."}
              {hasInterviewCoach && " Includes 5 bonus premium questions."}
            </p>
          </div>
          <Btn full size="lg" onClick={() => { if (!role.trim() || !company.trim()) { toast.error("Please fill in role and company"); return; } setQIndex(0); setAnswers([]); setAnswer(""); setScreen("interview"); toast.info(`Starting ${type} interview for ${role} at ${company}`); }}>
            <PlayCircle className="w-4 h-4" /> Start Interview
          </Btn>
        </div>
      </Card>
    </div>
  );
}
