"use client";

import type { PlayableDuration, PlayableProject, PlayableScene } from "@/types/project";
import { AssetManager } from "@/components/editor/AssetManager";
import { InteractionPanel } from "@/components/editor/InteractionPanel";
import { useEditorStore } from "@/store/editorStore";

interface PropertiesPanelProps {
  project: PlayableProject;
  selectedScene: PlayableScene | null;
}

export function PropertiesPanel({ project, selectedScene }: PropertiesPanelProps) {
  const updateSettings = useEditorStore((state) => state.updateSettings);
  const updateScene = useEditorStore((state) => state.updateScene);

  return (
    <aside className="studio-panel scrollbar-soft max-h-[calc(100vh-97px)] overflow-auto rounded-lg p-4">
      <div className="mb-5">
        <h2 className="text-sm font-black uppercase tracking-normal text-slate-950">Properties</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">Live preview updates as values change.</p>
      </div>

      <Section title="Game Settings">
        <TextField
          label="Game title"
          value={project.settings.title}
          onChange={(value) => updateSettings({ title: value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Duration"
            value={String(project.settings.duration)}
            onChange={(value) => updateSettings({ duration: Number(value) as PlayableDuration })}
            options={[
              ["15", "15s"],
              ["30", "30s"],
              ["45", "45s"]
            ]}
          />
          <NumberField
            label="Target score"
            value={project.settings.targetScore}
            onChange={(value) => updateSettings({ targetScore: value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Main color"
            value={project.settings.mainColor}
            onChange={(value) => updateSettings({ mainColor: value })}
          />
          <ColorField
            label="Accent"
            value={project.settings.accentColor}
            onChange={(value) => updateSettings({ accentColor: value })}
          />
        </div>
        <SelectField
          label="Background style"
          value={project.settings.backgroundStyle}
          onChange={(value) => updateSettings({ backgroundStyle: value as never })}
          options={[
            ["midnightGrid", "Midnight grid"],
            ["sunsetArena", "Sunset arena"],
            ["forestArcade", "Forest arcade"],
            ["cleanStudio", "Clean studio"]
          ]}
        />
        <SelectField
          label="Difficulty"
          value={project.settings.difficulty}
          onChange={(value) => updateSettings({ difficulty: value as never })}
          options={[
            ["easy", "Easy"],
            ["normal", "Normal"],
            ["hard", "Hard"]
          ]}
        />
        <TextField
          label="CTA button text"
          value={project.settings.ctaText}
          onChange={(value) => updateSettings({ ctaText: value })}
        />
        <TextField
          label="Portfolio URL placeholder"
          value={project.settings.ctaUrl}
          onChange={(value) => updateSettings({ ctaUrl: value })}
        />
      </Section>

      <Section title="Text Editor">
        <TextField
          label="Intro title"
          value={project.settings.introTitle}
          onChange={(value) => updateSettings({ introTitle: value })}
        />
        <TextAreaField
          label="Intro subtitle"
          value={project.settings.introSubtitle}
          onChange={(value) => updateSettings({ introSubtitle: value })}
        />
        <TextField
          label="Play button text"
          value={project.settings.playButtonText}
          onChange={(value) => updateSettings({ playButtonText: value })}
        />
        <TextField
          label="End card title"
          value={project.settings.endCardTitle}
          onChange={(value) => updateSettings({ endCardTitle: value })}
        />
        <TextAreaField
          label="End card subtitle"
          value={project.settings.endCardSubtitle}
          onChange={(value) => updateSettings({ endCardSubtitle: value })}
        />
      </Section>

      {selectedScene ? (
        <Section title="Scene Settings">
          <TextField
            label="Scene title"
            value={selectedScene.title}
            onChange={(value) => updateScene(selectedScene.id, { title: value })}
          />
          <TextAreaField
            label="Scene subtitle"
            value={selectedScene.subtitle}
            onChange={(value) => updateScene(selectedScene.id, { subtitle: value })}
          />
          <TextField
            label="Button text"
            value={selectedScene.buttonText}
            onChange={(value) => updateScene(selectedScene.id, { buttonText: value })}
          />
          <NumberField
            label="Scene duration"
            value={selectedScene.duration}
            onChange={(value) => updateScene(selectedScene.id, { duration: value })}
          />
          <ColorField
            label="Background color"
            value={selectedScene.backgroundColor}
            onChange={(value) => updateScene(selectedScene.id, { backgroundColor: value })}
          />
          <TextField
            label="Scene CTA text"
            value={selectedScene.ctaText}
            onChange={(value) => updateScene(selectedScene.id, { ctaText: value })}
          />
          <TextField
            label="Win message"
            value={selectedScene.winMessage}
            onChange={(value) => updateScene(selectedScene.id, { winMessage: value })}
          />
          <TextField
            label="Lose message"
            value={selectedScene.loseMessage}
            onChange={(value) => updateScene(selectedScene.id, { loseMessage: value })}
          />
        </Section>
      ) : null}

      <AssetManager project={project} />
      <InteractionPanel project={project} />
    </aside>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-black text-slate-950">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <textarea
        className="studio-input min-h-24 resize-y"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input
        type="number"
        min={0}
        className="studio-input"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 rounded-lg border border-slate-200 bg-white p-1"
        />
        <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

function SelectField({
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
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}
