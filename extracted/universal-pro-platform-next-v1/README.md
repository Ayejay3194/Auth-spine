# Universal Professional Platform V1 (Next.js)

Vertical-agnostic kernel + vertical JSON configs + compliance policy evaluator.

## Run
```bash
npm install
npm run dev
```

## Pages
- `/` home
- `/onboarding` config-driven onboarding
- `/test` API poke console

## APIs
- `GET /api/verticals`
- `GET /api/verticals/:key`
- `POST /api/compliance/evaluate`
- `GET /api/referrals/policy`
- `POST /api/bundles/suggest`
- `GET /api/client/profile?id=usr_1`
- `GET /api/registry`
- `POST /api/smoke`

## Add a new vertical
Add JSON config under `src/verticals/configs/`, import it in `src/verticals/loader.ts`.
