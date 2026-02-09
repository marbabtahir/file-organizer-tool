# Development Guide

This document explains **every step, flow, and important line of code** so developers can understand and modify the project with confidence.

---

## 1. Project setup

### package.json

- **name**: `filetool` – used when publishing to npm.
- **bin**: `"filetool": "./dist/bin/cli.js"` – when someone runs `npm install -g filetool`, the shell will run this script for the `filetool` command.
- **scripts**:
  - `build`: compile TypeScript to `dist/`.
  - `start`: run the compiled CLI (`node dist/bin/cli.js`).
  - `dev`: run CLI without compiling (`ts-node bin/cli.ts`).
- **dependencies**: `commander` (CLI parsing), `exif-parser` (image EXIF).
- **devDependencies**: TypeScript, types for Node, ts-node for development.

### tsconfig.json

- **outDir**: `./dist` – all compiled `.js` (and `.d.ts`) go here.
- **rootDir**: `.` – so `bin/cli.ts` and `src/**/*.ts` keep the same structure under `dist/`.
- **include**: `bin/**/*`, `src/**/*` – only these are compiled.

After `npm run build`, you get e.g. `dist/bin/cli.js` and `dist/src/commands/organize.js`, etc.

---

## 2. Entry point: bin/cli.ts

- Imports `Command` from `commander` and `registerCommands` from `src/commands/index`.
- Creates a `Command` instance, sets `name`, `description`, `version`.
- Calls `registerCommands(program)` so every subcommand is registered.
- `program.parse()` parses `process.argv` and runs the matching command’s `action()`.

So when you run `filetool organize ./x --dry-run`, Commander sees `organize`, passes `./x` as `<path>` and `{ dryRun: true }` as options to the organize command’s `action(pathArg, opts)`.

---

## 3. Commands (src/commands/)

Each command file exports a function `registerXxxCommand(program: Command)` that does:

- `program.command('organize <path>')` (or similar) to define the subcommand and its arguments.
- `.option(...)` for flags like `--dry-run`, `--recursive`.
- `.action(async (pathArg, opts) => { ... })` with the real logic.

### organize.ts

1. Resolves `<path>` with `resolvePath(pathArg)` (absolute path).
2. Checks path exists and is a directory (`pathExists`, `isDirectory`).
3. Loads config: `loadConfig()` reads `.filetoolrc.json` from current working directory; returns `{ rules, ... }` or `null`.
4. Plans moves: `planOrganize(targetPath, { by: 'type'|'date', recursive, customRules })` returns `MoveAction[]`.
5. If `--dry-run`: only logs each “from -> to”.
6. If `--interactive`: for each action, prompts “Move X to Y? [y/N]”; if yes, calls `ensureDir` + `moveFile`.
7. Otherwise: `executeOrganize(actions)` to perform all moves.
8. Builds an `OperationReport` and writes it with `writeReport(report)`.

### metadata.ts

1. Resolves path, checks it exists and is a file.
2. `getMetadata(filePath)` returns `FileMetadata` (size, dates, type, dimensions, EXIF if image).
3. Prints fields to stdout.

### rename.ts

1. Resolves path (directory), loads config.
2. Template: `opts.format ?? config?.renameTemplate ?? '{date}_{index}'`.
3. `planRename(targetPath, { format: template, recursive })` returns `RenameAction[]`.
4. Dry-run: log renames only; else for each action `ensureDir` + `renameFile`.
5. Writes report.

### duplicates.ts

1. Resolves path (directory).
2. `findDuplicates(targetPath, recursive)` returns `DuplicateGroup[]` (each group has same SHA-256 hash).
3. Prints each group and total “space that could be saved”.
4. Writes report.
5. If `--delete`: asks confirmation, then for each group keeps first file and deletes the rest with `deleteFile()`.

### watch.ts

1. Resolves path (directory), loads config.
2. Uses Node `fs.watch(targetPath, { recursive: true }, callback)`.
3. On event: stat the path; if it’s a file, call `organizeOneFile()` which computes target folder (by type or date, with custom rules) and moves the file. Logs each move.

### init.ts

1. `getConfigPath()` returns path to `.filetoolrc.json` in current working directory.
2. If file already exists, logs and returns.
3. Otherwise writes default JSON (rules, renameTemplate, etc.) to that path.

---

## 4. Core (src/core/)

### categoryMap.ts

- `DEFAULT_EXTENSION_TO_FOLDER`: object mapping extension (e.g. `'.pdf'`) to folder name (e.g. `'documents'`).
- `getFolderForExtension(ext)` returns that folder or `'others'`.

