# TaskMaster-Demo AI Assistant Guide

## Project-Specific Non-Obvious Information

### Build & Development Commands
- **Custom typecheck**: `npm run typecheck` - Uses `tsconfig.app.json` specifically (not default tsconfig.json)
- **Bundle analysis**: `npm run build:analyze` - Includes vite-bundle-analyzer for performance debugging
- **Production build**: `npm run build:prod` - Sets NODE_ENV=production explicitly
- **Lighthouse CI**: `npm run lighthouse` - Runs performance audits with custom config
- **Clean command**: `npm run clean` - Removes both dist and node_modules/.vite cache

### Vite Configuration Specifics
- **lucide-react exclusion**: Explicitly excluded from optimizeDeps to prevent bundling issues
- **Manual chunking strategy**: 
  - `vendor`: React core libraries
  - `supabase`: Supabase client isolated for caching
  - `ui`: Lucide icons separated for optimal loading
- **Custom global**: `__APP_VERSION__` available in code via `import.meta.env`
- **Fixed ports**: Dev/preview both use port 3000 with host: true for container compatibility

### TypeScript Project Structure
- **Project references**: Uses TypeScript project references with separate app/node configs
- **Strict settings**: `noUnusedLocals` and `noUnusedParameters` enabled - will fail build on unused vars
- **Bundler mode**: Uses `moduleResolution: "bundler"` for Vite compatibility

### Supabase Integration Patterns
- **Environment validation**: Throws error on missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY
- **Demo mode RLS**: All tables have public access policies (not production-ready)
- **Optimistic updates**: useTasks hook implements optimistic UI with rollback on API failure
- **Connection tracking**: `isConnected` state tracks Supabase connectivity

### Custom Hook Patterns (useTasks)
- **Optimistic UI**: All mutations update local state first, rollback on API failure
- **Error boundaries**: Returns `{ success: boolean, error?: string }` pattern
- **State management**: Tracks loading, error, connection status separately
- **Automatic retry**: Connection state resets to true on successful operations

### Database Schema Gotchas
- **String constraints**: Title 1-200 chars, description max 1000 chars (enforced by DB)
- **Category enum**: Must be exactly 'Work', 'Personal', 'Shopping', 'Health' (case-sensitive)
- **Timestamp handling**: Uses timestamptz, completed_at set automatically on completion
- **Demo data**: Migration includes sample tasks that may interfere with tests

### Deployment Configuration
- **Dual environment secrets**: 
  - Dev/Preview: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Production: `VITE_SUPABASE_URL_PROD`, `VITE_SUPABASE_ANON_KEY_PROD`
- **Vercel regions**: Locked to `iad1` region
- **Security headers**: Comprehensive CSP, XSS protection, frame denial configured
- **Cache strategy**: Assets cached for 1 year, index.html no-cache

### Performance Monitoring
- **Lighthouse thresholds**: 
  - Performance/Best Practices/SEO: 90% minimum (warn)
  - Accessibility: 90% minimum (error - will fail CI)
  - FCP < 2s, LCP < 2.5s, CLS < 0.1, TBT < 300ms
- **CI integration**: Lighthouse runs only on production deployments to main branch

### Development Gotchas
- **ESLint config**: Uses flat config format (eslint.config.js), not legacy .eslintrc
- **React Refresh**: Only exports components warning enabled - affects hot reload
- **Import paths**: Must use .ts/.tsx extensions due to bundler mode
- **Environment variables**: All must be prefixed with VITE_ to be accessible in frontend

### Testing & CI Requirements
- **Required checks**: typecheck → lint → build (in sequence)
- **Build artifacts**: Uploaded to GitHub Actions for debugging
- **Node version**: Locked to Node 18 in CI
- **Cache strategy**: npm ci with Node.js cache enabled