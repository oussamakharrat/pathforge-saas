'use client';

import { FileText, Edit3, Layers, Map, DollarSign, Mic } from "lucide-react";
import { FLAME, CARBON } from "../lib/constants";
import type { Goal, Skill, LearningStep, KanbanData, Conversation, QuizQuestion } from "./types";

export const INITIAL_GOALS: Goal[] = [
  { id: 1, apiId: "seed-goal-1", title: "Senior Full-Stack Engineer", progress: 62, deadline: "Dec 2025", steps: 8, done: 5, milestones: [] },
  { id: 2, apiId: "seed-goal-2", title: "Staff Engineering Role", progress: 24, deadline: "Jun 2026", steps: 12, done: 3, milestones: [] },
  { id: 3, apiId: "seed-goal-3", title: "Ship 3 SaaS Products", progress: 33, deadline: "Mar 2026", steps: 9, done: 3, milestones: [] },
  { id: 4, apiId: "seed-goal-4", title: "50 Open Source PRs", progress: 78, deadline: "Sep 2025", steps: 10, done: 8, milestones: [] },
];

export const INITIAL_SKILLS: Skill[] = [
  { name: "TypeScript", level: "Advanced", pct: 88, cat: "Language" },
  { name: "React", level: "Advanced", pct: 92, cat: "Frontend" },
  { name: "Node.js", level: "Intermediate", pct: 68, cat: "Backend" },
  { name: "PostgreSQL", level: "Intermediate", pct: 61, cat: "Database" },
  { name: "GraphQL", level: "Intermediate", pct: 55, cat: "API" },
  { name: "Docker", level: "Beginner", pct: 38, cat: "DevOps" },
  { name: "Kubernetes", level: "Beginner", pct: 22, cat: "DevOps" },
  { name: "System Design", level: "Intermediate", pct: 64, cat: "Architecture" },
  { name: "AWS", level: "Beginner", pct: 35, cat: "Cloud" },
  { name: "Testing", level: "Intermediate", pct: 72, cat: "Quality" },
];

export const INITIAL_STEPS: LearningStep[] = [
  { id: 1, title: "Advanced TypeScript Patterns", done: true, range: "Week 1–2", tag: "Language" },
  { id: 2, title: "Distributed Systems Fundamentals", done: true, range: "Week 3–4", tag: "Architecture" },
  { id: 3, title: "Docker & Container Orchestration", done: false, range: "Week 5–6", tag: "DevOps", active: true },
  { id: 4, title: "AWS Core Services", done: false, range: "Week 7–9", tag: "Cloud" },
  { id: 5, title: "Kubernetes & Helm", done: false, range: "Week 10–12", tag: "DevOps" },
  { id: 6, title: "GraphQL API Design", done: false, range: "Week 13–14", tag: "API" },
  { id: 7, title: "10 OSS Contributions", done: false, range: "Week 15–16", tag: "OSS" },
  { id: 8, title: "System Design Interviews ×5", done: false, range: "Week 17–18", tag: "Interview" },
];

export const INITIAL_KANBAN: KanbanData = {
  saved: [
    { id: "k1", company: "Vercel", role: "Senior SWE", salary: "$180–230k", date: "", match: 94, notes: "Dream company. Apply by Aug 1.", logo: "V" },
    { id: "k2", company: "Linear", role: "Full-Stack Eng", salary: "$170–210k", date: "", match: 88, notes: "Great culture fit.", logo: "L" },
  ],
  applied: [{ id: "k3", company: "Stripe", role: "Software Eng II", salary: "$195–260k", date: "Jul 2", match: 76, notes: "Applied via referral.", logo: "S" }],
  screening: [{ id: "k4", company: "Figma", role: "Senior Frontend", salary: "$185–240k", date: "Jul 8", match: 91, notes: "Recruiter screen scheduled.", logo: "F" }],
  interview: [{ id: "k5", company: "Notion", role: "Staff Engineer", salary: "$220–290k", date: "Jul 14", match: 83, notes: "System design round next.", logo: "N" }],
  final: [{ id: "k6", company: "Loom", role: "Senior SWE", salary: "$160–200k", date: "Jul 18", match: 79, notes: "Final panel with VP Eng.", logo: "LM" }],
  offer: [{ id: "k7", company: "Ramp", role: "Senior SWE", salary: "$210–260k", date: "Jul 20", match: 95, notes: "Offer received! Negotiating.", logo: "R" }],
  rejected: [{ id: "k8", company: "Airbnb", role: "Senior SWE", salary: "$190–240k", date: "Jun 28", match: 72, notes: "Failed system design.", logo: "A" }],
};

