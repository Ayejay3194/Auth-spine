# Endpoints

## Discovery
- POST /api/discovery/search

## Providers
- GET /api/providers
- GET /api/providers/:id

## Booking
- POST /api/booking/slots
- POST /api/booking/create
- POST /api/booking/gapfill
- POST /api/booking/waitlist/add
- POST /api/booking/waitlist/match

## Reviews
- POST /api/reviews/create

## Marketing
- POST /api/marketing/campaigns/create

## Automation
- POST /api/automation/presets/seed

## Staff + Commissions
- POST /api/staff/add
- POST /api/staff/commission/rules/set
- POST /api/staff/commission/post

## Loyalty / Referrals / Gift Cards
- POST /api/loyalty/points/add
- POST /api/referrals/create
- POST /api/giftcards/create
- POST /api/giftcards/redeem


## Auth
- POST /api/auth/login

## Docs
- GET /api/openapi.json
- GET /api/metrics

## Webhooks
- POST /api/webhooks/register
