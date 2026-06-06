# Playable Ads Studio

## 1. Project Overview

Playable Ads Studio is a local no-code MVP for building small UA playable ad prototypes. It includes a dashboard, template gallery, visual builder, asset manager, scene editor, validation, preview mode, and ZIP export.

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
- Local asset upload and assignment.
- Scene switching and object layer management.
- Preview mode for simple button/scene actions.
- Validation checklist.
- ZIP export with HTML, CSS, JS, assets, project.json, and export README.
- Video-to-playable MVP route.
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

## 14. How Validation Works

`lib/editor/validators.ts` checks intro/gameplay/end-card scenes, CTA presence, duration, interaction mechanic, missing assets, broken scene actions, and estimated package size.

## 15. How Export Works

`lib/editor/exportProject.ts` generates a ZIP containing `index.html`, `style.css`, `playable.js`, `assets/`, `project.json`, and `README_EXPORT.txt`.

## 16. Video-To-Playable MVP

Route: `/video-to-playable`

This page is a structured placeholder for uploading a video, planning trim/crop, adding CTA/text overlays, previewing, and later exporting.

## 17. AI Builder MVP

Route: `/ai-builder`

This page generates mock structured JSON locally from a playable brief. It does not call any backend or AI API yet.

## 18. Important Main Files

- `app/page.tsx`: renders the dashboard through `AppShell`.
- `app/templates/page.tsx`: renders the template gallery.
- `app/editor/[projectId]/page.tsx`: loads the editor route for a project id.
- `app/video-to-playable/page.tsx`: video workflow MVP page.
- `app/ai-builder/page.tsx`: AI builder MVP page.
- `components/editor/DesignCanvas.tsx`: phone canvas, object rendering, dragging, resizing, rotating, preview actions, keyboard shortcuts.
- `components/editor/PropertiesInspector.tsx`: scene/object property editing.
- `components/editor/SceneManager.tsx`: scene switching, renaming, duplicate, delete, add scene.
- `components/editor/AssetManager.tsx`: upload, preview, drag/drop, assign, delete assets.
- `components/editor/LayersPanel.tsx`: select, rename, hide/show, lock/unlock, order, delete layers.
- `store/editorStore.ts`: Zustand state and mutation logic.
- `lib/editor/exportProject.ts`: local ZIP generation.
- `lib/editor/validators.ts`: validation checklist logic.

## 19. Code Learning Guide

Start with `types/project.ts`, then read `store/editorStore.ts`. After that, study `DesignCanvas.tsx` and `PropertiesInspector.tsx`. Finish with `validators.ts` and `exportProject.ts` to understand the production workflow.

## 20. Beginner Exercises

- Add a new object template in `ObjectLibrary.tsx`.
- Add a new validation rule in `validators.ts`.
- Add a new template definition in `templateDefinitions.ts`.
- Add a new animation preset and render it in CSS.
- Add a new export checklist item.

## 21. Future Improvements

- Real video trim/crop implementation.
- AI API integration for generated scenes.
- More ad-network export presets.
- MRAID wrapper generation.
- Timeline keyframes.
- Multi-size responsive previews.
- Better Phaser playable preview syncing.
- Cloud save and team collaboration.

## 22. Disclaimer

This is a local educational MVP. It is not an official ad-network tool and does not guarantee production compliance. Always validate exports against the target network requirements before real campaign use.
