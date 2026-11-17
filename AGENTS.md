# AGENTS.md

## Project overview

Scaffnode is a personal-preference Node.js web-app scaffold, organized as a small monorepo:

- **Backend (repo root):** Express 5 server with Nunjucks templates, Bunyan logging, i18n (multi-language) support, and Redis-backed sessions.
- **Frontend (`frontend/`):** Svelte 5 SPA built with webpack 5, output served from `public/dist/` via the backend's Nunjucks templates.

## Repository layout

```
app.js              # Express app entry point and middleware wiring
config.js           # Environment config (gitignored - copy from config.sample.js)
config.sample.js    # Template for config.js
routes/             # Route handlers; index.js auto-loads every other .js file here
utils.js            # Shared helpers (i18n middleware, error handler)
views/              # Nunjucks templates (base.html layout, pages, errors/)
locales/            # i18n JSON files (en.json, fr.json)
public/             # Static files; public/dist/ is the webpack build output (gitignored)
tests/              # Backend mocha + supertest tests (*_tests.js)
deploy/             # NGINX config, systemd unit
ecosystem.config.js # pm2 config
frontend/           # Separate npm package: Svelte SPA, webpack config, Jest tests
```

## Setup

1. Install Node.js (>= 18) and have a Redis server reachable.
2. `cp config.sample.js config.js` and edit values (session secret, Redis host, domains).
3. `npm install` in the **repo root** AND in `frontend/` - they are separate packages.
4. Build the frontend before first boot (`cd frontend && npm run build`), otherwise no JS/CSS is served.

## Commands

Root package:

| Command | Purpose |
| --- | --- |
| `npm start` | Dev server (nodemon + bunyan), `NODE_ENV=dev` |
| `npm run start.live` | Live server, `NODE_ENV=live` |
| `npm test` | Backend tests (mocha + supertest) |
| `npx eslint <file>` | Lint (flat config in `eslint.config.mjs`) |

`frontend/` package:

| Command | Purpose |
| --- | --- |
| `npm run build` | Development webpack build into `../public/dist/` |
| `npm run watch` | Rebuild on change |
| `npm run build.live` | Production build (minified) |
| `npm test` | Jest component tests |

## Environment and configuration

- **`NODE_ENV` must be `dev`, `live`, or `test`** - the app exits on any other value (never use `production`). `test` maps to dev config with quiet logging.
- `config.js` is **gitignored and must never be committed**; it contains the session secret.
- The app connects to Redis at startup; all non-static routes return `503` JSON until Redis is ready.
- Session cookie is only marked `secure` and scoped to the configured domain in live mode; in dev it works on localhost.

## Code style and conventions

- Backend is **CommonJS** (no ESM); frontend source is ESM.
- 4-space indentation, semicolons, double quotes. Follow the surrounding style of each file.
- ESLint flat config (`eslint.config.mjs`) extends `eslint:recommended` with a large stylistic ruleset; run it before committing JS changes.
- Templates use Nunjucks with **autoescape on** - filters that produce HTML must return a `nunjucks.runtime.SafeString` or the markup renders escaped (see the `nl2br` filter in `app.js`).
- i18n: wrap user-facing strings in `__()` / `__n()` and add keys to every file in `locales/`.
- Add routes by dropping a new module in `routes/` following the `routes/base.js` constructor pattern (`function (bunyan, appConfig, redisSetup, appUtils)`).

## Testing

- Backend tests boot the real Express app via supertest and **require a reachable Redis** (see `config.js`). Run with `npm test`.
- Frontend tests use Jest (ESM mode, jsdom) with a small custom `.svelte` transformer at `frontend/tests/svelteJestTransformer.mjs`; SCSS imports are stubbed via `tests/styleMock.js`. Run with `cd frontend && npm test`.
- The frontend package is `"type": "module"` - all files in `frontend/` (including `webpack.config.js`) are ESM.
- There is no frontend test coverage requirement yet - `src/App.test.js` is the example to follow.

## Boundaries

- Never commit `config.js`, `public/dist/`, or any secrets.
- The frontend builds into `../public/dist/` from `frontend/`; the backend discovers bundles by reading that directory at boot (reboot the backend after a build).
- The webpack runtime chunk (`runtime.*.js`) must load before the main bundle; `app.js` sorts for this - keep the `[name]` in webpack's `output.filename`.
- Keep backend dependencies in the root `package.json` and frontend/build dependencies in `frontend/package.json`; don't mix them.
- Deploy configs in `deploy/` assume an NGINX reverse proxy with HTTPS and systemd/pm2 process management.
