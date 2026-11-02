# Sample Target Codebase

Throwaway test repo for the Local Code Agent. Point the agent's
"Codebase path" at this folder while you're verifying the pipeline
works end to end, before trying it on a real project.

It contains a small layered **Node.js + Express + TypeScript** backend template
(and the original `app/example.py`).

## Quick start

    npm install
    cp .env.example .env   # optional
    npm run dev            # start with auto-reload (tsx)
    npm test               # run the test suite (node:test via tsx)
    npm run typecheck      # tsc --noEmit
    npm run build && npm start   # compile to dist/ and run

## Layout

    src/
      server.ts        entry point: starts HTTP server, graceful shutdown
      app.ts           builds the Express app (imported by tests)
      config/          env-based configuration (only place reading process.env)
      routes/          URL -> middleware + controller wiring
      controllers/     HTTP layer: req -> service -> res
      services/        business logic, no req/res
      repositories/    data access (in-memory Map; swap for a real DB)
      validators/      request body validators, return arrays of error strings
      middlewares/     requestLogger, validate, notFound, errorHandler
      types/           shared interfaces (User, Product, Validator)
      utils/           AppError, asyncHandler, logger
    tests/             integration tests against a real server on a random port

Request flow: `route -> validate -> controller -> service -> repository`.
Errors thrown anywhere (use `AppError` helpers) end up in `errorHandler`,
which returns `{ "error": { "message", "details?" } }`.

## API

| Method | Path             | Description     |
|--------|------------------|-----------------|
| GET    | /api/health      | Health check    |
| GET    | /api/users       | List users      |
| GET    | /api/users/:id   | Get one user    |
| POST   | /api/users       | Create user     |
| PATCH  | /api/users/:id   | Update user     |
| DELETE | /api/users/:id   | Delete user     |
| GET    | /api/products    | List products (`?inStock=true` filters out stock 0) |
| GET    | /api/products/:id | Get one product |
| POST   | /api/products    | Create product (`name`, `price`, optional `stock`) |
| PATCH  | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

## Adding a new resource

1. `src/types/<name>.ts`
2. `src/repositories/<name>.repository.ts`
3. `src/services/<name>.service.ts`
4. `src/validators/<name>.validator.ts`
5. `src/controllers/<name>.controller.ts`
6. `src/routes/<name>.routes.ts`, then register it in `src/routes/index.ts`
7. `tests/<name>.test.ts`

Use `npm test` (or `npm run typecheck && npm test`) as the agent's test command.
