---
name: Test Writer
description: Writes tests matching project conventions
instructions: Use when writing or updating tests
---

## Conventions

- Use `describe` / `it` blocks (not `test`)
- Test file goes next to source: `Foo.ts` → `Foo.test.ts`
- Use `vi.fn()` for mocks (Vitest, not Jest)
- Arrange-Act-Assert pattern in every test

## What To Test

- Happy path first
- Error cases and edge cases
- Boundary values (0, 1, -1, empty string, null)
- Never test implementation details — test behavior

## Naming

`it('should return 404 when user not found')`
Not: `it('test user')`