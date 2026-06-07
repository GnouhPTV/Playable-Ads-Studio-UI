"use client";

import { AlertTriangle, FileType, ImagePlus, Music2, Trash2, Upload, Video, Wand2 } from "lucide-react";
import type { EditorObject, PlayableAsset, PlayableProject } from "@/types/project";
import { useEditorStore } from "@/store/editorStore";

function createAssetId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `asset-${crypto.randomUUID()}`;
  }

  return `asset-${Date.now()}`;
}

export function AssetManager(_props?: { project?: PlayableProject }) {
  const assets = useEditorStore((state) => state.assets);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const objects = useEditorStore((state) => state.objects);
  const addAsset = useEditorStore((state) => state.addAsset);
  const deleteAsset = useEditorStore((state) => state.deleteAsset);
  const addObject = useEditorStore((state) => state.addObject);
  const updateObject = useEditorStore((state) => state.updateObject);
  const selectedObject = objects.find((object) => object.id === selectedObjectId) ?? null;

  function uploadFiles(fileList: FileList | null, forcedType?: PlayableAsset["type"]) {
    const files = Array.from(fileList ?? []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const mimeType = file.type || "application/octet-stream";
        const type =
          forcedType ??
          (mimeType.startsWith("audio/")
            ? "audio"
            : mimeType.startsWith("video/")
              ? "video"
            : file.name.toLowerCase().includes("sprite")
              ? "spriteSheet"
              : "image");
        const asset: PlayableAsset = {
          id: createAssetId(),
          name: file.name,
          type,
          dataUrl: String(reader.result),
          mimeType,
          usage: "none",
          size: file.size
        };
        addAsset(asset);
      };
      reader.readAsDataURL(file);
    });
  }

  function addAssetToCanvas(asset: PlayableAsset) {
    if (asset.type === "audio") {
      addObject("audio", {
        name: asset.name,
        width: 112,
        height: 48,
        props: {
          assetId: asset.id,
          src: asset.dataUrl,
          volume: 0.8,
          loop: false,
          playOnSceneStart: false,
          playOnClick: true
        }
      });
      return;
    }

    if (asset.type === "spriteSheet") {
      addObject("animatedSprite", {
        name: asset.name,
        width: 120,
        height: 120,
        props: {
          assetId: asset.id,
          src: asset.dataUrl,
          frameWidth: 64,
          frameHeight: 64,
          frameCount: 4,
          fps: 8,
          loop: true,
          autoplay: true
        }
      });
      return;
    }

    if (asset.type === "video") {
      addObject("video", {
        name: asset.name,
        width: 220,
        height: 180,
        props: {
          assetId: asset.id,
          src: asset.dataUrl,
          fit: "cover",
          muted: true,
          loop: false,
          autoplay: true,
          controls: false,
          startTime: 0,
          endTime: 0
        }
      });
      return;
    }

    addObject("image", {
      name: asset.name,
      width: 132,
      height: 132,
      props: {
        assetId: asset.id,
        src: asset.dataUrl,
        fit: "contain",
        borderRadius: 10
      }
    });
  }

  function assignToSelected(asset: PlayableAsset, object: EditorObject | null) {
    if (!object) {
      return;
    }

    if (asset.type === "audio" && object.type === "audio") {
      updateObject(object.id, {
        name: object.name === "Audio" ? asset.name : object.name,
        props: {
          ...object.props,
          assetId: asset.id,
          src: asset.dataUrl
        }
      });
      return;
    }

    if (asset.type === "spriteSheet" && object.type === "animatedSprite") {
      updateObject(object.id, {
        name: object.name === "Animated Sprite" ? asset.name : object.name,
        props: {
          ...object.props,
          assetId: asset.id,
          src: asset.dataUrl
        }
      });
      return;
    }

    if (asset.type === "image" && (object.type === "image" || object.type === "background")) {
      updateObject(object.id, {
        name: object.name === "Image" ? asset.name : object.name,
        props: {
          ...object.props,
          assetId: asset.id,
          src: asset.dataUrl
        }
      });
      return;
    }

    if (asset.type === "video" && object.type === "video") {
      updateObject(object.id, {
        name: object.name === "Video" ? asset.name : object.name,
        props: {
          ...object.props,
          assetId: asset.id,
          src: asset.dataUrl
        }
      });
    }
  }

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-black text-slate-950">Assets</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Upload local files. Assets are stored as DataURLs in LocalStorage for this MVP.
        </p>
      </div>

      <div className="grid gap-2">
        <UploadButton label="Upload Image" accept="image/png,image/jpeg,image/webp,image/svg+xml" icon={ImagePlus} onUpload={(files) => uploadFiles(files, "image")} />
        <UploadButton label="Upload Video" accept="video/mp4,video/webm" icon={Video} onUpload={(files) => uploadFiles(files, "video")} helper="Stored as a local video asset for preview and export." />
        <UploadButton label="Upload Sprite Sheet" accept="image/png,image/webp" icon={Wand2} onUpload={(files) => uploadFiles(files, "spriteSheet")} />
        <UploadButton label="Upload Audio" accept="audio/mpeg,audio/wav,audio/ogg" icon={Music2} onUpload={(files) => uploadFiles(files, "audio")} />
        <UploadButton label="Upload Font" accept=".ttf,.otf,.woff,.woff2" icon={FileType} onUpload={() => undefined} helper="Placeholder for future font loading." />
      </div>

      <div className="mt-4 space-y-3">
        {assets.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
            No uploaded assets yet. You can still use generated placeholder objects.
          </div>
        ) : (
          assets.map((asset) => (
            <article
              key={asset.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/playable-asset-id", asset.id);
              }}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-panel"
          >
              <div className="flex gap-3">
                <AssetThumb asset={asset} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-900">{asset.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {asset.type} - {Math.round(asset.size / 1024)} KB
                  </div>
                  {asset.size > 1_500_000 ? (
                    <div className="mt-2 flex items-start gap-1.5 text-xs leading-4 text-amber-700">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      Large for a playable export.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addAssetToCanvas(asset)}
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                >
                  Add to Canvas
                </button>
                <button
                  type="button"
                  disabled={!selectedObject}
                  onClick={() => assignToSelected(asset, selectedObject)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-40"
                >
                  Assign Selected
                </button>
                <button
                  type="button"
                  onClick={() => deleteAsset(asset.id)}
                  className="ml-auto grid size-8 place-items-center rounded-md border border-red-200 bg-red-50 text-red-700"
                  title="Delete asset"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function UploadButton({
  label,
  accept,
  icon: Icon,
  onUpload,
  helper
}: {
  label: string;
  accept: string;
  icon: typeof ImagePlus;
  onUpload: (files: FileList | null) => void;
  helper?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50">
      <span className="grid size-9 place-items-center rounded-md bg-blue-50 text-blue-600">
        <Icon className="size-4" aria-hidden />
      </span>
      <span>
        <span className="block">{label}</span>
        {helper ? <span className="block text-[11px] font-medium text-slate-500">{helper}</span> : null}
      </span>
      <Upload className="ml-auto size-4 text-slate-400" aria-hidden />
      <input type="file" accept={accept} multiple className="sr-only" onChange={(event) => onUpload(event.target.files)} />
    </label>
  );
}

function AssetThumb({ asset }: { asset: PlayableAsset }) {
  if (asset.type === "audio") {
    return (
      <div className="grid size-14 shrink-0 place-items-center rounded-md border border-blue-200 bg-blue-50 text-blue-600">
        <Music2 className="size-5" aria-hidden />
      </div>
    );
  }

  if (asset.type === "video") {
    return (
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-950">
        <video src={asset.dataUrl} className="h-full w-full object-cover opacity-80" muted playsInline />
        <Video className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-white" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={asset.dataUrl}
      alt=""
      className="size-14 shrink-0 rounded-md border border-slate-200 object-cover"
      draggable={false}
    />
  );
}
