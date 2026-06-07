"use client";

import type {
  AnimatedSpriteObjectProps,
  AudioObjectProps,
  ButtonObjectProps,
  EditorObject,
  ImageObjectProps,
  PlayableProject,
  ShapeObjectProps,
  TextObjectProps,
  VideoObjectProps
} from "@/types/project";
import { ActionPanel } from "@/components/editor/ActionPanel";
import { AnimationPanel } from "@/components/editor/AnimationPanel";
import { Tooltip } from "@/components/editor/Tooltip";
import { useEditorStore } from "@/store/editorStore";

export function PropertiesInspector({ project }: { project: PlayableProject }) {
  const currentSceneId = useEditorStore((state) => state.currentSceneId);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const updateScene = useEditorStore((state) => state.updateScene);
  const updateObject = useEditorStore((state) => state.updateObject);
  const assets = useEditorStore((state) => state.assets);
  const scene = project.scenes.find((item) => item.id === currentSceneId) ?? project.scenes[0];
  const object = project.objects.find((item) => item.id === selectedObjectId) ?? null;

  function updateProps(nextProps: EditorObject["props"]) {
    if (!object) {
      return;
    }

    updateObject(object.id, { props: nextProps });
  }

  return (
    <aside className="studio-panel scrollbar-soft max-h-[calc(100vh-97px)] overflow-auto rounded-lg p-4">
      <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-slate-950">
            {object ? "Object Properties" : "Scene Properties"}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {object ? object.name : "Select an object to edit its visual settings."}
          </p>
        </div>
        <Tooltip label="Properties" text="Properties are the editable values for the selected object or scene." />
      </div>

      {!object ? (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <TextField label="Scene name" value={scene.title} onChange={(value) => updateScene(scene.id, { title: value })} />
          <ColorField label="Background color" value={scene.backgroundColor} onChange={(value) => updateScene(scene.id, { backgroundColor: value })} />
          <SelectField
            label="Background image"
            value={scene.backgroundImageAssetId ?? ""}
            onChange={(value) => updateScene(scene.id, { backgroundImageAssetId: value || undefined })}
            options={[["", "None"], ...assets.filter((asset) => asset.type === "image").map((asset) => [asset.id, asset.name] as [string, string])]}
          />
          <NumberField label="Scene duration" value={scene.duration} onChange={(value) => updateScene(scene.id, { duration: value })} />
          <SelectField
            label="Scene transition"
            value={scene.transition}
            onChange={(value) => updateScene(scene.id, { transition: value as never })}
            options={[
              ["none", "None"],
              ["fade", "Fade"],
              ["slide", "Slide"],
              ["pop", "Pop"]
            ]}
          />
        </section>
      ) : (
        <div className="space-y-4">
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <TextField label="Layer name" value={object.name} onChange={(value) => updateObject(object.id, { name: value })} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="X" value={object.x} onChange={(value) => updateObject(object.id, { x: value })} />
              <NumberField label="Y" value={object.y} onChange={(value) => updateObject(object.id, { y: value })} />
              <NumberField label="Width" value={object.width} onChange={(value) => updateObject(object.id, { width: value })} />
              <NumberField label="Height" value={object.height} onChange={(value) => updateObject(object.id, { height: value })} />
              <NumberField label="Rotation" value={object.rotation} onChange={(value) => updateObject(object.id, { rotation: value })} />
              <NumberField label="Opacity %" value={Math.round(object.opacity * 100)} onChange={(value) => updateObject(object.id, { opacity: value / 100 })} />
            </div>
          </section>

          <TypeSpecificFields object={object} assets={assets} updateProps={updateProps} />
          <AnimationPanel object={object} />
          <ActionPanel object={object} />
        </div>
      )}
    </aside>
  );
}

