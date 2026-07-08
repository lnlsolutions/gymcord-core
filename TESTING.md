# Testing

Gymcord uses [Vitest](https://vitest.dev/) with the `jsdom` environment for unit and component tests. React component tests use Testing Library and `@testing-library/jest-dom` matchers.

## Running tests

Install dependencies and run the test suite:

```bash
npm ci
npm run test
```

For local watch mode during development:

```bash
npm run test:watch
```

## Coverage

Generate a coverage report with:

```bash
npm run coverage
```

Coverage uses the Vitest V8 provider and writes text, JSON, and HTML reports to `coverage/`.

## CI workflow

The GitHub Actions workflow at `.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. It uses Node.js 22, restores the npm cache, installs dependencies with `npm ci`, then runs:

```bash
npm run build
npm run test
```

The workflow fails if either the production build or the test suite fails.

## Writing new tests

- Place tests next to the code they cover in `__tests__` folders or use `*.test.ts` / `*.test.tsx` files.
- Prefer behavior-focused assertions over implementation details.
- Use Testing Library queries such as `getByRole`, `getByLabelText`, and `findByText` for component tests.
- Keep tests deterministic and avoid depending on wall-clock time, network calls, or persistent browser storage unless those concerns are explicitly under test.
- Add shared test helpers under `src/test/` when multiple suites need the same setup.

## Mock strategy

- Use Vitest mocks (`vi.fn`, `vi.mock`, `vi.spyOn`) for external services, browser APIs, and side-effect boundaries.
- Mock network, storage, analytics, notification, and real-time integrations at their module boundary so application behavior remains testable without remote services.
- Reset mock state between tests when a suite mutates shared mocks.
- Prefer lightweight in-memory fakes for domain services when the fake makes the expected behavior easier to read than a low-level mock.

Global test setup lives in `src/test/setup.ts`, which registers jest-dom matchers for every test file.
