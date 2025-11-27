# Ask Mode - TaskMaster-Demo Rules

## Documentation & Analysis Focus Areas

### Architecture Understanding
- **React + Vite + TypeScript**: Modern frontend stack with strict TypeScript settings
- **Supabase integration**: Real-time database with optimistic UI patterns
- **Project references**: TypeScript project uses separate app/node configurations
- **Manual chunking**: Vendor, Supabase, and UI libraries separated for optimal loading

### Key Implementation Patterns to Explain
- **Optimistic UI**: `useTasks` hook updates local state first, rollbacks on API failure
- **Error handling**: Consistent `{ success: boolean, error?: string }` pattern
- **Connection tracking**: `isConnected` state monitors Supabase connectivity
- **Type safety**: Strict TypeScript with `noUnusedLocals`/`noUnusedParameters`

### Non-Standard Configuration Details
- **Custom typecheck**: Uses `tsconfig.app.json` instead of default config
- **Bundler mode**: `moduleResolution: "bundler"` requires `.ts`/`.tsx` extensions
- **ESLint flat config**: Uses `eslint.config.js` format, not legacy `.eslintrc`
- **Vite exclusions**: `lucide-react` excluded from optimizeDeps

### Database Schema Specifics
- **Demo mode RLS**: Public access policies (not production-ready)
- **String constraints**: Title 1-200 chars, description max 1000 chars
- **Category enum**: Exact case required: 'Work', 'Personal', 'Shopping', 'Health'
- **Timestamp handling**: Uses `timestamptz` with automatic `completed_at` setting

### Deployment & Performance Context
- **Dual environments**: Separate Supabase credentials for dev/prod
- **Lighthouse CI**: Accessibility errors fail CI, performance warnings only
- **Vercel configuration**: Comprehensive security headers and cache strategy
- **Performance thresholds**: FCP < 2s, LCP < 2.5s, CLS < 0.1, TBT < 300ms

### Development Workflow Insights
- **Required sequence**: `typecheck` → `lint` → `build` (all must pass)
- **Bundle analysis**: `npm run build:analyze` for performance debugging
- **Clean command**: Removes both dist and Vite cache
- **Container compatibility**: Fixed ports with host: true for dev/preview