# Architecture

This document describes how the File Tool codebase is structured and how data and control flow through the application.

---

## Directory layout

```
File-Organizer-Tool/
├── bin/
│   └── cli.ts              # CLI entry: Commander setup + registerCommands()
├── src/
│   ├── commands/          # One file per CLI command (organize, metadata, rename, ...)
│   ├── services/          # File I/O, metadata, hashing, reports
│   ├── core/               # Orchestration: plan moves, renames, duplicate groups
│   ├── utils/              # Path helpers, config loader, logger, formatters
│   ├── plugins/            # Custom rule application (from .filetoolrc.json)
│   ├── types/              # TypeScript interfaces (config, actions, reports)
│   └── index.ts            # Optional library exports
├── docs/                   # Documentation (this folder)
│   ├── README.md           # Docs index
│   ├── ARCHITECTURE.md     # This file
│   └── DEVELOPMENT.md      # Step-by-step development guide
├── package.json
├── tsconfig.json
├── README.md               # Project overview, install, features (root only)
├── CONTRIBUTING.md         # Contribution guide (root only)
└── .gitignore
```

---

## Responsibilities

| Layer         | Role |
|--------------|------|
| **bin/cli.ts**  | Parse CLI args, create Commander program, register commands, run the chosen command. |
| **commands/**   | Define subcommands (organize, metadata, rename, duplicates, watch, init), validate paths, call core/services, print output. |
| **core/**       | Business logic: plan moves (by type/date), plan renames (template), find duplicate groups. No I/O except via services. |
| **services/**   | Low-level operations: list files, move, rename, delete, read metadata, hash file, write report. |
| **utils/**      | Helpers: path join/resolve, load config, log/verbose/error, format bytes/dates. |
| **plugins/**    | Apply user rules (extension, minSizeMB, etc.) to decide target folder. |
| **types/**      | Shared interfaces so commands, core, and services agree on data shapes. |

---

## Data flow (high level)

1. **User** runs e.g. `filetool organize ./downloads --dry-run`.
2. **bin/cli.ts** parses argv; Commander routes to `organize` command.
3. **commands/organize.ts** resolves path, checks it exists and is a directory, loads config (custom rules), calls `planOrganize()`.
4. **core/organizeOrchestrator.ts** lists files (via **services/fileService**), for each file decides target folder (by type using **core/categoryMap** and **plugins** rules, or by date using **services/metadataService**), returns a list of `MoveAction`.
5. **commands/organize.ts** if `--dry-run` prints actions; else calls `executeOrganize(actions)` which uses **services/fileService** (ensureDir, moveFile).
6. Report is written via **services/reportService** (optional / verbose).

Metadata flow: **metadataService** uses `fs.stat()` and **exif-parser** to build a `FileMetadata` object. Duplicate flow: **hashService** streams file content into SHA-256; **core/duplicateFinder** groups by hash. Rename flow: **core/renameOrchestrator** uses template placeholders and **metadataService** for date/size.

---

## Cross-platform and safety

- All paths use `path.join()` / `path.resolve()` (no hardcoded slashes).
- Async I/O via `fs.promises` (non-blocking).
- Destructive actions support `--dry-run` and, where applicable, `--interactive` prompts.
- Hashing uses streams to avoid loading large files into memory.

---

## Extension points

- **Custom rules**: `.filetoolrc.json` → `rules[]` with `extension`, `folder`, `minSizeMB`, `maxSizeMB`. Applied in **core/organizeOrchestrator** and **plugins/ruleHandler**.
- **Config**: `filetool init` creates `.filetoolrc.json`; **utils/configLoader** reads it for organize/rename defaults.
- Adding a new command: add a file in **commands/**, implement `registerXxxCommand(program)`, and call it from **commands/index.ts**.
