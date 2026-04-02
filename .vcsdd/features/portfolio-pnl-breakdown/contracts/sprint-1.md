---
sprintNumber: 1
feature: portfolio-pnl-breakdown
scope: portfolio-pnl-breakdown MVP for selected holdings in financial-viz
negotiationRound: 0
status: approved
criteria:
  - id: CRIT-001
    dimension: spec_fidelity
    description: Quote fetch, pending-rate, and aggregate PnL behavior match REQ-007.
    weight: 0.2
    passThreshold: Implementation and tests align with the behavioral spec.
  - id: CRIT-002
    dimension: edge_case_coverage
    description: Missing-input, mixed-currency, and quote-error paths remain covered.
    weight: 0.2
    passThreshold: The documented edge cases have automated coverage.
  - id: CRIT-003
    dimension: implementation_correctness
    description: The pure aggregation logic computes totals and statuses correctly.
    weight: 0.2
    passThreshold: Utility and component behavior stay consistent with the spec.
  - id: CRIT-004
    dimension: structural_integrity
    description: Hook, pure utility, and DOM panel remain separated by responsibility.
    weight: 0.2
    passThreshold: The implementation preserves the declared purity boundary.
  - id: CRIT-005
    dimension: verification_readiness
    description: The new feature has stable automated coverage and reviewable evidence.
    weight: 0.2
    passThreshold: Tests and review artifacts are sufficient for Tier 0 verification.
---

# Sprint 1 Contract

This contract defines the acceptance criteria for the `portfolio-pnl-breakdown` implementation sprint.
