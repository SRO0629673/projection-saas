# ProjectionPro

ProjectionPro is a financial projection report MVP for Indian finance professionals. V1 focuses on financial projections; CMA is intentionally a coming-soon area.

## Implemented

- Applicant, business, sector, assumptions, financing, and existing-loan inputs
- Recovered 38-sector assumption library from the supplied legacy HTML
- Projection calculations ported from its embedded JavaScript, including monthly term-loan amortization, WDV depreciation, gold-loan bullet repayment, existing term-loan repayment, statements, cash flow, and ratios
- Browser-local report workflow for credential-free development; report creation, edit, duplication, report list, print-to-PDF, and Excel workbook export
- Excel workbook includes a separate `Industry Library` worksheet; the PDF print view excludes that worksheet
- Supabase Auth scaffolding, owner-scoped report APIs, database migration with RLS, server-side payment verification, subscription activation, webhook processing, and trusted admin role checks
- Live admin user/payment/overview pages when Supabase credentials and migration are configured

## Important data boundary

Without Supabase credentials, reports are stored only in the current browser profile and do not synchronize across devices. Configure Supabase before production use. The calculation port has automated checks for the assumption count, zero-interest amortization, existing-term-loan installments, and gold-loan bullet repayment; validate representative outputs against the legacy workbook before relying on generated financial reports.

## Requirements

- Node.js 22 or newer recommended
- npm
- Supabase project for authentication and durable report/payment data
- Razorpay account for paid access

## Local development

```bash
npm ci
npm run dev -- --port 3001
```

Open http://localhost:3001. With Supabase variables absent, the workspace supports local browser testing; paid checkout and durable cloud features remain unavailable.

## Environment variables

Copy `.env.example` to `.env.local` and add credentials directly in that local file. Do not commit `.env.local` or share service-role/payment secrets in chat.

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SUPPORT_EMAIL=
NEXT_PUBLIC_SUPPORT_WHATSAPP=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

The Supabase service role and Razorpay secrets are server-only values. Only the Supabase URL/anon key and Razorpay key ID may be exposed as `NEXT_PUBLIC_*` values.

## Supabase setup

1. Create a Supabase project and set the URL, anon key, and service role key in `.env.local`.
2. Apply `supabase/migrations/202610030001_initial_schema.sql` using the Supabase SQL editor or Supabase CLI.
3. For V1, disable mandatory email confirmation in Supabase Auth. Configure Site URL and allowed password-reset redirect URLs for http://localhost:3001 and the production domain.
4. Assign admin access only through trusted Supabase `app_metadata`, for example `{"role":"admin"}`. Do not use user-editable metadata for roles.
5. Create a user, sign in, and confirm profile creation, report ownership, RLS, and subscription queries.

Paid report writes require an active `subscriptions` row. Report reads remain available after expiry. Payment and subscription rows can only be written through the service-role server flow.

## Razorpay setup

1. Add test credentials locally first.
2. Configure the webhook URL as `https://YOUR_DOMAIN/api/webhooks/razorpay`.
3. Subscribe to `payment.captured` and use the same webhook secret in the app environment.
4. Test order creation, captured-payment verification, webhook retries, and subscription activation before switching to live credentials.

A payment signature by itself does not grant access: the server verifies the payment with Razorpay and then activates entitlement through an idempotent database function.

## Validation

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

## Deploy preparation

- Configure every environment variable in the Vercel project for preview/production as appropriate.
- Apply the Supabase migration to the matching database and configure auth redirect URLs.
- Set a trusted admin `app_metadata.role` claim; no administrator is created automatically.
- Configure Razorpay webhook URL and secret.
- Validate generated outputs against the original Excel workbook across representative sectors, financing cases, and optional loan combinations.
- Have qualified counsel review Terms, Privacy, and Refund/Cancellation policy copy before accepting payments.

The current dependency audit is clean for production dependencies. The development toolchain may still report advisories in Next's lint dependency chain; inspect `npm audit` before upgrading that toolchain.

## Repository and deployment handoff

Use this repository only for ProjectionPro. Git origin should be
`https://github.com/SRO0629673/projection-saas.git`.
The separate `projection-saas-platform` folder is an unused starter;
`economics-movie-studio` is a different product.

In Vercel, import the Projection repository as a Next.js project with the repository
root as Root Directory. Set the environment variables from `.env.example` using
credentials for the Projection database, not the Economics database. Configure
Preview and Production explicitly. Set `NEXT_PUBLIC_APP_URL` to the corresponding
deployed origin and configure matching Supabase redirect URLs, then redeploy.
Keep Razorpay in Test Mode until payment and webhook validation succeeds.
Do not enable paid launch based on build success alone.

## Remaining acceptance work

The current implementation still needs work against the original specification:

- Multi-step builder, debounced draft autosave, retry and resume behavior.
- Report deletion with an accessible confirmation dialog.
- Versioned input, calculation engine and report template metadata.
- Manual admin access grant, extension, revocation and audit trail.
- Analytics events without client or financial data, sitemap and robots rules.
- Representative comparisons against the original tool; the existing five engine
  tests are focused checks, not a full migration parity suite.
- Live Supabase registration/reset, report persistence, cross-user RLS and access
  expiry validation after migrations are applied.
- Razorpay Test Mode orders, callbacks, invalid signatures and repeated webhooks.
- Deployed Preview and Production checks for reports and workbook/print exports.

Admin users now support name/email/mobile search, report counts and explicit
query failure states. Large user datasets will need pagination before scale-up.
