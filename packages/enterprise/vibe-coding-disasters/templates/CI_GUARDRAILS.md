# CI Guardrails (suggested)

Required checks:
- typecheck
- lint
- tests
- dependency vulnerability scan
- secret scan
- build

Merge protection:
- PR reviews required
- block direct pushes to main
- require checks to pass

Deploy gating:
- manual approval for production
- tagged releases + changelog
