# Debug Mode - TaskMaster-Demo Rules

## Debug-Specific Investigation Patterns

### Error Investigation Priorities
- **Supabase connection**: Check `isConnected` state in `useTasks` hook first
- **Environment variables**: Verify VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are set
- **TypeScript errors**: Run `npm run typecheck` to catch unused vars/params
- **Build failures**: Check for missing `.ts`/`.tsx` extensions in imports

### Common Debug Scenarios
- **Optimistic UI rollback**: Check browser console for API errors when tasks revert
- **Hot reload issues**: Verify components are default exports from `.tsx` files
- **Bundle size warnings**: Use `npm run build:analyze` to identify large chunks
- **Lighthouse failures**: Check accessibility score (will fail CI if < 90%)

### Database Debug Patterns
- **RLS policies**: All tables have public access (demo mode) - not auth issues
- **String constraints**: Title 1-200 chars, description max 1000 chars
- **Category validation**: Must be exact case: 'Work', 'Personal', 'Shopping', 'Health'
- **Demo data interference**: Sample tasks from migration may affect tests

### Performance Debug Tools
- **Lighthouse CI**: Runs automatically on production deployments to main
- **Bundle analyzer**: `npm run build:analyze` shows chunk sizes and dependencies
- **Vite dev tools**: Check network tab for optimizeDeps exclusions (lucide-react)
- **Connection tracking**: Monitor `isConnected` state for Supabase connectivity

### Environment Debug Checklist
- **Development**: Uses VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY
- **Production**: Uses VITE_SUPABASE_URL_PROD/VITE_SUPABASE_ANON_KEY_PROD
- **Vercel regions**: Locked to `iad1` - check for region-specific issues
- **Cache headers**: Assets cached 1 year, index.html no-cache