"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Home,
  Play,
  RefreshCcw,
  Save,
  Copy,
  Trash2,
  Library,
  Redo2,
  Undo2,
  CheckCircle2,
  Rocket,
  UserCircle2
} from "lucide-react";
import { DesignCanvas } from "@/components/editor/DesignCanvas";
import { EditorBottomPanel } from "@/components/editor/EditorBottomPanel";
import { ExportModal } from "@/components/editor/ExportModal";
import { ObjectLibrary } from "@/components/editor/ObjectLibrary";
import { OnboardingModal } from "@/components/editor/OnboardingModal";
import { PropertiesInspector } from "@/components/editor/PropertiesInspector";
import { Tooltip } from "@/components/editor/Tooltip";
import { ValidationModal } from "@/components/editor/ValidationModal";
import { useEditorStore } from "@/store/editorStore";

interface EditorShellProps {
  projectId: string;
}

const ONBOARDING_STORAGE_KEY = "playable-ads-studio:editor-onboarding-seen";

export function EditorShell({ projectId }: EditorShellProps) {
  const router = useRouter();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const {
    project,
    isDirty,
    statusMessage,
    editorMode,
    undoStack,
    redoStack,
    loadProject,
    saveProject,
    updateProjectName,
    duplicateCurrentProject,
    deleteCurrentProject,
    resetFromTemplate,
    undo,
    redo,
    setEditorMode
  } = useEditorStore();

  useEffect(() => {
    loadProject(projectId);
    setHasLoaded(true);
  }, [loadProject, projectId]);

  useEffect(() => {
    if (!hasLoaded || typeof window === "undefined") {
      return;
    }

    const hasSeenOnboarding = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);

    if (!hasSeenOnboarding) {
      setOnboardingOpen(true);
    }
  }, [hasLoaded]);

  if (!hasLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-studio-ink px-4 text-slate-500">
        Loading editor...
      </div>
    );
  }

  if (!project) {
    return (
      <main className="grid min-h-screen place-items-center bg-studio-ink px-4">
        <section className="studio-panel max-w-md rounded-lg p-6 text-center">
          <h1 className="text-2xl font-black text-slate-950">Project Not Found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            This project is not saved in LocalStorage. Create a new playable from the template
            library.
          </p>
          <Link
            href="/templates"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
          >
            <Library className="size-4" aria-hidden />
            Open Templates
          </Link>
        </section>
      </main>
    );
  }

  function handleDuplicate() {
    const copy = duplicateCurrentProject();

    if (copy) {
      router.push(`/editor/${copy.id}`);
    }
  }

  function handleDelete() {
    deleteCurrentProject();
    router.push("/");
  }

  function closeOnboarding() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    }

    setOnboardingOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-studio-text">
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur">
        <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 lg:flex-nowrap">
          <Link
            href="/"
            className="grid size-10 shrink-0 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            title="Dashboard"
          >
            <Home className="size-4" aria-hidden />
          </Link>

          <div className="min-w-[220px] flex-1">
            <div className="mb-1 text-xs font-bold text-slate-500">Dashboard / Editor</div>
            <input
              value={project.name}
              onChange={(event) => updateProjectName(event.target.value)}
              className="studio-input max-w-xl border-transparent bg-transparent px-0 py-0 text-lg font-black shadow-none focus:border-transparent focus:shadow-none"
              aria-label="Project name"
            />
            <div className="text-xs text-slate-500">
              {isDirty ? "Unsaved changes" : statusMessage || "Saved locally"}
            </div>
          </div>

          <div className="scrollbar-soft flex flex-wrap items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => saveProject()}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(37,99,235,0.18)] transition hover:bg-blue-700"
            >
              <Save className="size-4" aria-hidden />
              Save
            </button>
            <button
              type="button"
              onClick={undo}
              disabled={undoStack.length === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              <Undo2 className="size-4" aria-hidden />
              Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={redoStack.length === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              <Redo2 className="size-4" aria-hidden />
              Redo
            </button>
            <button
              type="button"
              onClick={() => setEditorMode(editorMode === "preview" ? "design" : "preview")}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-bold ${
                editorMode === "preview"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <Play className="size-4" aria-hidden />
              {editorMode === "preview" ? "Design" : "Preview"}
            </button>
            <button
              type="button"
              onClick={() => setValidationOpen(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-bold text-emerald-700 transition hover:border-emerald-300"
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Validate
            </button>
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300"
            >
              <Download className="size-4" aria-hidden />
              Export
            </button>
            <Tooltip
              label="Export"
              text="Export creates a local ZIP with designed scenes, object rendering, actions, animations, audio metadata, project.json, and assets."
            />
            <button
              type="button"
              disabled
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-400"
              title="Publish is a future backend feature."
            >
              <Rocket className="size-4" aria-hidden />
              Publish
            </button>
            <button
              type="button"
              onClick={resetFromTemplate}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              title="Reset template defaults"
            >
              <RefreshCcw className="size-4" aria-hidden />
              Reset
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              className="grid size-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-slate-900"
              title="Duplicate project"
            >
              <Copy className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="grid size-10 place-items-center rounded-md border border-red-200 bg-red-50 text-red-700 transition hover:border-red-300"
              title="Delete project"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700"
            >
              <UserCircle2 className="size-4" aria-hidden />
              User
            </button>
          </div>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-65px)] gap-4 p-4 xl:grid-cols-[320px_minmax(560px,1fr)_390px]">
        <ObjectLibrary />

        <section className="grid min-h-[760px] gap-4 lg:grid-rows-[1fr_auto]">
          <DesignCanvas />
          <EditorBottomPanel project={project} onShowOnboarding={() => setOnboardingOpen(true)} />
        </section>

        <PropertiesInspector project={project} />
      </main>

      <ExportModal project={project} open={exportOpen} onClose={() => setExportOpen(false)} />
      <ValidationModal
        project={project}
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        onShowOnboarding={() => setOnboardingOpen(true)}
      />
      <OnboardingModal open={onboardingOpen} onClose={closeOnboarding} />
    </div>
  );
}
