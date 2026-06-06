# Changelog

All notable changes to Playable Ads Studio will be documented in this file.

This project uses a solo-dev `main` branch workflow. Release tags mark stable checkpoints.

## [0.3.0] - Playable Preview & Export Runtime

### Fixed

- Fixed Merge Cannon drag-and-merge reliability in the Phaser preview.
- Added correct Phaser preview scene mapping for all templates.
- Added playable preview support for Gem Collector, Simple End Card, and Intro CTA templates.
- Improved exported HTML interactions for tap gems, runner gates, drag/merge cannon, and CTA flow.

### Changed

- `CONTRIBUTING.md` is now local-only and ignored by Git.

## [0.2.0] - Bright SaaS UI

### Added

- Bright modern SaaS interface with light theme, white cards, soft gray app background, and blue primary buttons.
- Polished dashboard, template gallery, editor top bar, sidebar, phone preview frame, properties panel, layers panel, asset cards, export modal, and validation modal.
- Mobile-friendly top navigation and improved spacing/typography across the app.

### Changed

- Reworked editor controls to use clearer light-theme states.
- Improved template cards and project cards for better portfolio presentation.
- Removed dark-panel overrides that made primary button text harder to read.

## [0.1.0] - Initial MVP

### Added

- Dashboard route for opening the local builder.
- Template gallery route for creating starter projects.
- Editor route for opening saved LocalStorage projects.
- Basic phone preview/editor area.
- LocalStorage project persistence foundation.
- README with install and run instructions.
- `.gitignore` for dependency, build, log, env, editor, and OS files.
- Changelog file for version tracking.
- Contributing guide for the release workflow.

### Notes

- This version is the baseline Git workflow checkpoint.
