# Playable Ads Studio

## 1. Project Overview

Playable Ads Studio is a local no-code MVP for building small UA playable ad prototypes. It includes a dashboard, template gallery, visual builder, asset manager, scene editor, shared runtime preview, validation, video-to-playable workflow, and ZIP export.

The app runs without a backend and stores projects in LocalStorage.

## 2. Why This Project Exists

This project is built for learning playable ads development: how scenes, UI objects, interactions, preview, validation, and export fit together in a practical builder workflow.

## 3. What Is UA Playable Ads

UA playable ads are interactive ad experiences that let users try a simplified version of an app or game before clicking a CTA. A typical playable has an intro, a short interaction, and an end card.

## 4. Features

- Bright modern SaaS-style dashboard.
- Searchable and filterable template gallery.
- No-code editor with objects, assets, scenes, templates, interactions, and export settings.
- Phone preview frame with grid and safe-area guides.
- Drag, resize, rotate, duplicate, delete, copy/paste, and keyboard nudging.
- Local image, video, sprite, and audio asset upload and assignment.
- Scene switching and object layer management.
- Runtime preview mode for scene actions, buttons, video, audio, animations, and the Tap Monster playable loop.
- Validation checklist.
- ZIP export with working HTML, CSS, JS runtime, assets, project.json, and export README.
- Video-to-playable MVP route with MP4/WebM preview, fit/trim controls, draggable overlays, end card, CTA, and ZIP export.
- AI builder MVP route with local mock JSON generation.

## 5. Product Pages

- `/` Dashboard
- `/templates` Template Gallery
- `/editor/[projectId]` Builder / Editor
- `/video-to-playable` Video-to-Playable MVP
- `/ai-builder` AI Playable MVP

## 6. Folder Structure

- `app/` Next.js App Router pages.
- `components/layout/` shared app shell and navigation.
- `components/dashboard/` dashboard cards and recent projects.
- `components/templates/` template gallery UI.
- `components/editor/` visual builder panels.
- `components/product/` MVP product pages for video and AI workflows.
- `store/` Zustand editor state.
- `lib/editor/` project persistence, export, validation, factory helpers.
- `lib/runtime/` shared playable runtime helpers for preview actions, scene rendering, and animations.
- `lib/game/` Phaser preview scenes.
- `types/` shared TypeScript types.

## 7. How To Install

```bash
npm install
```

## 8. How To Run

```bash
npm run dev
```

Open the local URL printed by Next.js.

## 9. How To Use Dashboard

Use the dashboard to create a new playable, open recent projects, search saved work, jump to templates, or open MVP future workflows.

## 10. How To Use Template Gallery

Search templates, filter by category or difficulty, sort by popularity or beginner friendliness, then choose `Use Template` to create a LocalStorage project.

## 11. How To Use The Builder

The editor has a top bar, left no-code sidebar, center phone canvas, right properties panel, and bottom tabs. Add objects, edit scenes, upload assets, preview behavior, validate, then export.

## 12. How Objects Work

Objects are stored in `project.objects`. Each object has position, size, rotation, opacity, z-index, lock/hidden state, type-specific props, animations, and actions.

## 13. How Scenes Work

Scenes are stored in `project.scenes`. Each object belongs to one scene via `sceneId`. Switching scenes changes what the canvas and layers panel display.

## 14. What Is A No-Code Playable Logic System

A no-code playable logic system stores game behavior as data instead of hiding it inside one hardcoded scene file. In this app the behavior lives in `project.logicConfig`.

The logic config includes score, timer, object roles, object actions, win/lose conditions, scene flow, and template settings. The editor panels modify this config, the preview runtime reads it, and the exported HTML includes it in `project.json`.

## 15. How Object Roles Work

Object roles connect visual objects to gameplay meaning. A text layer can become `scoreText`, a button can become `playButton`, and a monster shape can become `tapTarget`.

Select an object, open `Playable Role`, choose a role, then edit role settings. For example, a Tap Target can define score per tap, random movement, tap animation, respawn delay, max taps, and whether it starts visible.

## 16. How Actions Work

Actions define what happens on triggers such as `onClick`, `onTap`, `onTimerEnd`, or `onScoreReached`.

Examples:

- Play Button: `On Click -> Go To Scene`
- Tap Target: `On Tap -> Add Score`
- Tap Target: `On Tap -> Randomize Position`
- CTA Button: `On Click -> Open URL`
- Replay Button: `On Click -> Replay`