function TypeSpecificFields({
  object,
  assets,
  updateProps
}: {
  object: EditorObject;
  assets: PlayableProject["assets"];
  updateProps: (props: EditorObject["props"]) => void;
}) {
  if (object.type === "text") {
    const props = object.props as TextObjectProps;

    return (
      <Section title="Text">
        <TextAreaField label="Text content" value={props.text} onChange={(value) => updateProps({ ...props, text: value })} />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Font size" value={props.fontSize} onChange={(value) => updateProps({ ...props, fontSize: value })} />
          <SelectField
            label="Weight"
            value={props.fontWeight}
            onChange={(value) => updateProps({ ...props, fontWeight: value as TextObjectProps["fontWeight"] })}
            options={[
              ["400", "Regular"],
              ["600", "Semi"],
              ["700", "Bold"],
              ["800", "Extra"],
              ["900", "Black"]
            ]}
          />
        </div>
        <ColorField label="Color" value={props.color} onChange={(value) => updateProps({ ...props, color: value })} />
        <SelectField
          label="Alignment"
          value={props.align}
          onChange={(value) => updateProps({ ...props, align: value as TextObjectProps["align"] })}
          options={[
            ["left", "Left"],
            ["center", "Center"],
            ["right", "Right"]
          ]}
        />
        <ColorField label="Stroke color" value={props.strokeColor} onChange={(value) => updateProps({ ...props, strokeColor: value })} />
        <NumberField label="Stroke width" value={props.strokeWidth} onChange={(value) => updateProps({ ...props, strokeWidth: value })} />
        <CheckboxField label="Shadow" checked={props.shadow} onChange={(value) => updateProps({ ...props, shadow: value })} />
      </Section>
    );
  }

  if (object.type === "image" || object.type === "background") {
    const props = object.props as ImageObjectProps;

    return (
      <Section title={object.type === "background" ? "Background Image" : "Image"}>
        <AssetSelect assets={assets.filter((asset) => asset.type === "image")} value={props.assetId ?? ""} onChange={(assetId) => {
          const asset = assets.find((item) => item.id === assetId);
          updateProps({ ...props, assetId, src: asset?.dataUrl ?? "" });
        }} />
        <SelectField
          label="Fit mode"
          value={props.fit ?? "contain"}
          onChange={(value) => updateProps({ ...props, fit: value as ImageObjectProps["fit"] })}
          options={[
            ["contain", "Contain"],
            ["cover", "Cover"],
            ["stretch", "Stretch"]
          ]}
        />
        <NumberField label="Border radius" value={props.borderRadius ?? 0} onChange={(value) => updateProps({ ...props, borderRadius: value })} />
      </Section>
    );
  }

  if (object.type === "button" || object.type === "ctaButton") {
    const props = object.props as ButtonObjectProps;

    return (
      <Section title={object.type === "ctaButton" ? "CTA Button" : "Button"}>
        <TextField label="Label" value={props.label} onChange={(value) => updateProps({ ...props, label: value })} />
        <ColorField label="Background" value={props.backgroundColor} onChange={(value) => updateProps({ ...props, backgroundColor: value })} />
        <ColorField label="Text color" value={props.textColor} onChange={(value) => updateProps({ ...props, textColor: value })} />
        <NumberField label="Border radius" value={props.borderRadius} onChange={(value) => updateProps({ ...props, borderRadius: value })} />
        {object.type === "ctaButton" ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            CTA URLs are placeholders in this local MVP. Real ad networks may require approved click handling.
          </p>
        ) : null}
      </Section>
    );
  }

  if (object.type === "video") {
    const props = object.props as VideoObjectProps;

    return (
      <Section title="Video">
        <AssetSelect assets={assets.filter((asset) => asset.type === "video")} value={props.assetId ?? ""} onChange={(assetId) => {
          const asset = assets.find((item) => item.id === assetId);
          updateProps({ ...props, assetId, src: asset?.dataUrl ?? "" });
        }} />
        <SelectField
          label="Fit mode"
          value={props.fit ?? "cover"}
          onChange={(value) => updateProps({ ...props, fit: value as VideoObjectProps["fit"] })}
          options={[
            ["contain", "Contain"],
            ["cover", "Cover"],
            ["stretch", "Stretch"]
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Start time" value={props.startTime ?? 0} onChange={(value) => updateProps({ ...props, startTime: Math.max(0, value) })} />
          <NumberField label="End time" value={props.endTime ?? 0} onChange={(value) => updateProps({ ...props, endTime: Math.max(0, value) })} />
        </div>
        <CheckboxField label="Muted" checked={props.muted} onChange={(value) => updateProps({ ...props, muted: value })} />
        <CheckboxField label="Autoplay" checked={props.autoplay} onChange={(value) => updateProps({ ...props, autoplay: value })} />
        <CheckboxField label="Loop" checked={props.loop} onChange={(value) => updateProps({ ...props, loop: value })} />
        <CheckboxField label="Show controls in preview" checked={props.controls} onChange={(value) => updateProps({ ...props, controls: value })} />
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Browser autoplay usually requires muted video until the viewer taps.
        </p>
      </Section>
    );
  }

  if (object.type === "shape") {
    const props = object.props as ShapeObjectProps;

    return (
      <Section title="Shape">
        <SelectField
          label="Shape type"
          value={props.shape}
          onChange={(value) => updateProps({ ...props, shape: value as ShapeObjectProps["shape"] })}
          options={[
            ["rectangle", "Rectangle"],
            ["circle", "Circle"],
            ["roundedRectangle", "Rounded rectangle"]
          ]}
        />
        <ColorField label="Fill color" value={props.fillColor} onChange={(value) => updateProps({ ...props, fillColor: value })} />
        <ColorField label="Stroke color" value={props.strokeColor} onChange={(value) => updateProps({ ...props, strokeColor: value })} />
        <NumberField label="Stroke width" value={props.strokeWidth} onChange={(value) => updateProps({ ...props, strokeWidth: value })} />
      </Section>
    );
  }

  if (object.type === "animatedSprite") {
    const props = object.props as AnimatedSpriteObjectProps;

    return (
      <Section title="Animated Sprite">
        <AssetSelect assets={assets.filter((asset) => asset.type === "spriteSheet")} value={props.assetId ?? ""} onChange={(assetId) => {
          const asset = assets.find((item) => item.id === assetId);
          updateProps({ ...props, assetId, src: asset?.dataUrl ?? "" });
        }} />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Frame width" value={props.frameWidth} onChange={(value) => updateProps({ ...props, frameWidth: value })} />
          <NumberField label="Frame height" value={props.frameHeight} onChange={(value) => updateProps({ ...props, frameHeight: value })} />
          <NumberField label="Frame count" value={props.frameCount} onChange={(value) => updateProps({ ...props, frameCount: value })} />
          <NumberField label="FPS" value={props.fps} onChange={(value) => updateProps({ ...props, fps: value })} />
        </div>
        <CheckboxField label="Loop" checked={props.loop} onChange={(value) => updateProps({ ...props, loop: value })} />
        <CheckboxField label="Autoplay" checked={props.autoplay} onChange={(value) => updateProps({ ...props, autoplay: value })} />
      </Section>
    );
  }

  const props = object.props as AudioObjectProps;

  return (
    <Section title="Audio">
      <AssetSelect assets={assets.filter((asset) => asset.type === "audio")} value={props.assetId ?? ""} onChange={(assetId) => {
        const asset = assets.find((item) => item.id === assetId);
        updateProps({ ...props, assetId, src: asset?.dataUrl ?? "" });
      }} />
      <NumberField label="Volume %" value={Math.round(props.volume * 100)} onChange={(value) => updateProps({ ...props, volume: value / 100 })} />
      <CheckboxField label="Loop" checked={props.loop} onChange={(value) => updateProps({ ...props, loop: value })} />
      <CheckboxField label="Play on scene start" checked={props.playOnSceneStart} onChange={(value) => updateProps({ ...props, playOnSceneStart: value })} />
      <CheckboxField label="Play on click" checked={props.playOnClick} onChange={(value) => updateProps({ ...props, playOnClick: value })} />
    </Section>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <textarea className="studio-input min-h-24 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input type="number" className="studio-input" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <span className="flex items-center gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 rounded-md border border-slate-200 bg-white p-1" />
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

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function AssetSelect({
  assets,
  value,
  onChange
}: {
  assets: PlayableProject["assets"];
  value: string;
  onChange: (assetId: string) => void;
}) {
  return (
    <SelectField
      label="Asset source"
      value={value}
      onChange={onChange}
      options={[["", "No asset"], ...assets.map((asset) => [asset.id, asset.name] as [string, string])]}
    />
  );
}
