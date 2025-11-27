# Code Mode - TaskMaster-Demo Rules

## Code-Specific Development Patterns

### File Modification Patterns
- **Component structure**: All React components in `src/components/` use TypeScript with `.tsx` extension
- **Hook patterns**: Custom hooks in `src/hooks/` follow `use*` naming convention
- **Type definitions**: All types centralized in `src/types/` directory
- **API layer**: Supabase operations isolated in `src/utils/api.ts` with error handling

### Code Quality Requirements
- **TypeScript strict mode**: `noUnusedLocals` and `noUnusedParameters` will fail builds
- **ESLint flat config**: Uses `eslint.config.js` format, not legacy `.eslintrc`
- **React Refresh**: Only export components from `.tsx` files to maintain hot reload
- **Import extensions**: Must include `.ts`/`.tsx` extensions due to bundler mode

### Testing & Build Validation
- **Pre-commit sequence**: `typecheck` → `lint` → `build` (all must pass)
- **Custom typecheck**: Always use `npm run typecheck` (targets `tsconfig.app.json`)
- **Bundle analysis**: Use `npm run build:analyze` for performance debugging

### Supabase Integration Code Patterns
- **Environment validation**: Code must handle missing Supabase env vars gracefully
- **Optimistic UI**: Follow `useTasks` pattern - update local state first, rollback on failure
- **Error handling**: Return `{ success: boolean, error?: string }` pattern for mutations
- **Connection state**: Track `isConnected` for offline/online status

### Component Development Guidelines
- **State management**: Use optimistic updates with rollback for better UX
- **Error boundaries**: Implement error states in components that interact with API
- **Loading states**: Always provide loading indicators for async operations
- **Type safety**: Use strict TypeScript types from `src/types/task.ts`