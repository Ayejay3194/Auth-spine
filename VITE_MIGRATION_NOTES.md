# Vite Migration Notes

## Current Status

The Auth-Spine project is standardizing on **Next.js** for all frontend applications. Vite configurations exist in legacy/enterprise packages but are not used in the main application stack.

## Vite Configurations Found

The following packages still contain Vite configurations and should be migrated to Next.js or removed:

1. **`apps/demo-ui/vite.config.ts`** - Demo UI (legacy)
2. **`packages/enterprise/Handy/vite.config.ts`** - Enterprise Handy package
3. **`packages/enterprise/assistant-ui/examples/with-tanstack/vite.config.ts`** - Example project
4. **`packages/enterprise/CopilotKit/src/v2.x/apps/react/demo/mcp-apps/vite.config.ts`** - Demo app

## Migration Path

### For Main Applications
- ✅ `apps/business-spine` - Already using **Next.js 14** (no Vite)
- ✅ `packages/auth-server` - Node.js Express (no Vite needed)
- ✅ `packages/resource-api` - Node.js Express (no Vite needed)

### For Enterprise/Legacy Packages
These packages are in the `packages/enterprise/` directory and are not part of the core stack:
- Consider migrating to Next.js if they need to be maintained
- Or mark as deprecated and remove if no longer needed

## Recommended Actions

1. **Keep Next.js as primary frontend framework**
   - All new frontend features should use Next.js
   - Use `npm run dev:ui` to start the main UI

2. **Deprecate Vite-based projects**
   - Mark `apps/demo-ui` as legacy
   - Move enterprise examples to separate documentation

3. **Use unified build pipeline**
   - All builds go through `npm run build`
   - All development through `npm run dev`

## Build Configuration

The unified build system uses:
- **Frontend**: Next.js with TypeScript
- **Backend**: Node.js with Express
- **Styling**: Tailwind CSS (via PostCSS)
- **Package Manager**: npm workspaces

No Vite is needed for the core Auth-Spine platform.

## References

- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS with Next.js: https://tailwindcss.com/docs/guides/nextjs
- PostCSS Configuration: https://nextjs.org/docs/advanced-features/customizing-postcss-config
