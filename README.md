# Generic Search Frontend

Config-driven Angular frontend for the Generic Search Factory. The running
backend supplies branding, filters, capabilities, facets, result-card fields,
pagination limits, documents, and source-file URLs; this application does not
contain use-case-specific search fields or labels.

## Run locally

Use Node.js 18 (last verified with Node 18.20.8), then run:

```bash
npm install
npm start
```

Open `http://localhost:4200`. Start the generic backend separately; the local
default is `http://localhost:5000/api`.

## Point at another project

For local development, change only `apiUrl` in
`src/environments/environment.ts`. It must point at the generic backend's
`/api` prefix, for example:

```ts
apiUrl: 'https://search.example.org/api'
```

Production builds use `src/environments/environment.prod.ts` through Angular's
file replacement. Set its `apiUrl` to the deployment endpoint before building
if it differs from the checked-in default.

The backend must expose these generic endpoints:

- `GET /config` for the resolved UI contract
- `GET /facets` for corpus-wide filter options and bounds
- `POST /search` for a typed `SearchRequest`
- `GET /documents/:id` and `GET /documents/:id/source` for document viewing

## Commands

```bash
npm start                         # development server
npm run build                     # production build
npm run build -- --configuration development
npm test                          # Karma unit tests
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.spec.json
```

## Frontend behavior

- `ConfigStore` and `FacetStore` share config and corpus-wide facets for the
  browser session. See `docs/facets-caching.md` for the invalidation policy.
- Filters and result-card fields are rendered entirely from `GET /config`.
- A 200 response with zero hits is a normal empty-result state. API failures
  use the backend error envelope: invalid queries are actionable, while
  configuration and internal errors remain generic.
