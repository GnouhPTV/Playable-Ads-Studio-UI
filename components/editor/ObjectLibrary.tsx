"use client";

import { useState } from "react";
import {
  Box,
  Clock3,
  FileImage,
  Film,
  Gamepad2,
  Image,
  Layers3,
  Library,
  Link2,
  MousePointerClick,
  Music2,
  PanelLeft,
  Plus,
  Settings2,
  Shapes,
  Type,
  Video,
  Wand2
} from "lucide-react";
import type { EditorObjectType, InteractionMechanic } from "@/types/project";
import { AssetManager } from "@/components/editor/AssetManager";
import { SceneManager } from "@/components/editor/SceneManager";
import { Tooltip } from "@/components/editor/Tooltip";
import { useEditorStore } from "@/store/editorStore";

type LibraryTab = "objects" | "assets" | "scenes" | "templates" | "interactions" | "export";

const objectButtons: { type: EditorObjectType; label: string; icon: typeof Type }[] = [
  { type: "text", label: "Add Text", icon: Type },
  { type: "image", label: "Add Image", icon: Image },
  { type: "video", label: "Add Video", icon: Video },
  { type: "button", label: "Add Button", icon: MousePointerClick },
  { type: "shape", label: "Add Shape", icon: Shapes },
  { type: "animatedSprite", label: "Add Animated Sprite", icon: Film },
  { type: "audio", label: "Add Audio", icon: Music2 },
  { type: "background", label: "Add Background", icon: FileImage },
  { type: "ctaButton", label: "Add CTA Button", icon: PanelLeft }
];

