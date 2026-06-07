import type { PlayableLogicConfig } from "@/types/logic";

export type TemplateId =
  | "merge-cannon"
  | "runner-gate"
  | "tap-monster"
  | "gem-collector"
  | "simple-end-card"
  | "intro-cta";

export type SceneType = "intro" | "gameplay" | "endCard";

export type Difficulty = "easy" | "normal" | "hard";

export type BackgroundStyle = "midnightGrid" | "sunsetArena" | "forestArcade" | "cleanStudio";

export type InteractionMechanic =
  | "tap"
  | "dragHorizontal"
  | "dragDrop"
  | "merge"
  | "autoShoot"
  | "buttonAction"
  | "sceneTransition"
  | "endCardTrigger";

export type PlayableDuration = 15 | 30 | 45;

export type AssetUsage = "none" | "player" | "enemy" | "background" | "prop";

export type EditorMode = "design" | "preview";

export type EditorObjectType =
  | "text"
  | "image"
  | "video"
  | "button"
  | "shape"
  | "animatedSprite"
  | "audio"
  | "background"
  | "ctaButton";

export type ActionType = "none" | "nextScene" | "goToScene" | "startGame" | "openUrl" | "replay" | "showEndCard";

export type AnimationPreset =
  | "none"
  | "fadeIn"
  | "popIn"
  | "bounce"
  | "pulse"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "shake";

export type SceneTransition = "none" | "fade" | "slide" | "pop";

export interface EditorAction {
  type: ActionType;
  targetSceneId?: string;
  url?: string;
}

export interface TextObjectProps {
  text: string;
  fontSize: number;
  fontWeight: "400" | "600" | "700" | "800" | "900";
  color: string;
  align: "left" | "center" | "right";
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
}

export interface ImageObjectProps {
  assetId?: string;
  src: string;
  fit: "contain" | "cover" | "stretch";
  borderRadius: number;
}

export interface VideoObjectProps {
  assetId?: string;
  src: string;
  fit: "contain" | "cover" | "stretch";
  muted: boolean;
  loop: boolean;
  autoplay: boolean;
  controls: boolean;
  startTime: number;
  endTime: number;
}

export interface ButtonObjectProps {
  label: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  action: EditorAction;
}

export interface ShapeObjectProps {
  shape: "rectangle" | "circle" | "roundedRectangle";
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface AnimatedSpriteObjectProps {
  assetId?: string;
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  autoplay: boolean;
}

export interface AudioObjectProps {
  assetId?: string;
  src: string;
  volume: number;
  loop: boolean;
  playOnSceneStart: boolean;
  playOnClick: boolean;
}

export type EditorObjectProps =
  | TextObjectProps
  | ImageObjectProps
  | VideoObjectProps
  | ButtonObjectProps
  | ShapeObjectProps
  | AnimatedSpriteObjectProps
  | AudioObjectProps;

export interface EditorObject {
  id: string;
  sceneId: string;
  type: EditorObjectType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  props: EditorObjectProps;
  animations: AnimationPreset[];
  actions: EditorAction[];
}

export interface PlayableSettings {
  title: string;
  duration: PlayableDuration;
  targetScore: number;
  mainColor: string;
  accentColor: string;
  backgroundStyle: BackgroundStyle;
  difficulty: Difficulty;
  ctaText: string;
  ctaUrl: string;
  introTitle: string;
  introSubtitle: string;
  playButtonText: string;
  endCardTitle: string;
  endCardSubtitle: string;
  orientation?: "portrait" | "landscape";
  networkPreset?: "generic" | "meta" | "tiktok" | "applovin" | "mintegral" | "ironsource" | "unity";
  packageName?: string;
  compressionQuality?: number;
}

export interface PlayableScene {
  id: string;
  type: SceneType;
  title: string;
  subtitle: string;
  buttonText: string;
  duration: number;
  backgroundColor: string;
  backgroundImageAssetId?: string;
  transition: SceneTransition;
  ctaText: string;
  winMessage: string;
  loseMessage: string;
}

export interface PlayableAsset {
  id: string;
  name: string;
  type: "image" | "spriteSheet" | "audio" | "video";
  dataUrl: string;
  mimeType: string;
  usage: AssetUsage;
  size: number;
}

export interface PlayableProject {
  id: string;
  name: string;
  templateId: TemplateId;
  createdAt: string;
  updatedAt: string;
  settings: PlayableSettings;
  scenes: PlayableScene[];
  assets: PlayableAsset[];
  objects: EditorObject[];
  mechanic: InteractionMechanic | null;
  logicConfig: PlayableLogicConfig;
}
