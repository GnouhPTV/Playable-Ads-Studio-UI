"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import JSZip from "jszip";
import { motion } from "framer-motion";
import {
  Download,
  ImagePlus,
  Layers,
  MousePointerClick,
  Play,
  Plus,
  RefreshCcw,
  Scissors,
  Trash2,
  Upload,
  Video
} from "lucide-react";

type FitMode = "cover" | "contain" | "stretch";
type OverlayType = "text" | "cta" | "image" | "endCard";

interface VideoOverlay {
  id: string;
  type: OverlayType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontSize: number;
  url: string;
  src?: string;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
}

type OverlayOperation =
  | { type: "drag"; id: string; startX: number; startY: number; overlayX: number; overlayY: number }
  | { type: "resize"; id: string; startX: number; startY: number; width: number; height: number };

const FRAME_WIDTH = 360;
const FRAME_HEIGHT = 640;
const DRAFT_KEY = "playable-video-to-playable-draft";

function createOverlayId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `overlay-${crypto.randomUUID()}`;
  }

  return `overlay-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const initialOverlays: VideoOverlay[] = [
  {
    id: "overlay-headline",
    type: "text",
    name: "Headline",
    x: 28,
    y: 70,
    width: 304,
    height: 72,
    text: "Can you beat this level?",
    backgroundColor: "rgba(255,255,255,0.92)",
    textColor: "#0f172a",
    borderRadius: 10,
    fontSize: 23,
    url: ""
  },
  {
    id: "overlay-cta",
    type: "cta",
    name: "CTA Button",
    x: 62,
    y: 532,
    width: 236,
    height: 56,
    text: "View Portfolio",
    backgroundColor: "#2563eb",
    textColor: "#ffffff",
    borderRadius: 14,
    fontSize: 17,
    url: "https://example.com/portfolio"
  },
  {
    id: "overlay-end-card",
    type: "endCard",
    name: "End Card",
    x: 34,
    y: 194,
    width: 292,
    height: 224,
    text: "Great job!\nTap below to see the portfolio.",
    backgroundColor: "rgba(15,23,42,0.9)",
    textColor: "#ffffff",
    borderRadius: 18,
    fontSize: 25,
    url: ""
  }
];

export function VideoToPlayablePage() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [fitMode, setFitMode] = useState<FitMode>("cover");
  const [backgroundColor, setBackgroundColor] = useState("#0f172a");
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [overlays, setOverlays] = useState<VideoOverlay[]>(initialOverlays);
  const [selectedOverlayId, setSelectedOverlayId] = useState(initialOverlays[0].id);
  const [operation, setOperation] = useState<OverlayOperation | null>(null);
  const [showEndCard, setShowEndCard] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const selectedOverlay = overlays.find((overlay) => overlay.id === selectedOverlayId) ?? null;
  const effectiveEnd = trimEnd || metadata?.duration || 0;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const draft = raw ? JSON.parse(raw) : null;

      if (draft?.overlays) {
        setOverlays(draft.overlays);
        setSelectedOverlayId(draft.overlays[0]?.id ?? initialOverlays[0].id);
        setFitMode(draft.fitMode ?? "cover");
        setBackgroundColor(draft.backgroundColor ?? "#0f172a");
        setTrimStart(draft.trimStart ?? 0);
        setTrimEnd(draft.trimEnd ?? 0);
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const draft = {
      fileName: file?.name ?? "",
      fitMode,
      backgroundColor,
      trimStart,
      trimEnd,
      overlays,
      note: "The browser cannot restore local File objects after refresh. Re-upload the video to preview or export with the asset."
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [backgroundColor, file?.name, fitMode, overlays, trimEnd, trimStart]);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!operation) {
        return;
      }

      const pointer = pointerToFrame(event);

      if (operation.type === "drag") {
        const nextX = clamp(operation.overlayX + pointer.x - operation.startX, 0, FRAME_WIDTH);
        const nextY = clamp(operation.overlayY + pointer.y - operation.startY, 0, FRAME_HEIGHT);
        updateOverlay(operation.id, { x: nextX, y: nextY });
        return;
      }

      updateOverlay(operation.id, {
        width: clamp(operation.width + pointer.x - operation.startX, 36, FRAME_WIDTH),
        height: clamp(operation.height + pointer.y - operation.startY, 32, FRAME_HEIGHT)
      });
    }

    function handlePointerUp() {
      setOperation(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [operation]);

  function pointerToFrame(event: PointerEvent | ReactPointerEvent) {
    const rect = frameRef.current?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: ((event.clientX - rect.left) / rect.width) * FRAME_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * FRAME_HEIGHT
    };
  }

  function handleVideoFile(nextFile: File | undefined) {
    if (!nextFile) {
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const objectUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setVideoUrl(objectUrl);
    setShowEndCard(false);
    setExportMessage("");
  }

  function handleMetadata() {
    const video = videoRef.current;

    if (!video || !file) {
      return;
    }

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    setMetadata({
      duration,
      width: video.videoWidth,
      height: video.videoHeight,
      size: file.size,
      type: file.type || "video"
    });
    setTrimEnd((value) => value || Math.round(duration));
    video.currentTime = Math.min(trimStart, duration);
  }

  function handleTimeUpdate() {
    const video = videoRef.current;

    if (!video || !effectiveEnd) {
      return;
    }

    if (video.currentTime >= effectiveEnd) {
      video.pause();
      setShowEndCard(true);
    }
  }

  function previewFromStart() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    setShowEndCard(false);
    video.currentTime = trimStart;
    void video.play();
  }

  function updateOverlay(overlayId: string, patch: Partial<VideoOverlay>) {
    setOverlays((items) => items.map((overlay) => (overlay.id === overlayId ? { ...overlay, ...patch } : overlay)));
  }

  function addOverlay(type: OverlayType) {
    const overlay: VideoOverlay = {
      id: createOverlayId(),
      type,
      name: type === "cta" ? "CTA Button" : type === "image" ? "Image Overlay" : type === "endCard" ? "End Card" : "Text Overlay",
      x: type === "cta" ? 70 : 42,
      y: type === "cta" ? 520 : type === "endCard" ? 196 : 126,
      width: type === "cta" ? 220 : type === "image" ? 128 : 276,
      height: type === "cta" ? 54 : type === "image" ? 128 : type === "endCard" ? 210 : 64,
      text: type === "cta" ? "View Portfolio" : type === "endCard" ? "Great job!\nReady for the full experience?" : "New overlay",
      backgroundColor: type === "cta" ? "#2563eb" : type === "endCard" ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.92)",
      textColor: type === "cta" || type === "endCard" ? "#ffffff" : "#0f172a",
      borderRadius: type === "cta" ? 14 : 10,
      fontSize: type === "cta" ? 17 : 22,
      url: type === "cta" ? "https://example.com/portfolio" : ""
    };

    setOverlays((items) => [...items, overlay]);
    setSelectedOverlayId(overlay.id);
  }

  function deleteSelectedOverlay() {
    if (!selectedOverlay) {
      return;
    }

    setOverlays((items) => items.filter((overlay) => overlay.id !== selectedOverlay.id));
    setSelectedOverlayId(overlays.find((overlay) => overlay.id !== selectedOverlay.id)?.id ?? "");
  }

  async function handleImageOverlay(fileList: FileList | null) {
    const image = fileList?.[0];

    if (!image || !selectedOverlay || selectedOverlay.type !== "image") {
      return;
    }

    const dataUrl = await fileToDataUrl(image);
    updateOverlay(selectedOverlay.id, {
      src: dataUrl,
      text: image.name,
      name: image.name
    });
  }

  async function exportZip() {
    setExportMessage("Preparing ZIP...");
    const zip = new JSZip();
    const safeVideoName = file ? safeFileName(file.name) : "missing-video.mp4";
    const videoPath = `assets/${safeVideoName}`;

    if (file) {
      zip.file(videoPath, await file.arrayBuffer());
    }

    const project = {
      title: "Video to Playable MVP",
      canvas: "360x640",
      video: file
        ? {
            file: videoPath,
            name: file.name,
            type: file.type,
            size: file.size,
            metadata
          }
        : null,
      trim: { start: trimStart, end: effectiveEnd },
      fitMode,
      backgroundColor,
      overlays,
      limitation: file ? null : "Video file was not included because no local file was selected in this browser session."
    };

    zip.file("index.html", createVideoIndexHtml());
    zip.file("style.css", createVideoStyleCss());
    zip.file("playable.js", createVideoPlayableJs(project));
    zip.file("project.json", JSON.stringify(project, null, 2));
    zip.file("README_EXPORT.txt", createVideoReadme(Boolean(file)));

    const blob = await zip.generateAsync({ type: "blob" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "video-to-playable-mvp.zip";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    setExportMessage(`Downloaded video-to-playable-mvp.zip (${Math.round(blob.size / 1024)} KB).`);
  }

  const visibleOverlays = useMemo(
    () => overlays.filter((overlay) => overlay.type !== "endCard" || showEndCard),
    [overlays, showEndCard]
  );

  return (
    <div className="space-y-6">
      <section className="studio-panel rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-bold text-blue-700">Video to Playable MVP</p>
            <h1 className="text-3xl font-black text-slate-950">Convert a video into a playable-style HTML5 package</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload MP4/WebM, tune fit and trim, place interactive overlays, preview in a 360x640 phone frame, then export a local ZIP.
            </p>
          </div>
          <button
            type="button"
            onClick={exportZip}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
          >
            <Download className="size-4" aria-hidden />
            Export ZIP
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[330px_1fr_330px]">
        <aside className="space-y-4">
          <Panel title="1. Video Source" icon={<Upload className="size-4" aria-hidden />}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-blue-300 bg-blue-50 p-4 text-sm font-bold text-blue-700">
              <Video className="size-5" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file?.name || "Choose MP4/WebM file"}</span>
              <input type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(event) => handleVideoFile(event.target.files?.[0])} />
            </label>
            {metadata ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <Metric label="Duration" value={`${metadata.duration.toFixed(1)}s`} />
                <Metric label="Size" value={`${Math.round(metadata.size / 1024)} KB`} />
                <Metric label="Video" value={`${metadata.width}x${metadata.height}`} />
                <Metric label="Type" value={metadata.type || "video"} />
              </dl>
            ) : (
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Re-upload after a page refresh because browsers cannot restore local video File objects from LocalStorage.
              </p>
            )}
          </Panel>

          <Panel title="2. Fit & Trim" icon={<Scissors className="size-4" aria-hidden />}>
            <FieldSelect
              label="Fit mode"
              value={fitMode}
              onChange={(value) => setFitMode(value as FitMode)}
              options={[
                ["cover", "Cover"],
                ["contain", "Contain"],
                ["stretch", "Fill / Stretch"]
              ]}
            />
            <FieldColor label="Background" value={backgroundColor} onChange={setBackgroundColor} />
            <div className="grid grid-cols-2 gap-3">
              <FieldNumber label="Start" value={trimStart} onChange={(value) => setTrimStart(Math.max(0, value))} />
              <FieldNumber label="End" value={trimEnd} onChange={(value) => setTrimEnd(Math.max(0, value))} />
            </div>
            <button
              type="button"
              onClick={previewFromStart}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-black text-white"
            >
              <Play className="size-4" aria-hidden />
              Preview From Start
            </button>
          </Panel>

          <Panel title="3. Add Overlays" icon={<Layers className="size-4" aria-hidden />}>
            <div className="grid grid-cols-2 gap-2">
              <ToolButton label="Text" icon={<Plus className="size-4" />} onClick={() => addOverlay("text")} />
              <ToolButton label="CTA" icon={<MousePointerClick className="size-4" />} onClick={() => addOverlay("cta")} />
              <ToolButton label="Image" icon={<ImagePlus className="size-4" />} onClick={() => addOverlay("image")} />
              <ToolButton label="End Card" icon={<RefreshCcw className="size-4" />} onClick={() => addOverlay("endCard")} />
            </div>
            <div className="mt-3 space-y-2">
              {overlays.map((overlay) => (
                <button
                  key={overlay.id}
                  type="button"
                  onClick={() => setSelectedOverlayId(overlay.id)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs font-bold ${
                    selectedOverlayId === overlay.id
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <span className="truncate">{overlay.name}</span>
                  <span className="rounded bg-slate-100 px-2 py-1 text-[10px] uppercase text-slate-500">{overlay.type}</span>
                </button>
              ))}
            </div>
          </Panel>
        </aside>

        <section className="studio-panel rounded-lg p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">Playable Preview</h2>
              <p className="text-xs text-slate-500">Drag overlays directly on the phone frame. Use the corner handle to resize.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowEndCard((value) => !value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              Toggle End Card
            </button>
          </div>

          <div className="mx-auto max-w-[392px] rounded-[38px] border border-slate-300 bg-gradient-to-b from-white to-slate-100 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
            <div
              ref={frameRef}
              className="relative h-[640px] w-[360px] overflow-hidden rounded-[28px] border border-slate-300 shadow-inner"
              style={{ backgroundColor }}
              onPointerDown={() => setSelectedOverlayId("")}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex h-9 items-center justify-between bg-slate-950/45 px-5 text-[10px] font-black text-white/85 backdrop-blur-sm">
                <span>9:41</span>
                <span className="absolute left-1/2 top-2.5 h-4 w-24 -translate-x-1/2 rounded-full bg-black/80 shadow-sm" />
                <span>Preview</span>
              </div>

              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  muted
                  playsInline
                  controls
                  className="absolute inset-0 h-full w-full"
                  style={{ objectFit: fitMode === "stretch" ? "fill" : fitMode }}
                  onLoadedMetadata={handleMetadata}
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-slate-950 text-center text-white">
                  <div>
                    <Video className="mx-auto mb-4 size-14 text-blue-300" aria-hidden />
                    <p className="text-sm font-bold">Upload a video to start</p>
                  </div>
                </div>
              )}

              {visibleOverlays.map((overlay) => (
                <OverlayView
                  key={overlay.id}
                  overlay={overlay}
                  selected={selectedOverlayId === overlay.id}
                  onSelect={() => setSelectedOverlayId(overlay.id)}
                  onDragStart={(event) => {
                    event.stopPropagation();
                    const pointer = pointerToFrame(event);
                    setOperation({
                      type: "drag",
                      id: overlay.id,
                      startX: pointer.x,
                      startY: pointer.y,
                      overlayX: overlay.x,
                      overlayY: overlay.y
                    });
                  }}
                  onResizeStart={(event) => {
                    event.stopPropagation();
                    const pointer = pointerToFrame(event);
                    setOperation({
                      type: "resize",
                      id: overlay.id,
                      startX: pointer.x,
                      startY: pointer.y,
                      width: overlay.width,
                      height: overlay.height
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="studio-panel rounded-lg p-5"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">Properties</h2>
              <p className="text-xs text-slate-500">{selectedOverlay ? selectedOverlay.name : "Select an overlay to edit."}</p>
            </div>
            <button
              type="button"
              disabled={!selectedOverlay}
              onClick={deleteSelectedOverlay}
              className="grid size-9 place-items-center rounded-md border border-red-200 bg-red-50 text-red-700 disabled:opacity-40"
              title="Delete selected overlay"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>

          {selectedOverlay ? (
            <div className="space-y-3">
              <Field label="Name" value={selectedOverlay.name} onChange={(value) => updateOverlay(selectedOverlay.id, { name: value })} />
              <div className="grid grid-cols-2 gap-3">
                <FieldNumber label="X" value={Math.round(selectedOverlay.x)} onChange={(value) => updateOverlay(selectedOverlay.id, { x: value })} />
                <FieldNumber label="Y" value={Math.round(selectedOverlay.y)} onChange={(value) => updateOverlay(selectedOverlay.id, { y: value })} />
                <FieldNumber label="Width" value={Math.round(selectedOverlay.width)} onChange={(value) => updateOverlay(selectedOverlay.id, { width: value })} />
                <FieldNumber label="Height" value={Math.round(selectedOverlay.height)} onChange={(value) => updateOverlay(selectedOverlay.id, { height: value })} />
              </div>
              {selectedOverlay.type !== "image" ? (
                <FieldTextArea label="Text" value={selectedOverlay.text} onChange={(value) => updateOverlay(selectedOverlay.id, { text: value })} />
              ) : (
                <label className="block">
                  <span className="studio-label">Image source</span>
                  <span className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-blue-300 bg-blue-50 px-3 py-3 text-xs font-bold text-blue-700">
                    <ImagePlus className="size-4" aria-hidden />
                    Upload overlay image
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(event) => handleImageOverlay(event.target.files)} />
                  </span>
                </label>
              )}
              <FieldNumber label="Font size" value={selectedOverlay.fontSize} onChange={(value) => updateOverlay(selectedOverlay.id, { fontSize: value })} />
              <FieldColor label="Background" value={selectedOverlay.backgroundColor} onChange={(value) => updateOverlay(selectedOverlay.id, { backgroundColor: value })} />
              <FieldColor label="Text color" value={selectedOverlay.textColor} onChange={(value) => updateOverlay(selectedOverlay.id, { textColor: value })} />
              <FieldNumber label="Radius" value={selectedOverlay.borderRadius} onChange={(value) => updateOverlay(selectedOverlay.id, { borderRadius: value })} />
              {selectedOverlay.type === "cta" ? (
                <Field label="CTA URL" value={selectedOverlay.url} onChange={(value) => updateOverlay(selectedOverlay.id, { url: value })} />
              ) : null}
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                Export uses local HTML, CSS, and JS. CTA links are placeholders until adapted to an ad network click API.
              </div>
              {exportMessage ? <p className="text-sm font-bold text-slate-900">{exportMessage}</p> : null}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
              Select an overlay in the layer list or phone preview to edit its properties.
            </div>
          )}
        </motion.aside>
      </div>
    </div>
  );
}

function OverlayView({
  overlay,
  selected,
  onSelect,
  onDragStart,
  onResizeStart
}: {
  overlay: VideoOverlay;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (event: ReactPointerEvent) => void;
  onResizeStart: (event: ReactPointerEvent) => void;
}) {
  return (
    <div
      className={`absolute z-[600] select-none ${selected ? "ring-2 ring-blue-400" : ""}`}
      style={{
        left: overlay.x,
        top: overlay.y,
        width: overlay.width,
        height: overlay.height
      }}
      onPointerDown={(event) => {
        onSelect();
        onDragStart(event);
      }}
    >
      {overlay.type === "image" ? (
        overlay.src ? (
          <img src={overlay.src} alt="" className="h-full w-full object-contain" draggable={false} />
        ) : (
          <div className="grid h-full w-full place-items-center rounded-lg border border-dashed border-white/40 bg-white/70 text-xs font-black text-slate-700">
            Image
          </div>
        )
      ) : (
        <button
          type="button"
          className="h-full w-full whitespace-pre-wrap border-0 px-3 text-center font-black shadow-lg"
          style={{
            background: overlay.backgroundColor,
            borderRadius: overlay.borderRadius,
            color: overlay.textColor,
            fontSize: overlay.fontSize,
            lineHeight: 1.08
          }}
          onClick={(event) => {
            if (overlay.type !== "cta") {
              return;
            }

            event.stopPropagation();
            window.open(overlay.url || "https://example.com/portfolio", "_blank", "noopener,noreferrer");
          }}
        >
          {overlay.text}
        </button>
      )}
      {selected ? (
        <button
          type="button"
          className="absolute -bottom-2 -right-2 size-5 rounded-full border border-white bg-blue-600 shadow"
          title="Resize overlay"
          onPointerDown={onResizeStart}
        />
      ) : null}
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="studio-panel rounded-lg p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
        <span className="grid size-8 place-items-center rounded-md bg-blue-50 text-blue-600">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 truncate font-black text-slate-950">{value}</dd>
    </div>
  );
}

function ToolButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function FieldTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <textarea className="studio-input min-h-24 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function FieldNumber({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input type="number" className="studio-input" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function FieldColor({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <span className="flex items-center gap-2">
        <input type="color" value={normalizeColor(value)} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 rounded-md border border-slate-200 bg-white p-1" />
        <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <select className="studio-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function safeFileName(value: string) {
  const dotIndex = value.lastIndexOf(".");
  const name = dotIndex >= 0 ? value.slice(0, dotIndex) : value;
  const extension = dotIndex >= 0 ? value.slice(dotIndex + 1).toLowerCase() : "mp4";

  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "video"}.${extension}`;
}

