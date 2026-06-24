'use client';

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FolderKanban, Plus, ExternalLink, Github, Edit3, Trash2, Globe, Sparkles, Check, ArrowUpRight } from "lucide-react";
import { FLAME, CARBON, ALABASTER } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Chip } from "../components/Chip";
import { Field } from "../components/Field";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { TechTagsInput } from "../components/TechTagsInput";
import { useCareerData } from "../contexts/CareerDataContext";
import { useGamification } from "../contexts/GamificationContext";
import { usePortfolio, type PortfolioProject } from "../contexts/PortfolioContext";

function externalHref(url: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function ProjectCard({
  project,
  featuredHeader = false,
  onEdit,
  onDelete,
  onToggleFeatured,
}: {
  project: PortfolioProject;
  featuredHeader?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
}) {
  return (
    <Card className="flex flex-col overflow-hidden p-0" hover={false}>
      <div
        className={`flex items-center justify-center font-black text-white ${featuredHeader ? 'h-28 text-2xl' : 'h-20 text-lg'}`}
        style={{
          background: featuredHeader
            ? `linear-gradient(135deg, ${FLAME}, #FF9B6A)`
            : 'linear-gradient(135deg, #374151, #6B7280)',
        }}
      >
        {project.image}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className={`font-black ${featuredHeader ? 'text-[14px]' : 'text-[13px]'} flex items-center gap-1.5`} style={{ color: CARBON }}>
            {project.title}
            {project.featured && !featuredHeader && <Sparkles className="h-3 w-3" style={{ color: FLAME }} />}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFeatured}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-secondary"
              title={project.featured ? 'Remove from featured' : 'Mark as featured'}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: project.featured ? FLAME : '#9CA3AF' }} />
            </button>
            <button onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-secondary">
              <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-red-50">
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
        </div>
        <p className={`mb-3 flex-1 leading-relaxed text-muted-foreground ${featuredHeader ? 'text-[12px]' : 'text-[11px]'}`}>
          {project.desc}
        </p>
        <div className={`mb-3 flex flex-wrap gap-1.5 ${featuredHeader ? '' : 'gap-1'}`}>
          {project.tech.map((tech) =>
            featuredHeader ? (
              <Chip key={tech} variant="ghost">{tech}</Chip>
            ) : (
              <span key={tech} className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold" style={{ backgroundColor: ALABASTER, color: CARBON }}>
                {tech}
              </span>
            ),
          )}
        </div>
        <div className="mt-auto flex items-center gap-2">
          {project.url && (
            <a href={externalHref(project.url)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 font-bold hover:underline ${featuredHeader ? 'text-[11px]' : 'text-[10px]'}`} style={{ color: FLAME }}>
              {featuredHeader ? <Globe className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
              Demo
              {featuredHeader && <ArrowUpRight className="h-3 w-3" />}
            </a>
          )}
          {project.repo && (
            <a href={externalHref(project.repo)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 font-bold hover:underline ${featuredHeader ? 'text-[11px]' : 'text-[10px]'}`} style={{ color: CARBON }}>
              <Github className="h-3 w-3" /> Repo
              {featuredHeader && <ArrowUpRight className="h-3 w-3" />}
            </a>
          )}
          <span className={`ml-auto text-muted-foreground ${featuredHeader ? 'text-[10px]' : 'text-[9px]'}`}>{project.year}</span>
        </div>
      </div>
    </Card>
  );
}

