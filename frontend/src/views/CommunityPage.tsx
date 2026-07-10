'use client';

import { useState } from "react";
import { toast } from "sonner";
import { Users, MessageCircle, Heart, MessageSquare, Plus, Search, TrendingUp, Award, Flame, ChevronRight, Clock, User, Reply } from "lucide-react";
import { FLAME, CARBON, ALABASTER } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { useCommunity } from "../contexts/CommunityContext";

const CATEGORIES = [
  { id: "all", label: "All", icon: MessageCircle },
  { id: "career", label: "Career Advice", icon: TrendingUp },
  { id: "interviews", label: "Interviews", icon: MessageSquare },
  { id: "resumes", label: "Resumes", icon: Award },
  { id: "negotiation", label: "Negotiation", icon: Flame },
  { id: "showcase", label: "Showcase", icon: Award },
  { id: "general", label: "General", icon: Users },
];

export default function CommunityPage() {
  const { threads, loading, createThread, likeThread, loadThread, addComment } = useCommunity();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadDetail, setThreadDetail] = useState<Record<string, unknown> | null>(null);
  const [commentText, setCommentText] = useState("");

  const filtered = threads.filter(t => {
    const catMatch = category === "all" || t.category === category;
    const searchMatch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.author.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const topContributors = threads.slice(0, 5).map((t, i) => ({
    name: t.author,
    avatar: t.avatar,
    posts: t.replies + 1,
    color: [FLAME, "#10B981", "#8B5CF6", "#3B82F6", "#F59E0B"][i] ?? FLAME,
  }));

  const handleCreateThread = () => {
    if (!newTitle.trim()) { toast.error("Please enter a thread title"); return; }
    void createThread(newTitle, category === "all" ? "general" : category);
    setNewTitle("");
    setShowNewThread(false);
  };

  const handleOpenThread = async (apiId: string) => {
    setSelectedThread(apiId);
    const detail = await loadThread(apiId);
    setThreadDetail(detail);
  };

  return (
    <div>
      <PageHeader
        title="Community"
        subtitle={`${threads.length} discussions · Share wins, ask questions, grow together`}
        action={<Btn size="sm" onClick={() => setShowNewThread(true)}><Plus className="w-3.5 h-3.5" /> New Thread</Btn>}
      />

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{ backgroundColor: category === cat.id ? FLAME : ALABASTER, color: category === cat.id ? "white" : "#6B6F6B" }}>
                <cat.icon className="w-3 h-3" /> {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {loading ? (
            <Card className="p-8 text-center text-muted-foreground">Loading discussions...</Card>
          ) : sorted.length === 0 ? (
            <EmptyState icon={<MessageCircle className="w-12 h-12" style={{ color: FLAME }} />} title="No discussions yet" description="Be the first to start a conversation." action={{ label: "New Thread", onClick: () => setShowNewThread(true) }} />
          ) : sorted.map(t => (
            <Card key={t.apiId} className="p-4 flex items-start gap-3 cursor-pointer" onClick={() => void handleOpenThread(t.apiId)}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-shrink-0" style={{ backgroundColor: CARBON }}>{t.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {t.pinned && <Chip variant="orange">Pinned</Chip>}
                  {t.solved && <Chip variant="green">Solved</Chip>}
                  <Chip variant="ghost">{t.category}</Chip>
                </div>
                <h3 className="text-[14px] font-black mb-1" style={{ color: CARBON }}>{t.title}</h3>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {t.author}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.time}</span>
                  <span className="flex items-center gap-1"><Reply className="w-3 h-3" /> {t.replies}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={(e) => { e.stopPropagation(); void likeThread(t.apiId); }} className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-red-500 transition-all">
                  <Heart className="w-3.5 h-3.5" /> {t.likes}
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="p-4" hover={false}>
            <h3 className="text-[13px] font-black mb-3 flex items-center gap-2" style={{ color: CARBON }}><TrendingUp className="w-4 h-4" style={{ color: FLAME }} /> Top Contributors</h3>
            {topContributors.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No activity yet</p>
            ) : topContributors.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                <span className="text-[11px] font-black w-4" style={{ color: c.color }}>#{i + 1}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: c.color }}>{c.avatar}</div>
                <div className="flex-1"><p className="text-[12px] font-bold" style={{ color: CARBON }}>{c.name}</p><p className="text-[10px] text-muted-foreground">{c.posts} posts</p></div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {selectedThread && threadDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setSelectedThread(null); setThreadDetail(null); }} />
          <Card className="relative w-full max-w-lg p-6 z-10 max-h-[80vh] overflow-y-auto" hover={false}>
            <h2 className="text-[16px] font-black mb-2" style={{ color: CARBON }}>{String(threadDetail.title)}</h2>
            <p className="text-[13px] text-muted-foreground mb-4">{String(threadDetail.body ?? "")}</p>
            <h3 className="text-[12px] font-black mb-2" style={{ color: CARBON }}>Comments</h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {((threadDetail.comments as Record<string, unknown>[]) ?? []).map((c) => (
                <div key={String(c.id)} className="p-2 rounded-xl bg-secondary text-[12px]">{String(c.body)}</div>
              ))}
              {!(threadDetail.comments as unknown[])?.length && (
                <p className="text-[12px] text-muted-foreground italic">No comments yet.</p>
              )}
            </div>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={2} placeholder="Add a comment..."
              className="w-full rounded-xl border border-border text-[13px] px-3 py-2 mb-3 resize-none" />
            <Btn full onClick={async () => {
              if (!commentText.trim() || !selectedThread) return;
              await addComment(selectedThread, commentText.trim());
              setCommentText("");
              const detail = await loadThread(selectedThread);
              setThreadDetail(detail);
            }}>Post Comment</Btn>
          </Card>
        </div>
      )}

      {showNewThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewThread(false)} />
          <Card className="relative w-full max-w-md p-6 z-10" hover={false}>
            <h2 className="text-[16px] font-black mb-4" style={{ color: CARBON }}>Start a Discussion</h2>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What's on your mind?"
              className="w-full h-11 px-4 rounded-xl border border-border text-[13px] mb-4 focus:outline-none focus:ring-2 focus:ring-ring" style={{ backgroundColor: ALABASTER }} />
            <div className="flex gap-3">
              <Btn variant="outline" full onClick={() => setShowNewThread(false)}>Cancel</Btn>
              <Btn full onClick={handleCreateThread}>Post</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
