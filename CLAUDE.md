# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands
- `npm run dev` - Run development server
- `npm run devhttps` - Run with HTTPS
- `npm run dist` - Build for production
- `npm run devdebug` - Run with debugging
- Use ESLint for linting via `npx eslint [file]`

## Code Style Guidelines
- TypeScript with strict typing
- Types: End with `T` (e.g., `ModelT`, `StateT`)
- Enums: End with `E` (e.g., `LoggerTypeE`)
- Components: Class names use `C` prefix + PascalCase (e.g., `CBtn`)
- Private variables: Prefix with `_` (e.g., `_routes`)
- Functions: Use camelCase
- Files: Group by feature in `/client/alwaysload` or `/client/lazy`
- Error handling: Use toast notifications for non-critical errors and `Unrecoverable()` for critical failures
- Component structure: Follow `ModelT`/`StateT`/`ElsT` pattern with lifecycle methods (`connectedCallback`, etc.)
- Imports: Use relative paths with `.js` extension, group types first
- Always update component HTML/CSS/TS files together