# Project Context

Stack:

- Next.js App Router
- TypeScript
- MongoDB (via Mongoose)
- Tailwind CSS

Database:

- Connection: `src/lib/db/mongoose.ts`
- Models: `src/models/`
- Repositories: `src/repositories/`
- Env: `MONGODB_URI` in `.env.local`
- Env: `COINGECKO_API_KEY` in `.env.local` for live market data

Architecture:

Controller
↓

Service
↓

Repository
↓

Model

Authentication and authorization should follow the existing architecture.

Keep changes minimal.

Do not modify unrelated files.

Read only files necessary for the current task.