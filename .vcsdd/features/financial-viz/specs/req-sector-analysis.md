---
coherence:
  node_id: "req:sector-analysis"
  type: requirement
  name: "Sector Analysis Requirement"
  depended_by:
    - id: "design:data-schema"
    - id: "module:comparison-engine"
    - id: "design:ui-components"
---

# REQ-005: Sector Analysis

## Requirement

The application MUST display sector and industry classification for each company to enable sector-based comparison and filtering.

## Behavioral Specification (EARS Format)

- **WHEN** a company is loaded **THE SYSTEM SHALL** retrieve sector and industry fields from Yahoo Finance `summaryProfile`
- **WHEN** displaying company data **THE SYSTEM SHALL** show sector badge in the StrategyPanel component
- **WHEN** multiple companies are selected **THE SYSTEM SHALL** allow comparison by sector grouping

## Acceptance Criteria

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-005-1 | Sector field populated from Yahoo Finance summaryProfile.sector | High |
| AC-005-2 | Industry field populated from summaryProfile.industry | High |
| AC-005-3 | Sector badge rendered in StrategyPanel component | Medium |
| AC-005-4 | ComparisonChart optionally filterable by sector | Low |

## Impact on Design Nodes

This requirement affects:
- `design:data-schema`: Must add `sector` and `industry` fields to `CompanyInfo` type
- `design:ui-components`: StrategyPanel must render sector badge
- `module:comparison-engine`: `rankByMetric` should support sector grouping
