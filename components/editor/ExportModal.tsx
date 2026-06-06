"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Loader2, X, XCircle } from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { exportProjectAsZip } from "@/lib/editor/exportProject";
import {
  getExportChecklist,
  hasBlockingExportErrors,
  type ValidationItem,
  validateProjectForExport
} from "@/lib/editor/validators";
import { Tooltip } from "@/components/editor/Tooltip";

interface ExportModalProps {
  project: PlayableProject;
  open: boolean;
  onClose: () => void;
}

export function ExportModal({ project, open, onClose }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState("");
  const checklist = useMemo(() => getExportChecklist(project), [project]);
  const validation = useMemo(() => validateProjectForExport(project), [project]);
  const blocked = hasBlockingExportErrors(validation);

  if (!open) {
    return null;
  }

  async function handleExport() {
    setIsExporting(true);
    setResult("");

    try {
      const output = await exportProjectAsZip(project);
      setResult(`Downloaded ${output.fileName} (${Math.round(output.bytes / 1024)} KB).`);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-950">Export Playable Package</h2>
              <Tooltip
                label="Export"
                text="Export downloads a ZIP that can run locally. It is a learning package, not a production ad-network upload."
              />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Validation runs before the ZIP is generated.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
            title="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mb-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-950">Pre-export Checklist</h3>
              <p className="mt-1 text-xs text-slate-500">These are the core pieces of a simple playable ad.</p>
            </div>
            <Tooltip
              label="Validation"
              text="Validation checks whether required export pieces exist and warns about beginner-friendly improvements."
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {checklist.map((item) => (
              <ValidationRow key={item.id} item={item} compact />
            ))}
          </div>
        </div>

        <div className="mb-5 grid gap-3 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 md:grid-cols-3">
          <div><strong>Network:</strong> {project.settings.networkPreset ?? "generic"}</div>
          <div><strong>Duration:</strong> {project.settings.duration}s</div>
          <div><strong>CTA:</strong> {project.settings.ctaText}</div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-950">Validation Results</h3>
          {validation.map((item) => (
            <ValidationRow key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          This MVP export is for learning and local testing. Real ad network deployment may require
          additional MRAID, network-specific specifications, file size limits, orientation settings,
          and QA validation.
        </div>

        {result ? <div className="mt-4 text-sm font-bold text-slate-950">{result}</div> : null}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={blocked || isExporting}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
          >
            {isExporting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}
            Download ZIP
          </button>
        </div>
      </section>
    </div>
  );
}

function ValidationRow({ item, compact = false }: { item: ValidationItem; compact?: boolean }) {
  const Icon = item.level === "pass" ? CheckCircle2 : item.level === "warning" ? AlertTriangle : XCircle;
  const colors =
    item.level === "pass"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : item.level === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-lg border p-3 ${colors}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <div className="text-sm font-extrabold">{item.label}</div>
          <div className={`${compact ? "mt-0.5" : "mt-1"} text-xs leading-5 opacity-85`}>
            {item.message}
          </div>
        </div>
      </div>
    </div>
  );
}
