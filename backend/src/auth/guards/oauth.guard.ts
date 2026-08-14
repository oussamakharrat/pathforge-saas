import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import {
  getFrontendUrl,
  isGithubOAuthEnabled,
  isGoogleOAuthEnabled,
} from '../auth-urls';

function redirectToLogin(context: ExecutionContext, errorCode: string): false {
  const res = context.switchToHttp().getResponse<Response>();
  res.redirect(`${getFrontendUrl()}/login?error=${errorCode}`);
  return false;
}

@Injectable()
export class GoogleOAuthInitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!isGoogleOAuthEnabled()) {
      return redirectToLogin(context, 'oauth_not_configured');
    }
    return true;
  }
}

@Injectable()
export class GithubOAuthInitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!isGithubOAuthEnabled()) {
      return redirectToLogin(context, 'oauth_not_configured');
    }
    return true;
  }
}

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      redirectToLogin(context, 'oauth_failed');
      return false;
    }
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw err ?? new Error('Google OAuth failed');
    }
    return user;
  }
}

@Injectable()
export class GithubOAuthGuard extends AuthGuard('github') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      redirectToLogin(context, 'oauth_failed');
      return false;
    }
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw err ?? new Error('GitHub OAuth failed');
    }
    return user;
  }
}
