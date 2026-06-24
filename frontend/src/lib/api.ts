const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface AuthResponse {
  message: string;
  user: { id: string; email: string; name: string | null };
  token: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    const rawMessage = error.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...getAuthHeaders(), ...init?.headers },
  });
  return handleResponse<T>(res);
}

export const api = {
  register(email: string, password: string, name?: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile() {
    return request<{
      id: string;
      email: string;
      name: string | null;
      streakDays: number;
      longestStreak: number;
      createdAt: string;
      profile: Record<string, unknown> | null;
      plan: 'free' | 'pro' | 'premium';
    }>('/auth/profile');
  },

  getMe() {
    return request<Record<string, unknown>>('/users/me');
  },

  updateProfile(data: Record<string, unknown>) {
    return request('/users/me/profile', { method: 'PATCH', body: JSON.stringify(data) });
  },

  getGoals() {
    return request<Record<string, unknown>[]>('/goals');
  },

  createGoal(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/goals', { method: 'POST', body: JSON.stringify(data) });
  },

  updateGoal(id: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  deleteGoal(id: string) {
    return request(`/goals/${id}`, { method: 'DELETE' });
  },

  toggleMilestone(goalId: string, milestoneId: string, completed?: boolean) {
    return request<Record<string, unknown>>(`/goals/${goalId}/milestones/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ milestoneId, completed }),
    });
  },

  getSkills() {
    return request<Record<string, unknown>[]>('/users/me/skills');
  },

  upsertSkill(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/users/me/skills', { method: 'POST', body: JSON.stringify(data) });
  },

  updateSkill(id: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/users/me/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  getLearningPlans() {
    return request<Record<string, unknown>[]>('/learning-plans');
  },

  createLearningPlan(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/learning-plans', { method: 'POST', body: JSON.stringify(data) });
  },

  toggleLearningItem(planId: string, itemId: string, completed?: boolean) {
    return request<Record<string, unknown>>(`/learning-plans/${planId}/items/${itemId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  getPortfolio() {
    return request<Record<string, unknown>[]>('/portfolio');
  },

  createPortfolioProject(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/portfolio', { method: 'POST', body: JSON.stringify(data) });
  },

  updatePortfolioProject(id: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/portfolio/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  deletePortfolioProject(id: string) {
    return request(`/portfolio/${id}`, { method: 'DELETE' });
  },

  getApplications() {
    return request<Record<string, unknown>[]>('/jobs/applications');
  },

  getJobPostings() {
    return request<Record<string, unknown>[]>('/jobs/postings');
  },

  createJobPosting(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/jobs/postings', { method: 'POST', body: JSON.stringify(data) });
  },

  createApplication(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/jobs/applications', { method: 'POST', body: JSON.stringify(data) });
  },

  updateApplicationStatus(id: string, status: string) {
    return request<Record<string, unknown>>(`/jobs/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  createInterview(applicationId: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/jobs/applications/${applicationId}/interviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getNegotiations() {
    return request<Record<string, unknown>[]>('/negotiations');
  },

  createNegotiation(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/negotiations', { method: 'POST', body: JSON.stringify(data) });
  },

  updateNegotiation(id: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/negotiations/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  getResumes() {
    return request<Record<string, unknown>[]>('/resumes');
  },

  createResume(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/resumes', { method: 'POST', body: JSON.stringify(data) });
  },

  updateResume(id: string, data: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/resumes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  deleteResume(id: string) {
    return request(`/resumes/${id}`, { method: 'DELETE' });
  },

  getConversations() {
    return request<Record<string, unknown>[]>('/ai-coach/conversations');
  },

  getConversation(id: string) {
    return request<Record<string, unknown>>(`/ai-coach/conversations/${id}`);
  },

  createConversation(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/ai-coach/conversations', { method: 'POST', body: JSON.stringify(data) });
  },

  sendMessage(conversationId: string, content: string) {
    return request<{ userMessage: Record<string, unknown>; assistantMessage: Record<string, unknown> }>(
      `/ai-coach/conversations/${conversationId}/messages`,
      { method: 'POST', body: JSON.stringify({ content }) },
    );
  },

  getCommunityPosts() {
    return request<Record<string, unknown>[]>('/community/posts');
  },

  createCommunityPost(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/community/posts', { method: 'POST', body: JSON.stringify(data) });
  },

  createCommunityComment(postId: string, body: string) {
    return request<Record<string, unknown>>(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },

  reactToPost(postId: string, type: string) {
    return request<Record<string, unknown>>(`/community/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  getNotifications(unreadOnly = false) {
    return request<Record<string, unknown>[]>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`);
  },

  markNotificationRead(id: string) {
    return request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsRead() {
    return request('/notifications/read-all', { method: 'PATCH' });
  },

  getSubscription() {
    return request<Record<string, unknown> | null>('/subscriptions/me');
  },

  updateSubscription(data: Record<string, unknown>) {
    return request<Record<string, unknown>>('/subscriptions/me', { method: 'PATCH', body: JSON.stringify(data) });
  },

  cancelSubscription() {
    return request<Record<string, unknown>>('/subscriptions/me/cancel', { method: 'POST' });
  },

  getReferenceSkills() {
    return request<Record<string, unknown>[]>('/reference/skills');
  },

  getReferenceAchievements() {
    return request<Record<string, unknown>[]>('/reference/achievements');
  },

  getReferenceBadges() {
    return request<Record<string, unknown>[]>('/reference/badges');
  },

  getDashboardProgress() {
    return request<Record<string, unknown>>('/dashboard/progress');
  },

  getDashboardMetrics() {
    return request<Record<string, unknown>>('/dashboard/metrics');
  },

  getJobMatchInsights() {
    return request<Record<string, unknown>[]>('/dashboard/job-match');
  },

  getInterviewReadiness() {
    return request<Record<string, unknown>[]>('/dashboard/interview-readiness');
  },

  getAchievements() {
    return request<Record<string, unknown>[]>('/users/me/achievements');
  },

  getBadges() {
    return request<Record<string, unknown>[]>('/users/me/badges');
  },
};
