'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "@/lib/router";
import { toast } from "sonner";
import {
  Plus, Search, MessageSquare, Brain, BarChart2, ChevronLeft, ChevronRight,
  FileText, Zap, Mic, DollarSign, Map, Target, ArrowRight, Sparkles,
  X, Send, Upload, ThumbsUp, ThumbsDown, Copy
} from "lucide-react";
import { cn } from "../lib/utils";
import { FLAME, CARBON } from "../lib/constants";
import { RenderAI } from "../components/RenderAI";
import { useCareerData } from "../contexts/CareerDataContext";
import { useCoach } from "../contexts/CoachContext";
import { useAuth } from "../contexts/AuthContext";
import { QUICK_PROMPTS } from "../data/initial-data";
import type { Message } from "../data/types";

const WELCOME_ACTIONS = [
  { icon: FileText,  label: "Improve My Resume",      sub: "ATS optimization & rewrites",   prompt: "Fix my resume" },
  { icon: Zap,       label: "Analyze Skill Gaps",      sub: "Know exactly what to build",    prompt: "What should I learn next?" },
  { icon: Mic,       label: "Interview Prep",           sub: "Practice with AI mock rounds",  prompt: "Why am I not getting interviews?" },
  { icon: DollarSign,label: "Salary Negotiation",      sub: "Earn what you're worth",         prompt: "Create a 30-day plan" },
  { icon: Map,       label: "Learning Roadmap",         sub: "Step-by-step growth plan",      prompt: "What should I learn next?" },
  { icon: Target,    label: "Career Strategy",          sub: "Align goals with actions",      prompt: "What's blocking my career growth?" },
];

