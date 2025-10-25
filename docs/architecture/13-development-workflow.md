# 13. Development Workflow

## 13.1 Local Development

```bash
# Start all services
nx run-many --target=serve --projects=web,api --parallel=2

# Run tests
nx run-many --target=test --all

# Lint
nx run-many --target=lint --all

# Database migrations
nx run database:prisma-migrate
nx run database:prisma-generate
```

## 13.2 Git Flow

**Branches:**
- `main` - Production
- `develop` - Integration
- `feature/*` - Features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

**Commit Convention:**
```
feat(scope): description
fix(scope): description
docs(scope): description
```
