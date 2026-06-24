export function calculateStreak(
  lastLoginAt: Date,
  currentStreak: number,
  longestStreak: number,
): { streakDays: number; longestStreak: number } {
  const now = new Date();
  const last = new Date(lastLoginAt);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { streakDays: currentStreak, longestStreak };
  }

  if (diffDays === 1) {
    const streakDays = currentStreak + 1;
    return {
      streakDays,
      longestStreak: Math.max(longestStreak, streakDays),
    };
  }

  return { streakDays: 1, longestStreak: Math.max(longestStreak, 1) };
}
