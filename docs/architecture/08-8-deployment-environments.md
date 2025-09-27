## 8. Deployment & Environments
- **Environments**: Dev (local Docker Compose), Staging (Supabase project + Render services), Production (separate Supabase instance + production Render/Vercel project).
- **CI/CD**: GitHub Actions running lint/test/build, applying DB migrations (via Supabase CLI) and deploying containers.
- **Infrastructure as Code**: Terraform or Supabase config files for reproducible environments.
- **Secret Management**: GitHub Actions secrets + Supabase secret store; rotate tokens quarterly.
