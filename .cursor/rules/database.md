# MongoDB / Mongoose Rules

Database:

- MongoDB with Mongoose ODM
- Connection string via `MONGODB_URI` environment variable

Connection:

- Use a single cached connection in `src/lib/db/mongoose.ts`
- Call `connectDB()` before any database operation in API routes or server code
- Never create a new connection per request

Models:

- Define schemas and models in `src/models/`
- One model per file, exported as default
- Use `mongoose.models.ModelName || mongoose.model(...)` to avoid recompilation in dev
- Enable `{ timestamps: true }` on schemas unless explicitly not needed
- Use camelCase for schema field names

Repositories:

- All Mongoose queries live in `src/repositories/`
- Repositories import models only — never define schemas there
- Call `connectDB()` at the start of each repository method

Queries:

- Use lean queries for read-only data when full Mongoose documents are not needed
- Use `.select()` to limit returned fields
- Prefer `findOne`, `findById`, `create`, `findOneAndUpdate` over raw collection access

Indexes:

- Define indexes in the schema, not ad hoc in application code
- Use `unique: true` on schema fields that must be unique

Transactions:

- Use Mongoose sessions for multi-document transactions in services
- Start sessions in the service layer, not in repositories
