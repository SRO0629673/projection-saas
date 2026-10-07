<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project boundary

This repository is ProjectionPro financial projection SaaS. Its intended remote is
https://github.com/SRO0629673/projection-saas.git and its local development port is 3001.
Work only in this repository. Economics Movie Studio and projection-saas-platform
are separate folders and must not be modified as part of ProjectionPro work.
Preserve the migrated financial formulas; do not invent or change calculations.
A passing production build does not verify live auth, payments, RLS or calculation parity.