### organizeOrchestrator.ts

- **matchCustomRules(filePath, ext, sizeBytes, rules)**: loops over `rules`; first rule that matches extension and optional min/max size returns `rule.folder`; else `null`.
- **getFileDate(filePath)**: uses `getMetadata()` and returns `{ year, month }` from creation date.
- **getTargetFolderByDate(rootPath, filePath)**: returns e.g. `rootPath/2026/February`.
- **getTargetFolderByType(rootPath, ext, sizeBytes, customRules)**: uses custom rules first, then `getFolderForExtension(ext)`; returns `rootPath/<folder>`.
- **planOrganize(rootPath, options)**: lists files, for each computes target path (by date or by type); if different from current path, pushes a `MoveAction`. Returns array of moves.
- **executeOrganize(actions)**: for each action, `ensureDir(dirname(to))` then `moveFile(from, to)`.

### renameOrchestrator.ts

- **applyTemplate(template, values)**: replaces `{date}`, `{original}`, `{index}`, `{ext}`, `{size}` in the template string.
- **planRename(rootPath, options)**: lists files, for each gets metadata, builds values, applies template to get new name; if different from current path, pushes `RenameAction`. Returns array of renames.

### duplicateFinder.ts

- **findDuplicates(rootPath, recursive)**: lists files, for each gets SHA-256 hash and size; groups paths by hash; returns `DuplicateGroup[]` only for hashes with more than one file.

---

## 5. Services (src/services/)

### fileService.ts

- **listFiles(dirPath, recursive)**: recursive walk with `fs.readdir(..., { withFileTypes: true })`; collects full path of every file. Catches errors (e.g. permission) and skips that directory.
- **ensureDir(dirPath)**: `fs.mkdir(dirPath, { recursive: true })`.
- **moveFile(from, to)**: ensure destination dir, then `fs.rename(from, to)`.
- **renameFile(oldPath, newPath)**: same as move. **deleteFile(filePath)**: `fs.unlink(filePath)`.

### metadataService.ts

- **getMetadata(filePath)**: `fs.stat()`, extension → type label; for images, read buffer and `exifParser.create(buffer).parse()` for EXIF/dimensions. Returns `FileMetadata`.

### hashService.ts

- **getFileHash(filePath)**: SHA-256 via `crypto.createHash('sha256')`, stream file with `fs.createReadStream`, update hash on each chunk, return `hash.digest('hex')`. Memory-efficient for large files.

### reportService.ts

- **writeReport(report, outputPath?)**: `JSON.stringify(report, null, 2)` and `fs.writeFile`. Default path is `report.json` in cwd.

---

## 6. Utils (src/utils/)

- **pathUtils**: `joinPath`, `resolvePath`, `getExtension`, `pathExists`, `isDirectory`, `isFile`, etc. (cross-platform).
- **configLoader**: `loadConfig()` reads `.filetoolrc.json` from cwd; `getConfigPath()` for init.
- **logger**: `log`, `verbose`, `error`.
- **formatUtils**: `formatBytes`, `formatDateISO`, `MONTH_NAMES`.

---

## 7. Plugins (src/plugins/ruleHandler.ts)

- **applyRules(context, rules)**: first matching rule (extension + optional min/max size) returns `rule.folder`; else `null`. Custom rules override default category map.

---

## 8. Types (src/types/index.ts)

- **CustomRule**, **FileToolConfig**, **OrganizeBy**, **MoveAction**, **FileMetadata**, **RenameAction**, **DuplicateGroup**, **OperationReport**, **GlobalOptions**. Used across commands, core, and services for consistency.

---

## 9. End-to-end flows (summary)

- **Organize by type**: CLI → organize command → loadConfig → planOrganize → dry-run log or executeOrganize → writeReport.
- **Organize by date**: Same; target folder = rootPath/year/month from file creation date.
- **Metadata**: CLI → metadata command → getMetadata → print.
- **Rename**: CLI → rename command → planRename → dry-run log or renameFile for each → writeReport.
- **Duplicates**: CLI → duplicates command → findDuplicates → print groups → optional delete with confirmation → writeReport.
- **Watch**: CLI → watch command → fs.watch → on new file → organizeOneFile → moveFile.
- **Init**: CLI → init command → getConfigPath → write default .filetoolrc.json if not exists.

For full layout and data flow, see [ARCHITECTURE.md](ARCHITECTURE.md). For contributing, see [CONTRIBUTING.md](../CONTRIBUTING.md) in the project root.