function normalizeColor(value: string) {
  return value.startsWith("#") && (value.length === 4 || value.length === 7) ? value : "#2563eb";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function createVideoIndexHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <title>Video Playable Export</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <main id="playable"></main>
    <script src="./playable.js"></script>
  </body>
</html>`;
}

function createVideoStyleCss() {
  return `*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#0f172a;font-family:Arial,sans-serif}body{display:grid;place-items:center;overflow:hidden}#playable{position:relative;width:min(100vw,360px);height:min(100vh,640px);aspect-ratio:9/16;overflow:hidden;background:#0f172a}.video{position:absolute;inset:0;width:100%;height:100%}.overlay{position:absolute;z-index:2;display:grid;place-items:center;text-align:center;white-space:pre-wrap;font-weight:900;line-height:1.08;box-shadow:0 18px 36px rgba(0,0,0,.25)}.overlay img{width:100%;height:100%;object-fit:contain}.cta{border:0}.end-card{opacity:0;pointer-events:none;transform:translateY(16px);transition:.25s ease}.show-end .end-card{opacity:1;pointer-events:auto;transform:translateY(0)}`;
}

function createVideoPlayableJs(project: unknown) {
  return `"use strict";
const PROJECT = ${JSON.stringify(project)};
const root = document.getElementById("playable");
let showEnd = false;

function render() {
  root.innerHTML = "";
  root.style.background = PROJECT.backgroundColor;
  root.className = showEnd ? "show-end" : "";

  if (PROJECT.video) {
    const video = document.createElement("video");
    video.className = "video";
    video.src = PROJECT.video.file;
    video.muted = true;
    video.playsInline = true;
    video.controls = true;
    video.style.objectFit = PROJECT.fitMode === "stretch" ? "fill" : PROJECT.fitMode;
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = PROJECT.trim.start || 0;
      video.play().catch(() => {});
    });
    video.addEventListener("timeupdate", () => {
      if (PROJECT.trim.end && video.currentTime >= PROJECT.trim.end) {
        video.pause();
        showEnd = true;
        render();
      }
    });
    root.appendChild(video);
  } else {
    const missing = document.createElement("div");
    missing.className = "overlay";
    missing.style.cssText = "left:30px;top:240px;width:300px;height:130px;background:rgba(255,255,255,.92);border-radius:14px;color:#0f172a;font-size:18px;padding:18px";
    missing.textContent = PROJECT.limitation || "Missing local video asset.";
    root.appendChild(missing);
  }

  PROJECT.overlays.forEach((overlay) => {
    if (overlay.type === "endCard" && !showEnd) return;
    const el = document.createElement(overlay.type === "cta" ? "button" : "div");
    el.className = "overlay " + (overlay.type === "cta" ? "cta" : "") + " " + (overlay.type === "endCard" ? "end-card" : "");
    el.style.left = overlay.x + "px";
    el.style.top = overlay.y + "px";
    el.style.width = overlay.width + "px";
    el.style.height = overlay.height + "px";
    el.style.background = overlay.backgroundColor;
    el.style.color = overlay.textColor;
    el.style.borderRadius = overlay.borderRadius + "px";
    el.style.fontSize = overlay.fontSize + "px";
    if (overlay.type === "image" && overlay.src) {
      const img = document.createElement("img");
      img.src = overlay.src;
      el.appendChild(img);
    } else {
      el.textContent = overlay.text;
    }
    if (overlay.type === "cta") {
      el.addEventListener("click", () => {
        window.location.href = overlay.url || "https://example.com/portfolio";
      });
    }
    root.appendChild(el);
  });
}

render();`;
}

function createVideoReadme(hasVideo: boolean) {
  return `Video to Playable MVP Export
============================

How to test:
1. Unzip this package.
2. Open index.html in a browser.
3. Play the video, test trim/end-card behavior, and click the CTA overlay.

Included:
- index.html
- style.css
- playable.js
- project.json
${hasVideo ? "- assets/: selected local video file" : "- No video file was included because the browser session did not have a selected file."}

MVP notes:
- This is a local learning export, not a certified ad-network upload.
- Production networks may require MRAID, file-size compression, click macros, and QA validation.`;
}