Use `ActionBuilder.tsx` to add or edit actions. Preview and export both read these actions.

## 17. How Conditions Work

Conditions describe when a playable should win, lose, or move to another scene. Examples include `timerEnded`, `scoreReached`, `objectTapped`, `enemyDestroyed`, `playerDead`, and `allTargetsCleared`.

The current MVP stores conditions and validates them. Timer and score actions are already used by preview/export; deeper condition chains can be expanded later.

## 18. How Tap Monster Template Works

Tap Monster uses intro, gameplay, and end-card scenes.

Default roles:

- Play button: `playButton`
- Monster: `tapTarget`
- Score HUD: `scoreText`
- Timer HUD: `timerText`
- CTA: `ctaButton`
- Replay: `replayButton`

Default behavior: click Play, tap the monster, add score, optionally randomize monster position, count down the timer, show end card, click CTA or Replay.

## 19. How Merge Cannon Template Works

Merge Cannon uses a `cannon` role and template settings for cannon damage, fire rate, enemy HP, enemy speed, merge level limit, coin reward, gem reward, and game duration.

The MVP preview/export supports dragging cannons, merging same-level cannons, showing an enemy HP target, auto-fire reward ticks, score changes, timer, and end card.

## 20. How Runner Gate Template Works

Runner Gate uses a `player` role and generated gates from logic settings. You can edit duration, player speed, lane count, gate values, and gem reward.

The MVP preview/export supports drag-horizontal movement, passing gates, score changes, timer, and end card.

## 21. How Gem Collector Template Works

Gem Collector uses `collectible`, `scoreText`, and `timerText` roles. You can edit gem count, gem value, target score, timer duration, and respawn behavior.

The MVP preview/export supports tapping gems, score increases, gems disappearing or respawning, timer, and end card.

## 22. How Preview Runtime Reads Logic Config

`components/runtime/PlayableRuntime.tsx` reads `project.logicConfig` and decides which objects are playable roles. It updates score and timer state, runs object actions, shows template mechanics, and renders CTA/replay behavior.

Study these files:

- `components/runtime/PlayableRuntime.tsx`
- `lib/logic/logicRuntime.ts`
- `lib/logic/defaultLogicConfigs.ts`

## 23. How Export Runtime Reads Logic Config

`lib/editor/exportProject.ts` writes the full project into the ZIP, including `logicConfig`. The exported `playable.js` reads object roles, actions, score, timer, scene flow, and template settings so the local `index.html` is playable.

The export is still a local learning package. Production networks may require MRAID, click macros, compression, and QA wrappers.

## 24. Build A Tap Monster Playable Step By Step

1. Open `/templates`.
2. Use `Tap Monster Playable`.
3. Select the monster object.
4. Set Playable Role to `Tap Target`.
5. Change score per tap.
6. Enable or disable random movement.
7. Select Score Text and Timer Text roles if needed.
8. Open the Gameplay tab.
9. Change duration and target score.
10. Preview the game.
11. Export ZIP.
12. Open exported `index.html` locally.

## 25. How Validation Works

`lib/editor/validators.ts` checks intro/gameplay/end-card scenes, CTA presence, duration, interaction mechanic, missing assets, broken scene actions, and estimated package size.

Logic validation also checks required roles for each template, such as Tap Target, Score Text, Timer Text, Player, Cannon, Collectible, and end card readiness.

## 26. How Export Works

`lib/editor/exportProject.ts` generates a ZIP containing `index.html`, `style.css`, `playable.js`, `assets/`, `project.json`, and `README_EXPORT.txt`.

## 27. Video-To-Playable MVP

Route: `/video-to-playable`

This page is a functional local MVP for uploading MP4/WebM, previewing the video inside a 360x640 frame, selecting cover/contain/fill fit modes, setting trim start/end times, adding text/CTA/image/end-card overlays, dragging and resizing overlays, and exporting a local ZIP.

MVP limitation: the browser cannot restore a local `File` after refresh, so saved drafts remember overlay settings but require re-uploading the video before preview/export can include the actual asset.

## 28. Runtime Preview & Export

The editor preview uses `components/runtime/PlayableRuntime.tsx`, which renders the current `PlayableProject` without editor handles. It supports scene transitions, timers, click/tap actions, video/audio objects, animations, replay, CTA URL placeholders, and the Tap Monster score loop.

