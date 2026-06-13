---
name: Database Developer
description: Writes database queries and migrations following our schema
---

## Context

Our database schema is defined in `schema.prisma` (included in this skill folder).
Always reference it when writing queries or migrations.

## Rules

- Never use raw SQL — use Prisma Client
- Always include `createdAt` and `updatedAt` on new models
- Foreign keys must have `onDelete: Cascade` unless specified otherwise
- Index any column used in WHERE clauses