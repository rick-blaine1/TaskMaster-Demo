# Architect Mode - TaskMaster-Demo Rules

## Architecture Planning & Design Considerations

### System Architecture Patterns
- **Frontend-only architecture**: No backend API, direct Supabase client integration
- **Optimistic UI pattern**: Local state updates with API rollback on failure
- **Connection-aware design**: Track and handle offline/online states
- **Component isolation**: Clear separation between UI, hooks, and API layers

### Scalability & Performance Design
- **Manual chunking strategy**: Vendor/Supabase/UI libraries separated for caching
- **Bundle optimization**: `lucide-react` excluded from Vite optimizeDeps
- **Performance budgets**: Lighthouse thresholds enforced in CI pipeline
- **Cache strategy**: 1-year asset caching with no-cache index.html

### Security Architecture Considerations
- **Demo mode RLS**: Current public policies not suitable for production
- **Environment separation**: Dual Supabase credentials for dev/prod isolation
- **Security headers**: Comprehensive CSP, XSS protection, frame denial
- **Region locking**: Vercel deployment locked to `iad1` region

### Database Design Patterns
- **Constraint-based validation**: DB-level string length and enum constraints
- **Timestamp automation**: `completed_at` set automatically on completion
- **Index strategy**: Optimized for filtering by completion status and category
- **Migration approach**: Includes demo data that may need cleanup for production

### Development Workflow Architecture
- **TypeScript project references**: Separate app/node configurations
- **Strict compilation**: `noUnusedLocals`/`noUnusedParameters` prevent dead code
- **Sequential validation**: typecheck → lint → build pipeline
- **Artifact preservation**: Build outputs uploaded for debugging

### Deployment Architecture
- **Static site generation**: Vite build with Vercel static hosting
- **Environment-specific builds**: Different Supabase credentials per environment
- **Performance monitoring**: Lighthouse CI integration for quality gates
- **Container compatibility**: Host configuration for development environments

### Future Architecture Considerations
- **Authentication layer**: `user_id` field prepared for future auth integration
- **Real-time features**: Supabase real-time subscriptions ready for implementation
- **Monitoring integration**: Placeholder for Vercel Analytics and Sentry
- **API evolution**: Current direct client pattern may need backend abstraction