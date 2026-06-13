---
name: Commit Message Style
description: Enforces Conventional Commits format
instructions: Use when creating git commits
---

## Format

All commits must follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]
```

## Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code change that neither fixes nor adds
- `test`: Adding or updating tests
- `chore`: Maintenance (dependencies, CI, build)

## Rules

- Description must be lowercase, no period at the end
- Scope is optional but encouraged
- Body should explain WHY, not WHAT (the diff shows what)
- Max 72 characters for the first line

## Examples

Good: `feat(auth): add password reset flow`
Good: `fix(api): handle null response from payment gateway`
Bad: `Fixed stuff`
Bad: `Update code`