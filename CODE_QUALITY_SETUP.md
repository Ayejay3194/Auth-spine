# Code Quality Setup Guide

This document outlines the code quality tools and standards implemented across the Auth-Spine project.

## Overview

The Auth-Spine project uses a unified code quality stack across all packages and applications:
- **React 18** with Next.js 14+ for frontend
- **Node.js 18+** for backend services
- **TypeScript 5.5+** for type safety
- **Tailwind CSS 3.4+** for styling (no Vite)
- **ESLint 9** for linting
- **Prettier 3** for code formatting
- **Jest 29** for testing
- **Husky + lint-staged** for pre-commit hooks

## Installation

```bash
npm install
```

This installs all root-level dev dependencies and sets up git hooks via Husky.

## Available Scripts

### Development
```bash
npm run dev          # Start all services (auth, api, ui)
npm run dev:auth    # Start auth server only
npm run dev:api     # Start resource API only
npm run dev:ui      # Start business-spine UI only
```

### Building
```bash
npm run build        # Build all workspaces
npm run build:auth   # Build auth server
npm run build:api    # Build resource API
npm run build:ui     # Build business-spine UI
```

### Code Quality
```bash
npm run lint         # Fix linting issues
npm run lint:check   # Check for linting issues (no fix)
npm run format       # Format code with Prettier
npm run format:check # Check formatting (no fix)
npm run typecheck    # Type check root level
npm run typecheck:ws # Type check all workspaces
```

### Testing
```bash
npm run test              # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Security
```bash
npm run security:validate # Validate security audit
npm run security:gate     # Run security gate checks
```

## ESLint Configuration

The `.eslintrc.json` file at the root extends:
- `eslint:recommended` - ESLint recommended rules
- `next/core-web-vitals` - Next.js specific rules
- `@typescript-eslint/recommended` - TypeScript rules
- `plugin:react/recommended` - React rules
- `plugin:react-hooks/recommended` - React Hooks rules
- `prettier` - Disables conflicting formatting rules

### Key Rules
- React components don't require `import React`
- Unused variables starting with `_` are ignored
- `console.warn` and `console.error` are allowed (others trigger warnings)
- `any` types trigger warnings (not errors)

## Prettier Configuration

The `.prettierrc.json` file enforces:
- 2-space indentation
- Single quotes for strings
- Trailing commas (ES5 compatible)
- 100 character line width
- LF line endings
- Semicolons required

## Pre-commit Hooks

Husky automatically runs `lint-staged` before commits, which:
1. Runs ESLint with `--fix` on changed `.ts`, `.tsx`, `.js`, `.jsx` files
2. Runs Prettier on all changed files
3. Prevents commits if linting/formatting fails

To bypass hooks (not recommended):
```bash
git commit --no-verify
```

## TypeScript Configuration

The root `tsconfig.json` provides:
- ES2020 target with DOM support
- Strict mode enabled
- Path aliases for imports:
  - `@/*` → `./src/*`
  - `@spine/*` → `./packages/*/src`
  - `@apps/*` → `./apps/*/src`
- JSX support with React 17+ syntax

## Jest Configuration

The `jest.config.js` provides:
- TypeScript support via `ts-jest`
- Node.js test environment
- Coverage thresholds: 50% for all metrics
- Module name mapping for path aliases
- Automatic setup file loading

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Tailwind CSS

The `tailwind.config.js` configures:
- Content scanning for all apps and packages
- Extended color palette with primary colors
- Custom spacing and border radius
- PostCSS integration via `postcss.config.js`

### Usage in Components

```tsx
import styles from './Component.module.css';

export function Component() {
  return <div className="bg-primary-500 text-white p-4">Hello</div>;
}
```

## CI/CD Pipeline

The `.github/workflows/ci.yml` runs:

1. **Security** - Dependency audit and security gate
2. **Quality** - Linting, formatting, and type checking
3. **Tests** - Unit and integration tests with coverage
4. **E2E** - End-to-end tests with Playwright
5. **Build** - Production build and bundle analysis
6. **Performance** - Lighthouse CI checks
7. **Deploy** - Staging and production deployments
8. **Notify** - Slack notifications on completion

## Workspace Structure

```
auth-spine/
├── packages/
│   ├── auth/              # Auth library
│   ├── auth-server/       # Auth server (Node.js)
│   ├── resource-api/      # Resource API (Node.js)
│   ├── shared-auth/       # Shared auth utilities
│   └── enterprise/        # Enterprise features
├── apps/
│   └── business-spine/    # Main Next.js app
├── business-spine/        # Legacy business-spine (being consolidated)
├── .eslintrc.json         # Root ESLint config
├── .prettierrc.json       # Root Prettier config
├── tsconfig.json          # Root TypeScript config
├── jest.config.js         # Root Jest config
├── tailwind.config.js     # Tailwind CSS config
└── package.json           # Root package.json with unified scripts
```

## Troubleshooting

### ESLint not finding files
Ensure `.eslintignore` or `ignorePatterns` in `.eslintrc.json` is configured correctly.

### Type errors in IDE
Run `npm run typecheck` to see all type errors. IDE may need to be restarted.

### Pre-commit hooks not running
Ensure Husky is installed: `npm run prepare`

### Tests failing
Check that all dependencies are installed: `npm ci`

## Best Practices

1. **Always run `npm run format` before committing** - Pre-commit hooks will catch issues
2. **Use TypeScript strict mode** - Catch errors at compile time
3. **Write tests for new features** - Maintain 50%+ coverage
4. **Follow the path alias conventions** - Makes imports cleaner
5. **Keep components in their workspace** - Avoid cross-workspace imports
6. **Use Tailwind CSS classes** - Avoid inline styles

## Further Reading

- [ESLint Documentation](https://eslint.org/docs/)
- [Prettier Documentation](https://prettier.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
