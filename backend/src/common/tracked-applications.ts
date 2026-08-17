/** Job sources excluded from the job tracker and career application metrics. */
export const HIDDEN_JOB_SOURCES = ['practice', 'negotiation_draft'] as const;

export const trackedApplicationWhere = (userId: string) => ({
  userId,
  job: { source: { notIn: [...HIDDEN_JOB_SOURCES] } },
});

export const trackedInterviewWhere = (userId: string) => ({
  application: trackedApplicationWhere(userId),
});

export const trackedOfferWhere = (userId: string) => ({
  application: trackedApplicationWhere(userId),
});
