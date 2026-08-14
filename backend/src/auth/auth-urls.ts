export function getBackendUrl(): string {
  return (process.env.BACKEND_URL || `http://localhost:${process.env.PORT ?? 5000}`).replace(
    /\/$/,
    '',
  );
}

export function getFrontendUrl(): string {
  return (process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
}

export function isGoogleOAuthEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function isGithubOAuthEnabled(): boolean {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}
