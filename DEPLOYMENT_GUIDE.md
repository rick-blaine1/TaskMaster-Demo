# TaskMaster-Demo Vercel Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the TaskMaster-Demo application to Vercel with optimal configuration for performance, security, and cost efficiency.

## Prerequisites

- Node.js 18+ installed
- Vercel account
- Supabase project setup
- GitHub repository

## Quick Start

### 1. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your environment variables:
   ```bash
   # .env.local
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ENVIRONMENT=development
   ```

### 2. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Vercel Deployment

#### Option A: Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

#### Option B: GitHub Integration

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Push to main branch for automatic deployment

## Configuration Details

### Vercel Configuration (`vercel.json`)

The application includes optimized Vercel configuration with:

- **Static Build**: Uses `@vercel/static-build` for optimal performance
- **Caching Strategy**: 
  - Static assets: 1 year cache with immutable flag
  - HTML: No cache for dynamic updates
- **Security Headers**: CSP, XSS protection, frame options
- **SPA Routing**: All routes redirect to index.html
- **Regional Deployment**: Optimized for US East (iad1)

### Build Optimization (`vite.config.ts`)

Enhanced Vite configuration includes:

- **Code Splitting**: Separate chunks for vendor, Supabase, and UI libraries
- **Bundle Analysis**: Size warnings at 1MB threshold
- **Source Maps**: Enabled for production debugging
- **ESNext Target**: Modern JavaScript for better performance

### Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` |
| `VITE_ENVIRONMENT` | Environment identifier | `production` |

#### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_VERCEL_ANALYTICS_ID` | Vercel Analytics ID | `prj_abc123` |
| `VITE_SENTRY_DSN` | Sentry error tracking | `https://abc123@sentry.io/123` |

### Vercel Dashboard Configuration

1. **Project Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

2. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_ENVIRONMENT=production
   ```

3. **Domains**:
   - Production: `taskmaster-demo.vercel.app`
   - Custom domain: `your-domain.com` (optional)

## Performance Optimization

### Current Bundle Analysis

- **Main Bundle**: ~297KB (87KB gzipped)
- **CSS Bundle**: ~16KB (4KB gzipped)
- **Total Initial Load**: ~313KB (91KB gzipped)

### Optimization Strategies

1. **Code Splitting**:
   - Vendor libraries separated
   - Supabase client isolated
   - UI components chunked

2. **Caching Strategy**:
   - Static assets: 1 year cache
   - API responses: 5 minutes stale time
   - Build artifacts: Immutable caching

3. **Performance Targets**:
   - Lighthouse Performance: >90
   - First Contentful Paint: <1.5s
   - Largest Contentful Paint: <2.5s
   - Cumulative Layout Shift: <0.1

### Bundle Size Monitoring

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Performance audit
npm run lighthouse
```

## Security Configuration

### Security Headers

Implemented via `vercel.json`:

- **Content Security Policy**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer Policy**: Controls referrer information
- **Permissions Policy**: Restricts browser features

### Environment Security

- Environment variables stored in Vercel secrets
- No sensitive data in client-side code
- Supabase RLS policies for data protection

## CI/CD Pipeline

### GitHub Actions Workflow

The deployment pipeline includes:

1. **Testing Phase**:
   - TypeScript type checking
   - ESLint code quality
   - Build verification

2. **Preview Deployments**:
   - Automatic preview for pull requests
   - Environment isolation
   - Testing environment

3. **Production Deployment**:
   - Main branch auto-deployment
   - Production environment variables
   - Performance monitoring

4. **Quality Assurance**:
   - Lighthouse performance audits
   - Accessibility testing
   - SEO validation

### Required GitHub Secrets

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_SUPABASE_URL_PROD=your-prod-supabase-url
VITE_SUPABASE_ANON_KEY_PROD=your-prod-supabase-key
```

## Monitoring and Analytics

### Vercel Analytics

Enable in Vercel dashboard:
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Page view analytics
- Performance insights

### Error Tracking (Optional)

Sentry integration for production error monitoring:

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT,
  });
}
```

### Performance Monitoring

- Lighthouse CI in GitHub Actions
- Core Web Vitals tracking
- Bundle size monitoring
- API response time tracking

## Cost Optimization

### Vercel Pricing Considerations

**Hobby Plan (Free)**:
- 100GB bandwidth/month
- 100 deployments/day
- Suitable for single-user demo

**Pro Plan ($20/month)**:
- 1TB bandwidth/month
- Unlimited deployments
- Advanced analytics
- Custom domains

### Optimization Strategies

1. **Bundle Size Reduction**:
   - Tree shaking enabled
   - Code splitting implemented
   - Lazy loading for components

2. **Caching Optimization**:
   - Long-term caching for assets
   - CDN edge caching
   - Browser caching strategies

3. **Resource Optimization**:
   - Image optimization (future)
   - Font optimization
   - CSS purging

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Environment Variable Issues**:
   - Verify variables in Vercel dashboard
   - Check variable naming (VITE_ prefix required)
   - Ensure no trailing spaces

3. **Supabase Connection Issues**:
   - Verify URL and key format
   - Check Supabase project status
   - Validate RLS policies

4. **Performance Issues**:
   - Run Lighthouse audit
   - Check bundle size
   - Verify caching headers

### Debug Commands

```bash
# Local development debug
npm run dev -- --debug

# Build analysis
npm run build -- --mode development

# Preview with debugging
npm run preview -- --debug
```

## Rollback Procedures

### Vercel Rollback

1. **Via Dashboard**:
   - Go to Vercel project dashboard
   - Select "Deployments" tab
   - Click "Promote to Production" on previous deployment

2. **Via CLI**:
   ```bash
   vercel rollback [deployment-url]
   ```

### GitHub Rollback

1. **Revert Commit**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Emergency Rollback**:
   - Use Vercel dashboard for immediate rollback
   - Fix issues in separate branch
   - Deploy fix when ready

## Future Enhancements

### Planned Optimizations

1. **Performance**:
   - Service Worker implementation
   - Progressive Web App features
   - Image optimization pipeline

2. **Monitoring**:
   - Custom metrics dashboard
   - User behavior analytics
   - Performance budgets

3. **Security**:
   - Content Security Policy refinement
   - Security headers optimization
   - Vulnerability scanning

### Scaling Considerations

1. **Multi-User Support**:
   - Authentication integration
   - User-specific data isolation
   - Rate limiting implementation

2. **Advanced Features**:
   - Real-time collaboration
   - Offline functionality
   - Mobile app integration

## Support and Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/
- **Supabase Documentation**: https://supabase.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions

For deployment issues, check:
1. Vercel deployment logs
2. GitHub Actions workflow logs
3. Browser developer console
4. Supabase dashboard logs