export const TESTIMONIALS = [
  { name: "Sarah K.", role: "→ Senior Engineer at Stripe", avatar: "SK", quote: "I went from no callbacks to 4 offers in 6 weeks. The AI coach identified exactly what was holding me back.", comp: FLAME },
  { name: "Marcus T.", role: "→ Staff Engineer at Linear", avatar: "MT", quote: "The salary negotiation agent saved me $40k. It generated counter-offer scripts I never would have thought of.", comp: CARBON },
  { name: "Priya M.", role: "→ Tech Lead at Notion", avatar: "PM", quote: "The mock interview module is eerily realistic. After 5 sessions, my system design answers were sharper than ever.", comp: FLAME },
];

export const FAQS = [
  { q: "How is PathForge different from LinkedIn Learning?", a: "We're a personalized AI career operating system that analyzes your specific profile, identifies your gaps, and creates a tailored path — with an AI coach available 24/7." },
  { q: "Is my resume data secure?", a: "All data is encrypted at rest and in transit. We never share your information with employers or third parties. You own your data and can export or delete it at any time." },
  { q: "Can I cancel anytime?", a: "Absolutely. No lock-ins. Cancel from Settings with one click. You keep access until your billing period ends." },
  { q: "How accurate is the salary negotiation agent?", a: "Our agent pulls from real-time compensation data across 50k+ verified offers. Premium users have negotiated $15k–$80k increases." },
  { q: "Does mock interview work for non-engineering roles?", a: "Currently optimized for engineering roles. Product and design tracks launch Q4 2025." },
];

export const SERVICES_LIST = [
  { icon: FileText, name: "Resume Review", price: "$49", desc: "AI analysis with ATS optimization and actionable rewrites.", tags: ["48h turnaround", "ATS score"] },
  { icon: Edit3, name: "CV Full Rewrite", price: "$149", desc: "Complete CV transformation. Interview-ready in 72 hours.", tags: ["72h delivery", "3 revisions"] },
  { icon: Layers, name: "LinkedIn Optimization", price: "$99", desc: "AI-powered profile optimization to attract top recruiters.", tags: ["Profile rewrite", "Keyword boost"] },
  { icon: Map, name: "Career Roadmap", price: "$79", desc: "Personalized 12-month AI-generated roadmap for your goals.", tags: ["Personalized", "Monthly milestones"] },
  { icon: DollarSign, name: "Salary Negotiation", price: "$129", desc: "1-on-1 AI coaching with live counter-offer strategy.", tags: ["Live session", "Market data"] },
  { icon: Mic, name: "Interview Coaching", price: "$99", desc: "5 AI mock interviews with detailed feedback and scores.", tags: ["5 sessions", "Scorecard"] },
];

export const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  behavioral: [
    "Tell me about a time you led a complex project under tight deadlines.",
    "Describe a disagreement with your team and how you resolved it.",
    "Walk me through your most impactful shipped project.",
    "How do you approach mentoring junior engineers?",
    "Tell me about a significant failure and what you learned.",
  ],
  technical: [
    "Design a URL shortening service. Walk through your architecture.",
    "How would you scale a PostgreSQL database hitting its limits?",
    "Explain optimistic vs pessimistic concurrency control.",
    "How does React reconciliation work under the hood?",
    "Design a real-time notification system for 10 million users.",
  ],
  system: [
    "Design Twitter's feed generation system.",
    "How would you architect a global CDN from scratch?",
    "Design a ride-sharing system like Uber.",
    "How would you build a distributed cache?",
    "Design a payment processing system with exactly-once semantics.",
  ],
};

export const QUICK_PROMPTS = [
  "What should I learn next?",
  "Why am I not getting interviews?",
  "Fix my resume",
  "Create a 30-day plan",
  "What's blocking my career growth?",
];

export const INITIAL_CONVOS: Conversation[] = [
  { id: "c1", title: "Career roadmap for Senior Eng", date: "Today", preview: "Based on your 62% career score..." },
  { id: "c2", title: "Resume feedback session", date: "Yesterday", preview: "I've analyzed your resume v3..." },
  { id: "c3", title: "Why no interview callbacks?", date: "Jun 14", preview: "Looking across your data..." },
  { id: "c4", title: "System design prep plan", date: "Jun 11", preview: "For Notion Staff Engineer..." },
];

