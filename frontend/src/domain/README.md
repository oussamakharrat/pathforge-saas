# PathForge Domain Model

## Architecture Overview

```
src/domain/
├── entities/          # Business objects with factories & helpers
│   ├── user.ts        # Root aggregate — owns everything
│   ├── career-profile.ts  # Derived metrics (computed, not stored)
│   ├── goal.ts        # Career objectives with milestones
│   ├── skill.ts       # Competencies + market data + job maps
│   ├── learning-plan.ts   # Structured learning paths
│   ├── resume.ts      # Versioned resume documents
│   ├── job-application.ts # Kanban-tracked applications
│   ├── interview.ts   # Real + mock interview sessions
│   ├── negotiation.ts # Salary negotiations
│   ├── portfolio.ts   # Skill-validating projects
│   ├── achievement.ts # Milestone achievements
│   ├── badge.ts       # Recognition badges
│   ├── service-purchase.ts # Paid services with impact
│   └── analytics.ts   # Historical metric snapshots
├── services/          # Pure business logic
│   ├── career-progression.service.ts  # Central scoring engine
│   ├── relationship-graph.service.ts  # Entity connections
│   └── impact-engine.service.ts       # Change propagation
└── value-objects/     # Immutable shared types
```

## Core Principles

1. **User is the root aggregate** — All entities belong to a User
2. **Derived metrics are never stored** — CareerProfile values are always computed
3. **Everything is connected** — Every action propagates through the relationship graph
4. **AI operates across all entities** — The AI Coach uses the full domain model

## Entity Relationship Graph

```
Goal → Learning Plan → Skill → Career Score → Job Match → Application → Interview → Offer → Negotiation
  │                          │                          │
  └── Milestones             └── Portfolio validates     └── Achievement → Badge
                              └── Resume Score
```

## Career Score Formula

```
careerScore = skills × 0.30 + goals × 0.20 + applications × 0.15 
            + interviews × 0.15 + portfolio × 0.10 + achievements × 0.10
```

## Usage

### New components should import from the domain directly:
```typescript
import { Skill, Goal, computeCareerMetrics } from "../../domain";
```

### Existing components continue using legacy types via adapters:
```typescript
import { toLegacySkills } from "../domain-adapter/adapters";
```

### The context exposes both APIs:
```typescript
const { skills, domainUser, relationshipLinks } = useCareerData();
```