export function ObjectLibrary() {
  const [tab, setTab] = useState<LibraryTab>("objects");
  const project = useEditorStore((state) => state.project);
  const currentSceneId = useEditorStore((state) => state.currentSceneId);
  const addObject = useEditorStore((state) => state.addObject);
  const setMechanic = useEditorStore((state) => state.setMechanic);
  const updateSettings = useEditorStore((state) => state.updateSettings);

  function addTemplate(template: string) {
    if (!project || !currentSceneId) {
      return;
    }

    if (template === "intro") {
      addObject("text", {
        name: "Intro Screen Title",
        x: 34,
        y: 128,
        width: 292,
        height: 72,
        props: {
          text: "Ready to Play?",
          fontSize: 31,
          fontWeight: "900",
          color: "#ffffff",
          align: "center",
          strokeColor: "#000000",
          strokeWidth: 0,
          shadow: true
        },
        animations: ["slideDown"]
      });
      addObject("button", {
        name: "Play Button",
        x: 80,
        y: 430,
        width: 200,
        height: 56,
        props: {
          label: "Play Now",
          backgroundColor: project.settings.mainColor,
          textColor: "#071014",
          borderRadius: 14,
          action: { type: "startGame" }
        },
        actions: [{ type: "startGame" }],
        animations: ["popIn"]
      });
      return;
    }

    if (template === "endCard") {
      addObject("text", {
        name: "End Card Headline",
        x: 36,
        y: 154,
        width: 288,
        height: 76,
        props: {
          text: "Great Run!",
          fontSize: 30,
          fontWeight: "900",
          color: "#ffffff",
          align: "center",
          strokeColor: "#000000",
          strokeWidth: 0,
          shadow: true
        }
      });
      addObject("ctaButton", {
        name: "End Card CTA",
        x: 62,
        y: 432,
        width: 236,
        height: 58,
        props: {
          label: project.settings.ctaText,
          backgroundColor: project.settings.accentColor,
          textColor: "#071014",
          borderRadius: 16,
          action: { type: "openUrl", url: project.settings.ctaUrl }
        },
        actions: [{ type: "openUrl", url: project.settings.ctaUrl }]
      });
      return;
    }

    if (template === "scoreHud") {
      addObject("text", {
        name: "Score HUD",
        x: 18,
        y: 44,
        width: 132,
        height: 30,
        props: {
          text: "Score 0",
          fontSize: 16,
          fontWeight: "800",
          color: "#ffffff",
          align: "left",
          strokeColor: "#000000",
          strokeWidth: 0,
          shadow: true
        }
      });
      return;
    }

    if (template === "timerHud") {
      addObject("text", {
        name: "Timer HUD",
        x: 242,
        y: 44,
        width: 100,
        height: 30,
        props: {
          text: "30s",
          fontSize: 16,
          fontWeight: "800",
          color: "#ffffff",
          align: "right",
          strokeColor: "#000000",
          strokeWidth: 0,
          shadow: true
        }
      });
      return;
    }

    addObject("shape", {
      name:
        template === "tapMonster"
          ? "Tap Monster Object"
          : template === "runnerPlayer"
            ? "Runner Player Object"
            : "Merge Cannon Object",
      x: template === "mergeCannon" ? 138 : 130,
      y: template === "mergeCannon" ? 500 : 300,
      width: template === "mergeCannon" ? 84 : 100,
      height: template === "mergeCannon" ? 84 : 100,
      props: {
        shape: "circle",
        fillColor: template === "tapMonster" ? "#f472b6" : project.settings.mainColor,
        strokeColor: project.settings.accentColor,
        strokeWidth: 4
      },
      animations: template === "tapMonster" ? ["pulse"] : ["none"]
    });
  }

  return (
    <aside className="studio-panel scrollbar-soft h-full overflow-auto rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-sm font-black text-slate-950">Builder Library</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">Add objects, scenes, assets, logic, and export settings.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <TabButton tab="objects" activeTab={tab} onClick={setTab} icon={Box} label="Objects" />
        <TabButton tab="assets" activeTab={tab} onClick={setTab} icon={FileImage} label="Assets" />
        <TabButton tab="scenes" activeTab={tab} onClick={setTab} icon={Layers3} label="Scenes" />
        <TabButton tab="templates" activeTab={tab} onClick={setTab} icon={Library} label="Templates" />
        <TabButton tab="interactions" activeTab={tab} onClick={setTab} icon={Link2} label="Interactions" />
        <TabButton tab="export" activeTab={tab} onClick={setTab} icon={Settings2} label="Export" />
      </div>

      {tab === "objects" ? (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-950">Add Object</h2>
              <p className="mt-1 text-xs text-slate-500">Click once to place an object on canvas.</p>
            </div>
            <Tooltip label="Object" text="Objects are editable items on the 360x640 scene: text, images, buttons, shapes, audio, and CTA buttons." />
          </div>
          <div className="grid gap-2">
            {objectButtons.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addObject(item.type)}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="grid size-9 place-items-center rounded-md bg-blue-50 text-blue-600">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {tab === "assets" ? <AssetManager /> : null}
      {tab === "scenes" ? <SceneManager /> : null}

      {tab === "templates" ? (
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-slate-950">Object Templates</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Ready-made groups you can study and adjust.</p>
          </div>
          <div className="grid gap-2">
            {[
              ["intro", "Intro screen title + play button", Wand2],
              ["endCard", "End card layout", PanelLeft],
              ["cta", "CTA button", MousePointerClick],
              ["scoreHud", "Score HUD", Gamepad2],
              ["timerHud", "Timer HUD", Clock3],
              ["tapMonster", "Tap monster object", Shapes],
              ["runnerPlayer", "Runner player object", Gamepad2],
              ["mergeCannon", "Merge cannon object", Shapes]
            ].map(([id, label, Icon]) => (
              <button
                key={String(id)}
                type="button"
                onClick={() => (id === "cta" ? addObject("ctaButton") : addTemplate(String(id)))}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="grid size-8 place-items-center rounded-md bg-blue-50 text-blue-600">
                  <Icon className="size-4" aria-hidden />
                </span>
                {String(label)}
                <Plus className="ml-auto size-4 text-studio-muted" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "interactions" && project ? (
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-slate-950">Playable Logic</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Choose the main MVP interaction. This guides validation and export notes.</p>
          </div>
          <div className="grid gap-2">
            {interactionOptions.map((item) => {
              const Icon = item.icon;
              const active = project.mechanic === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMechanic(item.value)}
                  className={`rounded-lg border p-3 text-left transition ${
                    active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Icon className="size-4 text-blue-600" aria-hidden />
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {tab === "export" && project ? (
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-black text-slate-950">Export Settings</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Local MVP settings for package metadata and ad network planning.</p>
          </div>
          <div className="space-y-3">
            <SelectSetting
              label="Orientation"
              value={project.settings.orientation ?? "portrait"}
              onChange={(value) => updateSettings({ orientation: value as "portrait" | "landscape" })}
              options={[["portrait", "Portrait"], ["landscape", "Landscape"]]}
            />
            <SelectSetting
              label="Target network preset"
              value={project.settings.networkPreset ?? "generic"}
              onChange={(value) => updateSettings({ networkPreset: value as never })}
              options={[
                ["generic", "Generic HTML5"],
                ["meta", "Meta"],
                ["tiktok", "TikTok"],
                ["applovin", "AppLovin"],
                ["mintegral", "Mintegral"],
                ["ironsource", "IronSource"],
                ["unity", "Unity"]
              ]}
            />
            <TextSetting label="CTA URL" value={project.settings.ctaUrl} onChange={(value) => updateSettings({ ctaUrl: value })} />
            <TextSetting label="Package name" value={project.settings.packageName ?? project.templateId} onChange={(value) => updateSettings({ packageName: value })} />
            <NumberSetting label="Playable duration" value={project.settings.duration} onChange={(value) => updateSettings({ duration: value as never })} />
            <NumberSetting label="Compression quality" value={project.settings.compressionQuality ?? 80} onChange={(value) => updateSettings({ compressionQuality: value })} />
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              MRAID compatibility is a planning note in this local MVP. Production networks may need extra QA and wrappers.
            </div>
          </div>
        </section>
      ) : null}
    </aside>
  );
}

const interactionOptions: Array<{
  value: InteractionMechanic;
  label: string;
  description: string;
  icon: typeof MousePointerClick;
}> = [
  { value: "tap", label: "Tap Interaction", description: "Tap targets for score, damage, rewards, or reactions.", icon: MousePointerClick },
  { value: "dragHorizontal", label: "Drag Horizontal", description: "Swipe or drag left and right, useful for runner gates.", icon: Gamepad2 },
  { value: "dragDrop", label: "Drag & Drop", description: "Move objects into zones or onto other objects.", icon: Shapes },
  { value: "merge", label: "Merge", description: "Combine matching items into upgraded units.", icon: Wand2 },
  { value: "autoShoot", label: "Auto Shoot", description: "Repeat-fire mechanic for defense or shooter prototypes.", icon: Gamepad2 },
  { value: "buttonAction", label: "Button Action", description: "CTA, replay, next scene, or open URL actions.", icon: PanelLeft },
  { value: "sceneTransition", label: "Scene Transition", description: "Move between intro, gameplay, and end-card scenes.", icon: Layers3 },
  { value: "endCardTrigger", label: "End Card Trigger", description: "Show final CTA after timer, win, or failure.", icon: Clock3 }
];

function TextSetting({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberSetting({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input type="number" className="studio-input" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function SelectSetting({
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

function TabButton({
  tab,
  activeTab,
  onClick,
  icon: Icon,
  label
}: {
  tab: LibraryTab;
  activeTab: LibraryTab;
  onClick: (tab: LibraryTab) => void;
  icon: typeof Box;
  label: string;
}) {
  const active = tab === activeTab;

  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      title={label}
      className={`flex min-h-12 items-center gap-2 rounded-lg border px-3 text-left transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-slate-950"
      }`}
    >
      <Icon className="size-4" aria-hidden />
      <span className="truncate text-xs font-bold">{label}</span>
    </button>
  );
}