export default function PortfolioPage() {
  const { skills } = useCareerData();
  const { referenceSkills } = useGamification();
  const { projects, loading, saveProject, deleteProject } = usePortfolio();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [form, setForm] = useState({
    title: "",
    desc: "",
    url: "",
    repo: "",
    tech: [] as string[],
    year: "",
    featured: false,
  });

  const techSuggestions = useMemo(() => {
    const fromProfile = skills.map((skill) => skill.name);
    const fromCatalog = referenceSkills.map((skill) => String(skill.name));
    return Array.from(new Set([...fromProfile, ...fromCatalog]));
  }, [referenceSkills, skills]);

  const openForm = (project?: PortfolioProject) => {
    if (project) {
      setEditing(project);
      setForm({
        title: project.title,
        desc: project.desc,
        url: project.url,
        repo: project.repo,
        tech: project.tech,
        year: project.year,
        featured: project.featured,
      });
    } else {
      setEditing(null);
      setForm({
        title: "",
        desc: "",
        url: "",
        repo: "",
        tech: [],
        year: new Date().getFullYear().toString(),
        featured: false,
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const saveProjectHandler = async () => {
    if (!form.title.trim() || !form.desc.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      await saveProject({
        apiId: editing?.apiId,
        title: form.title,
        desc: form.desc,
        url: form.url,
        repo: form.repo,
        tech: form.tech,
        year: form.year,
        featured: form.featured,
      });
      closeForm();
    } catch {
      /* toast handled in context */
    } finally {
      setSaving(false);
    }
  };

  const featured = projects.filter((project) => project.featured);
  const other = projects.filter((project) => !project.featured);

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Showcase your best work. Link projects, repos, and live demos."
        action={<Btn size="sm" onClick={() => openForm()}><Plus className="w-3.5 h-3.5" /> Add Project</Btn>}
      />

      <Modal open={showForm} onClose={closeForm} title={editing ? "Edit Project" : "New Project"} maxWidth="lg">
        <div className="space-y-4">
          <Field
            label="Project title"
            value={form.title}
            onChange={(title) => setForm((prev) => ({ ...prev, title }))}
            placeholder="e.g. PathForge Career Dashboard"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-foreground">Description</label>
            <textarea
              value={form.desc}
              onChange={(event) => setForm((prev) => ({ ...prev, desc: event.target.value }))}
              placeholder="What did you build? What impact did it have?"
              rows={4}
              className="w-full resize-none rounded-xl border border-border px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: ALABASTER }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Live demo URL"
              value={form.url}
              onChange={(url) => setForm((prev) => ({ ...prev, url }))}
              placeholder="https://myapp.com"
            />
            <Field
              label="GitHub repo"
              value={form.repo}
              onChange={(repo) => setForm((prev) => ({ ...prev, repo }))}
              placeholder="github.com/you/project"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Technologies</label>
            <TechTagsInput
              value={form.tech}
              onChange={(tech) => setForm((prev) => ({ ...prev, tech }))}
              suggestions={techSuggestions}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Pick from suggestions or type any technology and press Enter.
            </p>
          </div>
          <Field
            label="Year"
            value={form.year}
            onChange={(year) => setForm((prev) => ({ ...prev, year }))}
            placeholder={new Date().getFullYear().toString()}
          />
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
              className="h-4 w-4 rounded"
              style={{ accentColor: FLAME }}
            />
            <span className="text-[13px] font-bold" style={{ color: CARBON }}>Feature this project (max 3)</span>
          </label>
          <div className="flex gap-3 pt-1">
            <Btn variant="outline" full onClick={closeForm} disabled={saving}>Cancel</Btn>
            <Btn full onClick={() => void saveProjectHandler()} disabled={saving}>
              {saving ? 'Saving…' : <><Check className="h-3.5 w-3.5" /> {editing ? "Update Project" : "Add Project"}</>}
            </Btn>
          </div>
        </div>
      </Modal>

      {loading && projects.length === 0 ? (
        <Card className="animate-pulse p-8" hover={false}>
          <div className="mb-3 h-4 w-40 rounded bg-secondary" />
          <div className="h-3 w-64 rounded bg-secondary" />
        </Card>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" style={{ color: FLAME }} />}
          title="No projects yet"
          description="Add your first project to showcase your work. Link to live demos and GitHub repos."
          action={{ label: "Add Your First Project", onClick: () => openForm() }}
        />
      ) : (
        <>
          <Card className="mb-5 flex items-center gap-3 p-4" hover={false} style={{ borderColor: "rgba(241,80,37,0.15)" }}>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(241,80,37,0.1)" }}>
              <Sparkles className="h-4 w-4" style={{ color: FLAME }} />
            </div>
            <p className="flex-1 text-[12px]" style={{ color: CARBON }}>
              <strong>{projects.length} projects</strong> · <strong>{skills.length} skills</strong> tracked · Top skills: {skills.filter((skill) => skill.pct >= 70).slice(0, 4).map((skill) => skill.name).join(", ") || "Add skills to get started"}
            </p>
          </Card>

          {featured.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-[14px] font-black" style={{ color: CARBON }}>
                <Sparkles className="h-4 w-4" style={{ color: FLAME }} /> Featured
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((project) => (
                  <ProjectCard
                    key={project.apiId}
                    project={project}
                    featuredHeader
                    onEdit={() => openForm(project)}
                    onDelete={() => void deleteProject(project.apiId)}
                    onToggleFeatured={() => void saveProject({ ...project, featured: false })}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 text-[14px] font-black" style={{ color: CARBON }}>
              {featured.length > 0 ? `Other Projects (${other.length})` : `All Projects (${projects.length})`}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(featured.length > 0 ? other : projects).map((project) => (
                <ProjectCard
                  key={project.apiId}
                  project={project}
                  onEdit={() => openForm(project)}
                  onDelete={() => void deleteProject(project.apiId)}
                  onToggleFeatured={() => void saveProject({ ...project, featured: !project.featured })}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
