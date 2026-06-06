"use client";

import Link from "next/link";
import { Copy, ExternalLink, FolderPlus, Trash2 } from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { deleteProject, duplicateProject } from "@/lib/editor/projectStorage";

interface RecentProjectsProps {
  projects: PlayableProject[];
  onProjectsChange: () => void;
}

export function RecentProjects({ projects, onProjectsChange }: RecentProjectsProps) {
  return (
    <section className="studio-panel rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">Recent Projects</h2>
          <p className="text-sm text-slate-500">Saved locally in this browser with LocalStorage.</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
          <FolderPlus className="mb-3 size-8 text-sky-500" aria-hidden />
          No saved projects yet. Choose a template to create your first playable.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-slate-950">{project.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {project.templateId} - Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/editor/${project.id}`}
                    className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-700"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      duplicateProject(project.id);
                      onProjectsChange();
                    }}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                  >
                    <Copy className="size-4" aria-hidden />
                    Duplicate Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteProject(project.id);
                      onProjectsChange();
                    }}
                    className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:border-red-300"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
