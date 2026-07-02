# Architecture Rules

Follow a layered architecture:

Controller → Service → Repository → Model

Responsibilities:

- Controllers
  - Parse request
  - Validate input
  - Call service
  - Return standardized response
  - Never access database directly

- Services
  - Business logic
  - Call repositories
  - Handle transactions
  - No HTTP logic

- Repositories
  - All Sequelize queries
  - No business logic

- Models
  - Sequelize model definitions only

Never skip layers.

Keep functions focused on a single responsibility.

Prefer reusable utility functions over duplicated code.

Do not modify unrelated files unless explicitly requested.