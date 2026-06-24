'use client';

import { useState } from "react";
import { toast } from "sonner";
import { FolderKanban, Plus, ExternalLink, Github, Edit3, Trash2, Globe, Code, Smartphone, Server, Sparkles, Check, ArrowUpRight } from "lucide-react";
import { FLAME, CARBON, ALABASTER, DUST } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Chip } from "../components/Chip";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { useCareerData } from "../contexts/CareerDataContext";
import { usePortfolio, type PortfolioProject } from "../contexts/PortfolioContext";

export default function PortfolioPage() {
  const { skills } = useCareerData();
  const { projects, saveProject, deleteProject } = usePortfolio();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [form, setForm] = useState({ title: "", desc: "", url: "", repo: "", tech: "", year: "", featured: false });

  const openForm = (p?: PortfolioProject) => {
    if (p) {
      setEditing(p);
      setForm({ title: p.title, desc: p.desc, url: p.url, repo: p.repo, tech: p.tech.join(", "), year: p.year, featured: p.featured });
    } else {
      setEditing(null);
      setForm({ title: "", desc: "", url: "", repo: "", tech: "", year: new Date().getFullYear().toString(), featured: false });
    }
    setShowForm(true);
  };

  const saveProjectHandler = () => {
    if (!form.title.trim() || !form.desc.trim()) { toast.error("Title and description are required"); return; }
    const techArr = form.tech.split(",").map(t => t.trim()).filter(Boolean);
    void saveProject({
      apiId: editing?.apiId,
      title: form.title,
      desc: form.desc,
      url: form.url,
      repo: form.repo,
      tech: techArr,
      year: form.year,
      featured: form.featured,
    });
    setShowForm(false);
    setEditing(null);
  };

  const deleteProjectHandler = (apiId: string) => {
    void deleteProject(apiId);
  };

  const toggleFeatured = (p: PortfolioProject) => {
    void saveProject({
      apiId: p.apiId,
      title: p.title,
      desc: p.desc,
      url: p.url,
      repo: p.repo,
      tech: p.tech,
      year: p.year,
      featured: !p.featured,
    });
  };

  const featured = projects.filter(p => p.featured);
  const other = projects.filter(p => !p.featured);

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Showcase your best work. Link projects, repos, and live demos."
        action={<Btn size="sm" onClick={() => openForm()}><Plus className="w-3.5 h-3.5" /> Add Project</Btn>}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-12 h-12" style={{ color: FLAME }} />}
          title="No projects yet"
          description="Add your first project to showcase your work. Link to live demos and GitHub repos."
          action={{ label: "Add Your First Project", onClick: () => openForm() }}
        />
      ) : (
        <>
          {/* Add/Edit Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
              <Card className="w-full max-w-lg p-6" hover={false} onClick={e => e.stopPropagation()}>
                <h2 className="text-[16px] font-black mb-4" style={{ color: CARBON }}>{editing ? "Edit Project" : "New Project"}</h2>
                <div className="space-y-3">
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Project title" className="w-full h-10 px-4 rounded-xl border border-border text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-ring" style={{ backgroundColor: ALABASTER }} />
                  <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Description" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-ring resize-none" style={{ backgroundColor: ALABASTER }} />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="Live URL (optional)" className="w-full h-10 px-4 rounded-xl border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-ring" style={{ backgroundColor: ALABASTER }} />
                    <input value={form.repo} onChange={e => setForm(f => ({ ...f, repo: e.target.value }))} placeholder="GitHub repo (optional)" className="w-full h-10 px-4 rounded-xl border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-ring" style={{ backgroundColor: ALABASTER }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.tech} onChange={e => setForm(f => ({ ...f, tech: e.target.value }))} placeholder="Tech: React, Node, ..." className="w-full h-10 px-4 rounded-xl border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-ring" style={{ backgroundColor: ALABASTER }} />
                    <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="Year" className="w-full h-10 px-4 rounded-xl border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-ring" style={{ backgroundColor: ALABASTER }} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded" style={{ accentColor: FLAME }} />
                    <span className="text-[13px] font-bold" style={{ color: CARBON }}>Featured project</span>
                  </label>
                  <div className="flex gap-2 pt-2">
                    <Btn full onClick={saveProjectHandler}><Check className="w-3.5 h-3.5" /> {editing ? "Update" : "Add Project"}</Btn>
                    <Btn variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Btn>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Skills integration */}
          <Card className="p-4 mb-5 flex items-center gap-3" hover={false} style={{ borderColor: "rgba(241,80,37,0.15)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
              <Sparkles className="w-4 h-4" style={{ color: FLAME }} />
            </div>
            <p className="text-[12px] flex-1" style={{ color: CARBON }}>
              <strong>{projects.length} projects</strong> · <strong>{skills.length} skills</strong> mapped · Your top skills: {skills.filter(s => s.pct >= 70).slice(0, 4).map(s => s.name).join(", ") || "Add skills to get started"}
            </p>
          </Card>

          {/* Featured */}
          {featured.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[14px] font-black mb-3 flex items-center gap-2" style={{ color: CARBON }}>
                <Sparkles className="w-4 h-4" style={{ color: FLAME }} /> Featured
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map(p => (
                  <Card key={p.id} className="p-0 overflow-hidden flex flex-col" hover={false}>
                    <div className="h-28 flex items-center justify-center text-2xl font-black text-white" style={{ background: `linear-gradient(135deg, ${FLAME}, #FF9B6A)` }}>
                      {p.image}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-1.5">
                        <h3 className="text-[14px] font-black" style={{ color: CARBON }}>{p.title}</h3>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleFeatured(p)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-all"><Sparkles className="w-3.5 h-3.5" style={{ color: FLAME }} /></button>
                          <button onClick={() => openForm(p)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-all"><Edit3 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => deleteProjectHandler(p.apiId)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        </div>
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-3 flex-1 leading-relaxed">{p.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.tech.map(t => <Chip key={t} variant="ghost">{t}</Chip>)}
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-bold hover:underline" style={{ color: FLAME }}><Globe className="w-3 h-3" /> Demo <ArrowUpRight className="w-3 h-3" /></a>}
                        {p.repo && <a href={`https://${p.repo}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-bold hover:underline" style={{ color: CARBON }}><Github className="w-3 h-3" /> Repo <ArrowUpRight className="w-3 h-3" /></a>}
                        <span className="ml-auto text-[10px] text-muted-foreground">{p.year}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All projects */}
          <div>
            <h2 className="text-[14px] font-black mb-3" style={{ color: CARBON }}>All Projects ({projects.length})</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {other.concat(featured).map(p => (
                <Card key={p.id} className="p-0 overflow-hidden flex flex-col" hover={false}>
                  <div className="h-20 flex items-center justify-center text-lg font-black text-white" style={{ background: `linear-gradient(135deg, #374151, #6B7280)` }}>
                    {p.image}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-[13px] font-black flex items-center gap-1.5" style={{ color: CARBON }}>
                        {p.title}
                        {p.featured && <Sparkles className="w-3 h-3" style={{ color: FLAME }} />}
                      </h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2 flex-1 leading-relaxed">{p.desc}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {p.tech.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold" style={{ backgroundColor: ALABASTER, color: CARBON }}>{t}</span>)}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold hover:underline" style={{ color: FLAME }}><ExternalLink className="w-3 h-3" /> Demo</a>}
                      {p.repo && <a href={`https://${p.repo}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold hover:underline" style={{ color: CARBON }}><Github className="w-3 h-3" /> Repo</a>}
                      <span className="ml-auto text-[9px] text-muted-foreground">{p.year}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
