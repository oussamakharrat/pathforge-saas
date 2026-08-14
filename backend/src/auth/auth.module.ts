import { Module, type Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import {
  GithubOAuthGuard,
  GithubOAuthInitGuard,
  GoogleOAuthGuard,
  GoogleOAuthInitGuard,
} from './guards/oauth.guard';
import { isGithubOAuthEnabled, isGoogleOAuthEnabled } from './auth-urls';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.');
}

const oauthProviders: Provider[] = [];
if (isGoogleOAuthEnabled()) {
  oauthProviders.push(GoogleStrategy);
}
if (isGithubOAuthEnabled()) {
  oauthProviders.push(GithubStrategy);
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleOAuthGuard,
    GoogleOAuthInitGuard,
    GithubOAuthGuard,
    GithubOAuthInitGuard,
    ...oauthProviders,
  ],
  exports: [AuthService],
})
export class AuthModule {}