export default function CoachPage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const { goals, skills, learningSteps, careerScore } = useCareerData();
  const { profile, user } = useAuth();
  const {
    conversations: convos,
    messages: coachMessages,
    loading: coachLoading,
    loadConversation,
    startConversation,
    sendMessage: sendCoachMessage,
    setActiveConversationId,
  } = useCoach();

  const displayName = profile?.name || user?.name || 'there';

  const makeWelcome = (): Message => ({
    id: "m0", role: "ai", timestamp: new Date(),
    content: `Hey ${displayName}! I've reviewed your full career profile — **${careerScore}% Career Score**, ${skills.filter(s => s.pct < 50).length} skill gaps, and ${learningSteps.filter(s => !s.done).length} learning steps remaining.\n\nWhat would you like to work on today?`,
  });

  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([makeWelcome()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [convoSearch, setConvoSearch] = useState("");
  const [msgLikes, setMsgLikes] = useState<Record<string, "like" | "dislike" | null>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      if (coachMessages.length) setMessages(coachMessages);
    });
  }, [coachMessages]);

  useEffect(() => {
    queueMicrotask(() => setLoading(coachLoading));
  }, [coachLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    void sendCoachMessage(msg);
  }, [input, loading, sendCoachMessage]);

  useEffect(() => {
    if (initialPrompt) {
      queueMicrotask(() => {
        sendMessage(initialPrompt);
        window.history.replaceState({}, "", "/app/coach");
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    queueMicrotask(() => {
      if (messages.length === 1 && messages[0].id === "m0") {
        setMessages([makeWelcome()]);
      }
    });
  }, [careerScore, displayName]); // eslint-disable-line react-hooks/exhaustive-deps

  const newChat = () => {
    void startConversation().then((id) => {
      setActiveConvo(id);
      setActiveConversationId(id);
      setMessages([makeWelcome()]);
      toast.success("New conversation started");
    });
  };

  const filteredConvos = convoSearch
    ? convos.filter(c => c.title.toLowerCase().includes(convoSearch.toLowerCase()))
    : convos;

  const avgSkill = skills.length > 0
    ? Math.round(skills.reduce((s, k) => s + k.pct, 0) / skills.length)
    : 0;
  const topGoal = goals.length > 0
    ? [...goals].sort((a, b) => b.progress - a.progress)[0]
    : null;
  const skillGaps = skills.filter(s => s.pct < 50).length;

  const hasUserMessages = messages.some(m => m.role === "user");

  return (
    <div className="flex h-full w-full min-w-0 overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div className="flex-shrink-0 hidden md:flex flex-col bg-card border-r border-border overflow-hidden transition-all duration-350 ease-in-out"
        style={{ width: sidebarExpanded ? 180 : 54 }}>
        <div className="flex items-center justify-between px-3 pt-4 pb-2.5 flex-shrink-0">
          {sidebarExpanded && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">History</span>}
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all ml-auto flex-shrink-0">
            {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <div className="px-3 pb-3 flex-shrink-0">
          {sidebarExpanded ? (
            <button onClick={newChat} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-black text-white transition-all hover:brightness-105 active:scale-[0.98] shadow-sm shadow-primary/20"
              style={{ backgroundColor: FLAME }}><Plus className="w-3.5 h-3.5 flex-shrink-0" /> New Chat</button>
          ) : (
            <button onClick={newChat} title="New Chat" className="w-8 h-8 rounded-xl flex items-center justify-center text-white mx-auto transition-all hover:brightness-105 active:scale-[0.98] shadow-sm shadow-primary/20"
              style={{ backgroundColor: FLAME }}><Plus className="w-4 h-4" /></button>
          )}
        </div>
        {sidebarExpanded && (
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input value={convoSearch} onChange={e => setConvoSearch(e.target.value)} placeholder="Search chats..."
                className="w-full h-8 pl-8 pr-2 rounded-xl border border-border bg-input-background text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all" />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {filteredConvos.map(c => (
            <button key={c.id} onClick={() => { setActiveConvo(c.id); setActiveConversationId(c.id); void loadConversation(c.id); }} title={!sidebarExpanded ? c.title : undefined}
              className={cn("w-full rounded-xl transition-all duration-200",
                sidebarExpanded ? "px-3 py-2.5 text-left flex flex-col gap-0.5" : "h-9 flex items-center justify-center",
                activeConvo === c.id ? "bg-secondary text-primary font-bold border-l-2 border-primary rounded-l-none" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")}>
              {sidebarExpanded ? (
                <div className="min-w-0 w-full"><p className="text-[11px] font-bold truncate leading-tight">{c.title}</p><p className="text-[9px] text-muted-foreground/80 mt-0.5">{c.date}</p></div>
              ) : <MessageSquare className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Centre Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Context Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/80 flex-shrink-0 bg-card">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: FLAME }}>
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-bold text-foreground">PathForge</span>
            <span className="hidden sm:inline text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-primary/10 text-primary">Pro</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Online</span>
            </span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {[
              { label: "Score", value: `${careerScore}%`, color: FLAME },
              { label: "Goal", value: topGoal ? `${topGoal.progress}%` : "—", color: "#10B981" },
              { label: "Gaps", value: String(skillGaps), color: "#F59E0B" },
              { label: "Resume", value: "78/100", color: "#6B7280" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold flex-shrink-0 transition-all border"
                style={{ backgroundColor: `${item.color}0D`, color: item.color, borderColor: `${item.color}25` }}>
                {item.label}: <span className="opacity-95">{item.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setInsightsOpen(!insightsOpen)}
            className={cn("ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex-shrink-0 border",
              insightsOpen ? "text-white border-transparent shadow-sm" : "text-muted-foreground border-border hover:text-foreground hover:bg-secondary")}
            style={insightsOpen ? { backgroundColor: FLAME } : {}}>
            <BarChart2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Insights</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-background/50">
          {!hasUserMessages ? (
            <div className="flex flex-col items-center justify-center min-h-full px-6 py-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md transform hover:rotate-6 transition-transform duration-300" style={{ backgroundColor: FLAME }}>
                <Brain className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <h2 className="text-xl font-extrabold mb-1 text-center tracking-tight text-foreground">How can I help you today?</h2>
              <p className="text-[12px] text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">I have full access to your career profile — goals, skills, resume score, job matches, and interview history.</p>
              <div className="w-full max-w-[620px] grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {WELCOME_ACTIONS.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <button key={i} onClick={() => sendMessage(a.prompt)}
                      className="flex flex-col gap-3.5 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 text-left group cursor-pointer">
                      <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                        <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div><p className="text-[12px] font-black leading-tight text-foreground group-hover:text-primary transition-colors">{a.label}</p><p className="text-[10px] text-muted-foreground mt-1 leading-snug">{a.sub}</p></div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-3 md:px-4 lg:px-5 py-4 space-y-3 max-w-3xl mx-auto w-full">
              {messages.map((m, idx) => {
                const displayContent = m.content;
                const likeState = msgLikes[m.id];
                const isStreaming = loading && idx === messages.length - 1 && m.role === 'ai';
                return (
                  <div key={m.id} className={cn("flex gap-3.5", m.role === "user" ? "justify-end" : "justify-start")}>
                    {m.role === "ai" && (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm" style={{ backgroundColor: FLAME }}>
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={cn("flex flex-col gap-1", m.role === "user" ? "items-end max-w-[75%]" : "flex-1 min-w-0")}>
                      {m.role === "user" ? (
                        <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed text-white shadow-sm" style={{ backgroundColor: CARBON }}>{m.content}</div>
                      ) : (
                        <div className="group">
                          <div className="px-5 py-4.5 rounded-2xl rounded-tl-sm bg-card border border-border/80 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <RenderAI text={displayContent} />
                            {isStreaming && <span className="inline-block w-0.5 h-[1.1em] ml-0.5 translate-y-0.5 rounded-full bg-primary animate-pulse" />}
                          </div>
                          {!isStreaming && (
                            <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pl-1">
                              <button onClick={() => { navigator.clipboard?.writeText(m.content); toast.success("Copied to clipboard!"); }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                                <Copy className="w-3.5 h-3.5" /> Copy</button>
                              <button onClick={() => setMsgLikes(p => ({ ...p, [m.id]: p[m.id] === "like" ? null : "like" }))}
                                className={cn("p-1.5 rounded-lg transition-all", likeState === "like" ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground hover:bg-secondary")}>
                                <ThumbsUp className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setMsgLikes(p => ({ ...p, [m.id]: p[m.id] === "dislike" ? null : "dislike" }))}
                                className={cn("p-1.5 rounded-lg transition-all", likeState === "dislike" ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:bg-secondary")}>
                                <ThumbsDown className="w-3.5 h-3.5" /></button>
                              <span className="ml-auto text-[9px] text-muted-foreground/80 pr-1">
                                {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-black text-white shadow-sm" style={{ backgroundColor: FLAME }}>JL</div>
                    )}
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-3.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: FLAME }}><Brain className="w-4 h-4 text-white" /></div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border/80 shadow-sm flex items-center gap-2.5">
                    {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 160}ms` }} />)}
                    <span className="text-[12px] text-muted-foreground ml-1">Analyzing your career data...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-border/80 bg-card">
          {hasUserMessages && (
            <div className="flex gap-2 overflow-x-auto px-4 md:px-6 pt-3 pb-1" style={{ scrollbarWidth: "none" }}>
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary bg-card hover:shadow-sm transition-all whitespace-nowrap cursor-pointer">
                  {p}
                </button>
              ))}
            </div>
          )}
          <div className="px-4 md:px-6 pb-4 pt-2 max-w-3xl mx-auto w-full">
            <div className="relative bg-background rounded-2xl border border-border/85 shadow-sm transition-all focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/10">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask anything about your career, skills, resume, salary..."
                rows={1} className="w-full px-4 pt-3.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none bg-transparent"
                style={{ minHeight: 52, maxHeight: 180, paddingBottom: 48 }} />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <button onClick={() => toast.info("File attachment coming soon")} title="Attach file"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    <Upload className="w-4 h-4" /></button>
                  <button onClick={() => toast.info("Voice input coming soon")} title="Voice input"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    <Mic className="w-4 h-4" /></button>
                  <span className="hidden lg:inline text-[10px] text-muted-foreground/75 ml-2 font-medium">↵ send · ⇧↵ newline</span>
                </div>
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black text-white transition-all disabled:opacity-40 hover:brightness-105 active:scale-95 cursor-pointer shadow-sm shadow-primary/20"
                  style={{ backgroundColor: FLAME }}>
                  <Send className="w-3.5 h-3.5" /><span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground/70 mt-2">PathForge may make mistakes. Verify important decisions with trusted advisors.</p>
          </div>
        </div>
      </div>

      {/* Right Insights Panel — redesigned: roomier, more spacious */}
      {insightsOpen && (
        <div className="flex-shrink-0 border-l border-border hidden lg:flex flex-col overflow-y-auto bg-card" style={{ width: 330 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-card flex-shrink-0">
            <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Insights
            </span>
            <button onClick={() => setInsightsOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto">
            {/* Career Score — hero card */}
            <div className="bg-gradient-to-br from-secondary/60 to-secondary/30 rounded-xl border border-border/80 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Career Score</span>
                <span className="text-[26px] font-black leading-none tracking-tight" style={{ color: FLAME }}>{careerScore}%</span>
              </div>
              <div className="w-full rounded-full overflow-hidden bg-secondary" style={{ height: 8 }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${careerScore}%`, backgroundColor: FLAME }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { l: "Goals", v: `${goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0}%` },
                  { l: "Skills", v: `${avgSkill}%` },
                  { l: "Resume", v: "78%" }
                ].map(m => (
                  <div key={m.l} className="text-center p-3 rounded-xl bg-card border border-border/50">
                    <p className="text-[15px] font-black" style={{ color: FLAME }}>{m.v}</p>
                    <p className="text-[10px] text-muted-foreground/80 font-semibold mt-0.5">{m.l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Top Goal */}
            {topGoal && (
              <div className="bg-secondary/40 rounded-xl border border-border/80 p-4 hover:shadow-md transition-all duration-200">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Top Goal</p>
                <p className="text-[14px] font-bold leading-snug mb-3 text-foreground">{topGoal.title}</p>
                <div className="flex justify-between text-[11px] mb-1.5 font-semibold">
                  <span className="text-muted-foreground">{topGoal.done}/{topGoal.steps} steps</span>
                  <span className="font-black" style={{ color: FLAME }}>{topGoal.progress}%</span>
                </div>
                <div className="w-full rounded-full overflow-hidden bg-secondary" style={{ height: 6 }}>
                  <div className="h-full rounded-full" style={{ width: `${topGoal.progress}%`, backgroundColor: FLAME }} />
                </div>
              </div>
            )}
            {/* Skill Gaps */}
            <div className="bg-secondary/40 rounded-xl border border-border/80 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Skill Gaps</p>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary uppercase tracking-wider">{skillGaps} critical</span>
              </div>
              <div className="space-y-3">
                {skills.filter(s => s.pct < 50).slice(0, 4).map(s => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-foreground">{s.name}</span>
                      <span className="text-[11px] font-bold text-muted-foreground">{s.pct}%</span>
                    </div>
                    <div className="w-full rounded-full overflow-hidden bg-secondary" style={{ height: 5 }}>
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: "#F59E0B" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Best Job Match */}
            <div className="bg-secondary/40 rounded-xl border border-border/80 p-4 hover:shadow-md transition-all duration-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Best Job Match</p>
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-[14px] font-black text-foreground">Vercel</p>
                  <p className="text-[12px] text-muted-foreground">Senior SWE · Remote</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-emerald-600">94%</p>
                  <p className="text-[10px] text-muted-foreground/80 font-semibold">match</p>
                </div>
              </div>
              <div className="w-full rounded-full overflow-hidden bg-secondary" style={{ height: 5 }}>
                <div className="h-full rounded-full" style={{ width: "94%", backgroundColor: "#10B981" }} />
              </div>
            </div>
            {/* AI Suggestions */}
            <div className="rounded-xl border-2 p-4 bg-primary/[0.04] border-primary/20 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">AI Suggests</span>
              </div>
              <div className="space-y-2.5">
                {["Complete Docker module this week", "Update resume with DevOps keywords", "Apply to Vercel — 94% match"].map((rec, i) => (
                  <button key={i} onClick={() => sendMessage(rec)} className="w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-card transition-all group cursor-pointer">
                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                    <span className="text-[12px] leading-snug text-muted-foreground group-hover:text-foreground transition-colors font-medium">{rec}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Resume Score */}
            <div className="bg-secondary/40 rounded-xl border border-border/80 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Resume Score</p>
                <span className="text-[16px] font-black text-emerald-600">78/100</span>
              </div>
              <div className="w-full rounded-full overflow-hidden bg-secondary" style={{ height: 5 }}>
                <div className="h-full rounded-full" style={{ width: "78%", backgroundColor: "#10B981" }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2.5 leading-relaxed">ATS: 68% · Add DevOps keywords to improve score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
