"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  Clapperboard,
  FilePlus2,
  FolderOpen,
  LayoutTemplate,
  Plus,
  Search,
  Sparkles
} from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { getProjects, saveProject } from "@/lib/editor/projectStorage";
import { createProjectFromTemplate } from "@/lib/editor/projectFactory";
import { templateDefinitions } from "@/lib/templates/templateDefinitions";
import { RecentProjects } from "@/components/dashboard/RecentProjects";

export function DashboardHome() {
  const router = useRouter();
  const [projects, setProjects] = useState<PlayableProject[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const latestProject = projects[0];
  const filteredProjects = useMemo(
    () => projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase())),
    [projects, query]
  );
  const featuredTemplates = templateDefinitions.slice(0, 3);

  function createBlankProject() {
    const project = createProjectFromTemplate("intro-cta");
    const saved = saveProject({ ...project, name: "Untitled Playable", templateId: "intro-cta" });
    router.push(`/editor/${saved.id}`);
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="studio-panel overflow-hidden rounded-lg p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700">
              <Sparkles className="size-4" aria-hidden />
              Local no-code playable ads builder
            </div>
            <h1 className="text-4xl font-black tracking-normal text-slate-950 sm:text-5xl">
              Playable Ads Studio
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Build interactive playable ads without coding. Create scenes, add assets, preview,
              validate, and export a local HTML5 package from one bright workspace.
            </p>
          </div>

          <div className="grid min-w-[260px] gap-3">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-3 text-sm font-extrabold text-white shadow-glow transition hover:bg-sky-700"
            >
              <Plus className="size-4" aria-hidden />
              Create New Playable
            </Link>
            <button
              type="button"
              onClick={() => latestProject && router.push(`/editor/${latestProject.id}`)}
              disabled={!latestProject}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
            >
              <FolderOpen className="size-4" aria-hidden />
              Open Last Edited
            </button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="studio-panel rounded-lg p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects by name..."
                className="studio-input pl-10"
              />
            </label>
          </div>

          <RecentProjects projects={filteredProjects} onProjectsChange={() => setProjects(getProjects())} />
        </div>

        <aside className="space-y-4">
          <section className="studio-panel rounded-lg p-5">
            <h2 className="text-lg font-black text-slate-950">Quick Actions</h2>
            <div className="mt-4 grid gap-2">
              <ActionLink href="/templates" icon={<LayoutTemplate className="size-4" />} title="New from Template" text="Start with a proven mechanic." />
              <ActionButton icon={<FilePlus2 className="size-4" />} title="New Blank Project" text="Create a simple editable flow." onClick={createBlankProject} />
              <ActionLink href="/video-to-playable" icon={<Clapperboard className="size-4" />} title="Video to Playable" text="MVP placeholder workflow." />
              <ActionLink href="/ai-builder" icon={<Bot className="size-4" />} title="AI Builder" text="Generate a local structured idea." />
            </div>
          </section>

          <section className="studio-panel rounded-lg p-5">
            <h2 className="text-lg font-black text-slate-950">Featured Templates</h2>
            <div className="mt-4 space-y-3">
              {featuredTemplates.map((template) => (
                <Link
                  key={template.id}
                  href="/templates"
                  className="block rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <div className="text-sm font-black text-slate-900">{template.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{template.mainMechanic} - {template.difficulty}</div>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function ActionLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 transition hover:border-sky-200 hover:bg-sky-50">
      <span className="grid size-10 place-items-center rounded-md bg-sky-100 text-sky-700">{icon}</span>
      <span>
        <span className="block text-sm font-black text-slate-900">{title}</span>
        <span className="block text-xs text-slate-500">{text}</span>
      </span>
    </Link>
  );
}

function ActionButton({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 text-left transition hover:border-sky-200 hover:bg-sky-50">
      <span className="grid size-10 place-items-center rounded-md bg-emerald-100 text-emerald-700">{icon}</span>
      <span>
        <span className="block text-sm font-black text-slate-900">{title}</span>
        <span className="block text-xs text-slate-500">{text}</span>
      </span>
    </button>
  );
}
