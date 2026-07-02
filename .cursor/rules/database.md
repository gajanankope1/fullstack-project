# Database Rules

Database:
- MySQL
- Sequelize ORM
- TypeScript

Never write raw SQL unless explicitly requested.

Always use Sequelize models.

All database access must go through repositories.

Use transactions whenever multiple write operations are performed.

Enable soft delete (paranoid) where appropriate.

Use timestamps.

Database naming:
- snake_case

TypeScript naming:
- camelCase

Table names:
- plural snake_case

Primary key:
- id

Foreign keys:
- user_id
- role_id
- etc.

Always add indexes for foreign keys.

Do NOT generate migrations.

Do NOT use sequelize-cli migration commands.

Schema changes are managed using Sequelize sync().

Use sync() only when enabled by environment configuration.

Never use:

sync({ force: true })

outside local development.

Never automatically drop tables.

Model associations should be initialized inside models/index.ts.