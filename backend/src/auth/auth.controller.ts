import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  GithubOAuthGuard,
  GithubOAuthInitGuard,
  GoogleOAuthGuard,
  GoogleOAuthInitGuard,
} from './guards/oauth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './interfaces/auth-user.interface';
import type { OAuthProfile } from './interfaces/oauth-profile.interface';
import { getFrontendUrl, isGithubOAuthEnabled, isGoogleOAuthEnabled } from './auth-urls';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: AuthUser, @Body() dto: LogoutDto) {
    return this.authService.logout(user.id, dto.refreshToken, dto.allDevices);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-verification')
  resendVerification(@CurrentUser() user: AuthUser) {
    return this.authService.resendVerification(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id);
  }

  @Public()
  @Get('oauth/providers')
  getOAuthProviders() {
    return {
      google: isGoogleOAuthEnabled(),
      github: isGithubOAuthEnabled(),
    };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthInitGuard, AuthGuard('google'))
  googleAuth() {
    /* Passport redirects to Google */
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(
    @Req() req: { user: OAuthProfile },
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback(req.user, res);
  }

  @Public()
  @Get('github')
  @UseGuards(GithubOAuthInitGuard, AuthGuard('github'))
  githubAuth() {
    /* Passport redirects to GitHub */
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GithubOAuthGuard)
  async githubAuthCallback(
    @Req() req: { user: OAuthProfile },
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback(req.user, res);
  }

  private async handleOAuthCallback(profile: OAuthProfile, res: Response) {
    try {
      const result = await this.authService.loginWithOAuth(profile);
      const params = new URLSearchParams({
        token: result.token,
        refreshToken: result.refreshToken,
      });
      if (result.isNewUser) {
        params.set('onboarding', '1');
      }
      res.redirect(`${getFrontendUrl()}/auth/callback?${params.toString()}`);
    } catch {
      res.redirect(`${getFrontendUrl()}/login?error=oauth_failed`);
    }
  }
}
