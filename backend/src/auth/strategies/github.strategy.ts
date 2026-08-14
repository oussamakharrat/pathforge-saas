import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { getBackendUrl } from '../auth-urls';
import type { OAuthProfile } from '../interfaces/oauth-profile.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackURL: `${getBackendUrl()}/api/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): OAuthProfile {
    const primaryEmail = profile.emails?.[0]?.value;

    if (!primaryEmail) {
      throw new Error('GitHub account has no public email. Make one visible in GitHub settings.');
    }

    return {
      provider: 'github',
      providerId: profile.id,
      email: primaryEmail,
      name: profile.displayName || profile.username || primaryEmail.split('@')[0],
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
