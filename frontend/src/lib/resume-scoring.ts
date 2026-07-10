const TECH_KEYWORDS = [
  'typescript', 'javascript', 'react', 'node', 'python', 'java', 'aws', 'docker',
  'kubernetes', 'graphql', 'postgresql', 'sql', 'api', 'rest', 'ci/cd', 'agile',
  'leadership', 'mentoring', 'system design', 'microservices', 'testing', 'git',
];

export type ResumeScoreResult = {
  atsScore: number;
  detectedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  breakdown: { impact: number; clarity: number; keywords: number; ats: number };
};

export function scoreResumeContent(
  sections: { title: string; content: string }[],
  userSkillNames: string[] = [],
): ResumeScoreResult {
  const text = sections.map((s) => `${s.title} ${s.content}`).join(' ').toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const detected = TECH_KEYWORDS.filter((k) => text.includes(k));
  const skillKeywords = userSkillNames.map((s) => s.toLowerCase());
  const skillMatches = skillKeywords.filter((s) => text.includes(s));
  const missingFromSkills = skillKeywords.filter((s) => s.length > 2 && !text.includes(s)).slice(0, 5);
  const missingKeywords = [
    ...missingFromSkills,
    ...TECH_KEYWORDS.filter((k) => !text.includes(k)).slice(0, Math.max(0, 5 - missingFromSkills.length)),
  ].slice(0, 5);

  const hasSummary = sections.some((s) => /summary|profile|about/i.test(s.title) && s.content.trim().length > 40);
  const hasExperience = sections.some((s) => /experience|work|employment/i.test(s.title) && s.content.trim().length > 80);
  const hasSkills = sections.some((s) => /skills|technologies/i.test(s.title) && s.content.trim().length > 20);

  const clarity = Math.min(100, 40 + (hasSummary ? 20 : 0) + (hasExperience ? 25 : 0) + (hasSkills ? 15 : 0));
  const keywords = Math.min(100, Math.round((detected.length / 8) * 60 + skillMatches.length * 5));
  const impact = Math.min(100, Math.round(Math.min(wordCount / 4, 50) + (text.match(/\d+%|\$\d|increased|reduced|improved/gi)?.length ?? 0) * 8));
  const ats = Math.min(100, Math.round((detected.length + skillMatches.length) * 6 + (hasSummary ? 10 : 0) + (hasExperience ? 15 : 0)));
  const atsScore = Math.round((clarity + keywords + impact + ats) / 4);

  const suggestions: string[] = [];
  if (!hasSummary) suggestions.push('Add a professional summary section');
  if (!hasExperience) suggestions.push('Expand your work experience with measurable outcomes');
  if (!hasSkills) suggestions.push('Add a dedicated skills section');
  if (missingKeywords.length) suggestions.push(`Include keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
  if (wordCount < 150) suggestions.push('Resume content is thin — aim for 200+ words');

  return {
    atsScore,
    detectedKeywords: [...new Set([...detected, ...skillMatches])],
    missingKeywords,
    suggestions: suggestions.slice(0, 4),
    breakdown: { impact, clarity, keywords, ats },
  };
}

export function parseTextToSections(raw: string): { type: string; title: string; content: string }[] {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [{ type: 'summary', title: 'Summary', content: '' }];

  const sections: { type: string; title: string; content: string }[] = [];
  let current = { type: 'summary', title: 'Summary', content: '' as string };

  const heading = (line: string) => {
    const upper = line.toUpperCase();
    if (/^(EXPERIENCE|WORK|EMPLOYMENT)/.test(upper)) return { type: 'experience', title: 'Experience' };
    if (/^(EDUCATION|ACADEMIC)/.test(upper)) return { type: 'education', title: 'Education' };
    if (/^(SKILLS|TECHNOLOGIES|TECHNICAL)/.test(upper)) return { type: 'skills', title: 'Skills' };
    if (/^(PROJECTS|PORTFOLIO)/.test(upper)) return { type: 'projects', title: 'Projects' };
    if (/^(SUMMARY|PROFILE|ABOUT)/.test(upper)) return { type: 'summary', title: 'Summary' };
    if (line.length < 50 && /^[A-Z][A-Za-z\s/&]+$/.test(line)) return { type: 'custom', title: line };
    return null;
  };

  for (const line of lines) {
    const h = heading(line);
    if (h) {
      if (current.content.trim()) sections.push({ ...current });
      current = { ...h, content: '' };
    } else {
      current.content += (current.content ? '\n' : '') + line;
    }
  }
  if (current.content.trim() || sections.length === 0) sections.push(current);
  return sections.length ? sections : [{ type: 'summary', title: 'Imported Content', content: raw }];
}
