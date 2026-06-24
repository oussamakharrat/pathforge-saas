// ─────────────────────────────────────────────
// v2 DOMAIN ENTITIES — Aggregate Roots & Entities
// ─────────────────────────────────────────────

export type { User } from "./user";
export { createUser } from "./user";

export type { CareerProfile } from "./career-profile";
export { createCareerProfile } from "./career-profile";

export type { Subscription } from "./subscription";
export { createSubscription } from "./subscription";

export type { Milestone, Goal } from "./goal";
export { createGoal, recalculateGoalProgress, addMilestone, toggleMilestone } from "./goal";

export type { Skill } from "./skill";
export { createSkill, getSkillLevelLabel, improveSkill } from "./skill";

export type { LearningItem, LearningPlan } from "./learning-plan";
export { createLearningPlan, recalculatePlanProgress, toggleLearningItem } from "./learning-plan";

export type { Job } from "./job";
export { createJob } from "./job";

export type { Application } from "./application";
export { createApplication, APPLICATION_STATUS_DISPLAY, APPLICATION_PIPELINE_ORDER, getStatusTransitionEvent } from "./application";

export type { InterviewAnswer, Interview } from "./interview";
export { createInterview, calculateInterviewScore, generateInterviewFeedback } from "./interview";

export type { Offer } from "./offer";
export { createOffer } from "./offer";

export type { Negotiation } from "./negotiation";
export { createNegotiation, calculateSalaryImprovement, calculateSalaryImprovementPercent } from "./negotiation";

export type { PortfolioProject } from "./portfolio-project";
export { createPortfolioProject } from "./portfolio-project";

export type { ResumeSection, Resume } from "./resume";
export { createResume } from "./resume";

export type { Achievement } from "./achievement";
export { createAchievement } from "./achievement";

export type { Badge } from "./badge";
export { createBadge } from "./badge";

export type { Notification } from "./notification";
export { createNotification, markAsRead, markAsUnread } from "./notification";

export type { AIConversation } from "./ai-conversation";
export { createAIConversation, updateConversationContext } from "./ai-conversation";

export type { AIMessage } from "./ai-message";
export { createAIMessage } from "./ai-message";

export type { CommunityPost } from "./community-post";
export { createCommunityPost, pinPost, unpinPost, archivePost } from "./community-post";

export type { CommunityComment } from "./community-comment";
export { createCommunityComment } from "./community-comment";

export type { CommunityReaction } from "./community-reaction";
export { createCommunityReaction } from "./community-reaction";