The ZIP export in `lib/editor/exportProject.ts` writes a standalone `index.html`, `style.css`, `playable.js`, `manifest.json`, `project.json`, `README_EXPORT.txt`, and uploaded assets. Exports are local learning packages and may still need ad-network wrappers such as MRAID before production use.

## 29. AI Builder MVP

Route: `/ai-builder`

This page generates mock structured JSON locally from a playable brief. It does not call any backend or AI API yet.

## 30. Important Main Files

- `app/page.tsx`: renders the dashboard through `AppShell`.
- `app/templates/page.tsx`: renders the template gallery.
- `app/editor/[projectId]/page.tsx`: loads the editor route for a project id.
- `app/video-to-playable/page.tsx`: video workflow MVP page.
- `app/ai-builder/page.tsx`: AI builder MVP page.
- `components/editor/DesignCanvas.tsx`: phone canvas, object rendering, dragging, resizing, rotating, preview actions, keyboard shortcuts.
- `components/runtime/PlayableRuntime.tsx`: shared React runtime used by editor preview.
- `components/runtime/RuntimeObject.tsx`: object renderer for text, image, video, button, shape, sprite placeholder, audio, and CTA.
- `components/editor/LogicPanel.tsx`: gameplay-level settings and conditions.
- `components/editor/ObjectRolePanel.tsx`: object role editor and role settings.
- `components/editor/ActionBuilder.tsx`: no-code action editor.
- `components/editor/ConditionBuilder.tsx`: win/lose condition editor.
- `components/editor/TemplateGuidePanel.tsx`: built-in template guide.
- `components/editor/PropertiesInspector.tsx`: scene/object property editing.
- `components/editor/SceneManager.tsx`: scene switching, renaming, duplicate, delete, add scene.
- `components/editor/AssetManager.tsx`: upload, preview, drag/drop, assign, delete assets.
- `components/product/VideoToPlayablePage.tsx`: video-to-playable workflow, overlay editor, and video ZIP export.
- `components/editor/LayersPanel.tsx`: select, rename, hide/show, lock/unlock, order, delete layers.
- `store/editorStore.ts`: Zustand state and mutation logic.
- `lib/editor/exportProject.ts`: local ZIP generation.
- `lib/editor/validators.ts`: validation checklist logic.
- `lib/logic/defaultLogicConfigs.ts`: default role/action/settings configs for templates.
- `lib/logic/logicRuntime.ts`: helpers for reading object roles, actions, and settings.
- `lib/logic/logicValidation.ts`: validation rules for playable logic.
- `lib/runtime/runtimeActions.ts`: beginner-friendly action runner for runtime scene navigation and CTA behavior.
- `lib/runtime/renderScene.ts`: helpers for scene and object lookup.

## 31. Code Learning Guide

Start with `types/project.ts`, then read `store/editorStore.ts`. After that, study `components/runtime/PlayableRuntime.tsx`, `RuntimeObject.tsx`, `DesignCanvas.tsx`, and `PropertiesInspector.tsx`. Finish with `validators.ts`, `exportProject.ts`, and `VideoToPlayablePage.tsx` to understand preview, validation, and export.

## 32. Beginner Exercises

- Add a new object template in `ObjectLibrary.tsx`.
- Add a new validation rule in `validators.ts`.
- Add a new template definition in `templateDefinitions.ts`.
- Add a new animation preset and render it in CSS.
- Add a new export checklist item.
- Add a new runtime action in `runtimeActions.ts`.
- Add another real playable template loop beside Tap Monster.
- Change Tap Monster score per tap from 1 to 5.
- Change timer from 30s to 15s.
- Change monster animation.
- Add a second tap target.
- Change CTA button text.
- Add a new gate value to Runner Gate.
- Change cannon damage in Merge Cannon.
- Add a new collectible type in Gem Collector.

## 33. Future Improvements

- More precise video crop handles and timeline keyframes.
- AI API integration for generated scenes.
- More ad-network export presets.
- MRAID wrapper generation.
- Multi-size responsive previews.
- Better Phaser playable preview syncing.
- Cloud save and team collaboration.

## 34. Disclaimer

This is a local educational MVP. It is not an official ad-network tool and does not guarantee production compliance. Always validate exports against the target network requirements before real campaign use.
