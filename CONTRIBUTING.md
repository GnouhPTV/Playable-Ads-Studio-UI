# Contributing

Playable Ads Studio uses an approval-first Git workflow. Code changes can be prepared locally, but commits, tags, and pushes only happen after explicit approval.

## Core Rules

1. Do not automatically commit.
2. Do not automatically push.
3. Do not merge into `main` unless explicitly requested.
4. Always check `.gitignore` before committing.
5. After each requested upgrade, summarize the work and wait for approval.

## Branch Naming

Branch names should be generated from the actual upgrade request.

Examples:

```text
feat/visual-editor
fix/editor-drag-resize
docs/readme-learning-guide
feat/bright-saas-ui
release/v0.1.0-initial-mvp
```

## Commit Messages

Use concise conventional commit messages:

```text
feat: improve visual editor object editing
fix: repair editor drag and resize behavior
docs: update README learning guide
refactor: simplify editor state management
chore: update project tooling
style: polish dashboard spacing
```

Allowed prefixes:

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `chore:`
- `style:`

## Response Format After Changes

After finishing code changes, report:

```text
Upgrade completed.

Suggested branch:
...

Suggested commit:
...

Files changed:

* ...

Features added:

* ...

Bugs fixed:

* ...

How to test:

1. ...
2. ...
3. ...

Waiting for approval.
```

## Approval Commands

Only after the exact phrase:

```text
APPROVE COMMIT
```

run:

```bash
git status
git add .
git commit -m "suggested commit message"
git push -u origin current-branch
```

For a version release, only after the exact phrase:

```text
APPROVE RELEASE vX.X.X
```

run:

```bash
git status
git add .
git commit -m "suggested commit message"
git tag vX.X.X
git push -u origin current-branch
git push origin vX.X.X
```

## What Not To Commit

Do not commit:

- `node_modules/`
- `.next/`
- `*.log`
- `.env`
- `.env.local`
- `build/`
- `dist/`
- `out/`
- `.vscode/`
- `.idea/`
- temporary files

## Verification

Before asking for approval, run the relevant checks:

```bash
npm run typecheck
npm run build
```
