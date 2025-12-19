Universal scikit-learn Scorers (Optional)
========================================

These are generic templates you can clone per product:
- triage_scorer (support tickets, moderation, incidents)
- ranking_scorer (match ordering, content ordering)

Hard rules:
- ML returns scores only.
- Deterministic policy gates first.
- No text generation.

Folders
-------
triage/
ranking/
