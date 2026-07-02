# Project Context

Stack:

- Next.js App Router
- TypeScript
- MySQL
- Sequelize
- Tailwind CSS

Architecture:

Controller
↓

Service
↓

Repository
↓

Model

Database synchronization:

Use Sequelize sync().

Do not generate migrations.

Never introduce Prisma or another ORM.

Authentication and authorization should follow the existing architecture.

Keep changes minimal.

Do not modify unrelated files.

Read only files necessary for the current task.