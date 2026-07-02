# Coding Standards

Language:
- TypeScript

General:
- Use async/await only.
- Avoid Promise.then().
- Use early returns.
- Keep functions small.
- Maximum one responsibility per function.
- Use descriptive names.
- Avoid nested if statements.
- Prefer reusable helpers.

Imports:
- Use absolute imports with @/*.
- Remove unused imports.

Types:
- Avoid any.
- Prefer interfaces for API contracts.
- Use enums for constant values.

Error Handling:
- Throw custom errors.
- Never return error strings.
- Never swallow exceptions.

Code Quality:
- No TODO comments.
- No placeholder implementations.
- No commented-out code.

Write production-ready code only.