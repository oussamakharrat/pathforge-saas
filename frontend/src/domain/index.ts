/**
 * PathForge Domain Model
 *
 * This is the entry point for the domain layer.
 * All domain logic is accessible through this barrel.
 *
 * Architecture:
 *  - entities/    → Business objects with their factories and helpers
 *  - services/    → Pure business logic (scoring, relationships, impact)
 *  - value-objects/ → Immutable shared types
 */

export * from "./entities";
export * from "./services";
export * from "./value-objects";