export const SKILL_QUIZ_DATA: Record<string, QuizQuestion[]> = {
  TypeScript: [
    { q: "What does the `infer` keyword do in TypeScript?", options: ["Infers type within a conditional type", "Forces type inference off", "Creates a generic alias", "Converts any to unknown"], correct: 0 },
    { q: "What is the difference between `unknown` and `any`?", options: ["`unknown` requires type checking before use", "They are the same", "`any` is stricter", "`unknown` allows all operations"], correct: 0 },
    { q: "Which utility type makes all properties optional?", options: ["Partial<T>", "Required<T>", "Pick<T>", "Omit<T>"], correct: 0 },
  ],
  React: [
    { q: "What triggers a re-render in React?", options: ["State or props change", "DOM mutation", "CSS change", "Variable reassignment"], correct: 0 },
    { q: "What is the purpose of `useCallback`?", options: ["Memoize a function reference", "Schedule async work", "Create a context", "Replace useEffect"], correct: 0 },
    { q: "How does React reconciliation determine which DOM nodes to update?", options: ["Compares virtual DOM trees via diffing", "Checksums the HTML", "Re-renders the entire DOM", "Uses MutationObserver"], correct: 0 },
  ],
  "Node.js": [
    { q: "What is the event loop in Node.js?", options: ["Mechanism for non-blocking async I/O", "A loop that iterates over events in the DOM", "Thread pool scheduler", "HTTP request queue"], correct: 0 },
    { q: "What does `process.nextTick()` do?", options: ["Queues callback before next I/O cycle", "Delays execution by 1 second", "Runs in a new thread", "Triggers garbage collection"], correct: 0 },
    { q: "Which module is used for file system operations?", options: ["fs", "path", "os", "http"], correct: 0 },
  ],
  PostgreSQL: [
    { q: "What does EXPLAIN ANALYZE do?", options: ["Shows actual execution plan with timing", "Deletes analyzed rows", "Creates an index automatically", "Backs up the table"], correct: 0 },
    { q: "What is a CTE in SQL?", options: ["Common Table Expression — named temporary result set", "Computed Type Extension", "Cached Table Entity", "Concurrent Transaction Engine"], correct: 0 },
    { q: "Which index type is best for full-text search?", options: ["GIN", "B-tree", "Hash", "BRIN"], correct: 0 },
  ],
  GraphQL: [
    { q: "What is a GraphQL resolver?", options: ["Function that populates data for a schema field", "Middleware for REST APIs", "Type validator", "Cache invalidator"], correct: 0 },
    { q: "What problem does DataLoader solve?", options: ["N+1 query batching and caching", "Rate limiting", "Schema stitching", "Error handling"], correct: 0 },
    { q: "What is a GraphQL subscription?", options: ["Real-time event stream via WebSocket", "Paid API plan", "Database trigger", "HTTP polling wrapper"], correct: 0 },
  ],
  Docker: [
    { q: "What is a multi-stage Docker build?", options: ["Uses multiple FROM statements to minimize image size", "Builds on multiple machines", "Parallel layer compilation", "Building from multiple repos"], correct: 0 },
    { q: "What does docker-compose do?", options: ["Defines and runs multi-container applications", "Compresses Docker images", "Manages Docker Hub repos", "Encrypts containers"], correct: 0 },
    { q: "What is a Docker volume used for?", options: ["Persistent data storage across container restarts", "Increasing CPU allocation", "Managing network traffic", "Caching image layers"], correct: 0 },
  ],
  Kubernetes: [
    { q: "What is a Kubernetes Pod?", options: ["Smallest deployable unit, wraps one or more containers", "A cluster node", "A network policy", "A storage driver"], correct: 0 },
    { q: "What does a Kubernetes Service provide?", options: ["Stable network endpoint for a set of Pods", "Container runtime", "Image registry", "Log aggregation"], correct: 0 },
    { q: "What is a Helm chart?", options: ["Package of pre-configured Kubernetes resources", "CPU metrics dashboard", "Load balancer config", "CI/CD pipeline"], correct: 0 },
  ],
  "System Design": [
    { q: "What is the CAP theorem?", options: ["A distributed system can only guarantee 2 of: Consistency, Availability, Partition tolerance", "CPU-Algorithm-Performance tradeoff", "Cache Allocation Protocol", "Centralized Access Point"], correct: 0 },
    { q: "When would you use a message queue?", options: ["Decouple services and handle async workloads", "Replace a database", "Serve static files", "Manage DNS"], correct: 0 },
    { q: "What is consistent hashing?", options: ["Distributes keys evenly with minimal remapping on node changes", "A hash function that always returns the same value", "Encrypting data at rest", "Database sharding by user ID"], correct: 0 },
  ],
  AWS: [
    { q: "What is the difference between S3 and EBS?", options: ["S3 is object storage; EBS is block storage for EC2", "They are identical", "S3 is a database; EBS is compute", "EBS is serverless; S3 is not"], correct: 0 },
    { q: "What is AWS Lambda?", options: ["Serverless compute that runs code in response to events", "A database service", "A container orchestrator", "A VPN gateway"], correct: 0 },
    { q: "What does IAM stand for?", options: ["Identity and Access Management", "Internal Application Monitor", "Integrated API Manager", "Instance Auto-Migration"], correct: 0 },
  ],
  Testing: [
    { q: "What is the testing pyramid?", options: ["Strategy: many unit tests, fewer integration, fewest E2E", "A debugging methodology", "Performance benchmarking framework", "Code coverage metric"], correct: 0 },
    { q: "What is mocking in unit tests?", options: ["Replacing dependencies with controlled substitutes", "Duplicating production data", "Running tests in parallel", "Skipping failing tests"], correct: 0 },
    { q: "What does code coverage measure?", options: ["Percentage of code executed by tests", "Lines of code per file", "Number of bugs found", "Test execution speed"], correct: 0 },
  ],
};
