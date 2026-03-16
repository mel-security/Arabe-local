# CLAUDE.md — Arabe Local

## Project Overview

Offline-first Arabic learning app built with Tauri (Rust + SQLite) + React/TypeScript. Supports desktop (Linux) and Android (Capacitor). All data stays local — no cloud dependencies.

## Commands

```bash
npm run dev          # Vite dev server (web mode, uses mock data)
npm run build        # TypeScript check + Vite production build
npm run tauri:dev    # Full Tauri desktop app with SQLite backend
npm run tauri:build  # Production desktop build
npm test             # Run vitest tests
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
```

## Architecture

### Layers

```
src/pages/          → UI only (React components, routing)
src/components/     → Reusable UI components
src/lib/            → Pure business logic (no React imports)
  lib/pedagogy/     → Exercise generation, SRS, grammar rules, progress
  lib/content/      → Content provider (static + optional LLM)
  lib/llm/          → LLM abstraction (Ollama, llama.cpp, noop fallback)
  lib/database/     → Data access layer (Tauri invoke wrappers)
src/store/          → Zustand state management
src/i18n/           → Translations (fr.json, en.json) + useTranslation hook
src-tauri/          → Rust backend (SQLite, Tauri commands)
```

### Key Conventions

- **Business logic in `src/lib/`**, never in pages/components
- **LLM is always optional** — `NoopProvider` provides fallback for everything
- **Backward-compatible re-exports** in `src/services/` point to `src/lib/`
- **Mock data** lives in `__mocks__/database.ts`, loaded dynamically in web mode
- **i18n** via custom `useTranslation()` hook with dot-notation keys
- **RTL text** always wrapped in `<ArabicText>` component
- **Zustand** for global state: `AppStore`, `LLMStore`, `QuizStore`

### Database

- SQLite with WAL mode, foreign keys, CHECK constraints
- Schema: `database/schema.sql` (15+ tables)
- Seed: `database/seed.sql` (28 letters, 50+ words, lessons, surahs)
- Migrations: `database/migrations/` (versioned SQL files)
- Rust backend opens connection per request via `DbPath` state

### LLM Provider System

```
src/lib/llm/registry.ts  → Provider management + auto-detection
src/lib/llm/providers/
  ollama.ts               → Ollama HTTP API
  llamacpp.ts             → llama.cpp (stub)
  noop.ts                 → No-op fallback (always available)
```

Use `llmRegistry.getProvider()` to get active provider. `getPedagogyProvider()` returns a `PedagogyLLMProvider` interface for teaching-specific operations.

### Pedagogy Engine

- `exerciseGenerator.ts` — Deterministic exercise generation (letter ID, translation, gender, mixed)
- `srsEngine.ts` — SM-2 spaced repetition (calculateSRS, getDueCards, createCard)
- `grammarRules.ts` — Structured Arabic grammar data (pronouns, conjugation, sentence templates)
- `templates.ts` — Phrase and dialogue templates
- `progressTracker.ts` — Level calculation and recommendations

### Testing

Tests are in `*.test.ts` files alongside source. Uses Vitest.

```bash
npm test -- --run                    # Run all tests once
npm test -- --watch                  # Watch mode
npm test -- src/lib/pedagogy/        # Run specific directory
```

## Types

All shared types in `src/types/index.ts`. Key types: `Letter`, `Word`, `ReadingLesson`, `Surah`, `UserProfile`, `Level`, `Language`, `Exercise`.

## Modules

| Module | Route | Status |
|--------|-------|--------|
| Letters | `/letters` | Complete |
| Words | `/words` | Complete |
| Reading | `/reading` | Complete |
| Quran | `/quran` | Complete |
| Grammar | `/grammar` | New |
| Onboarding | `/onboarding` | New |

## Rust Commands

Commands in `src-tauri/src/commands/`. Each module has its own file. All use `State<'_, DbPath>` pattern. Register new commands in `main.rs`.
