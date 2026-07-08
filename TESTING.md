# Testing

GymCord uses Vitest with React Testing Library for unit, engine, provider, API, event, automation, analytics, and component smoke coverage.

## Commands

```bash
npm run test
npm run test:watch
npm run test:coverage
```

Run `npm run build` before opening a PR to ensure TypeScript and Vite production compilation still pass.

## Test Layout

- `src/test/setup.ts` configures React Testing Library cleanup and `jest-dom` matchers.
- `src/test/utils.tsx` contains shared factories, auth service mocks, and `renderWithProviders`.
- Engine tests live beside engine code under `src/lib/engines/__tests__/`.
- Provider, API, event, notification, analytics, tenant, and component smoke tests live in nearby `__tests__` folders.

## Writing Tests

Prefer deterministic tests around public functions and externally visible behavior. Use the shared factories in `src/test/utils.tsx` instead of duplicating large GymCord fixtures. For React components, render through `renderWithProviders` when the component depends on app or auth context.

## Coverage

Coverage is produced with the V8 provider and written to `coverage/`:

```bash
npm run test:coverage
```
