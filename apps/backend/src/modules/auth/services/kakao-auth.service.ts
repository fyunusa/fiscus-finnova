import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { User } from '../../users/entities/user.entity';
import { UserType, UserStatus, UserRole } from '../../users/enums/user.enum';

export interface KakaoProfile {
  id: number;
  kakao_account?: {
    email?: string;
    email_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    profile_needs_agreement?: boolean;
  };
  properties?: {
    nickname?: string;
    profile_image?: string;
  };
}

export interface KakaoAuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    userType: string;
    role: string;
    isNewUser: boolean;
  };
}

@Injectable()
export class KakaoAuthService {
  private readonly logger = new Logger(KakaoAuthService.name);
  private readonly tokenUrl = 'https://kauth.kakao.com/oauth/token';
  private readonly profileUrl = 'https://kapi.kakao.com/v2/user/me';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Exchange authorization code for Kakao access token
   */
  async exchangeCode(code: string, redirectUri?: string): Promise<string> {
    const restApiKey = this.configService.get<string>('KAKAO_REST_API_KEY');
    const defaultRedirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

    if (!restApiKey) {
      throw new BadRequestException('Kakao REST API key not configured');
    }

    const effectiveRedirectUri = redirectUri || defaultRedirectUri;

    if (!effectiveRedirectUri) {
      throw new BadRequestException('Kakao redirect URI not configured');
    }

    try {
      this.logger.log('🟡 Exchanging Kakao authorization code for token');

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: restApiKey,
        redirect_uri: effectiveRedirectUri,
        code,
      });

      const response = await firstValueFrom(
        this.httpService.post(this.tokenUrl, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      const accessToken: string = response.data.access_token;
      if (!accessToken) {
        throw new BadRequestException('Failed to get Kakao access token');
      }

      this.logger.log('✅ Kakao access token obtained successfully');
      return accessToken;
    } catch (error) {
      this.logger.error('❌ Kakao token exchange failed:', error);
      const message = (error as any)?.response?.data?.error_description || 'Failed to exchange Kakao code';
      throw new BadRequestException(message);
    }
  }

  /**
   * Fetch Kakao user profile using access token
   */
  async getKakaoProfile(kakaoAccessToken: string): Promise<KakaoProfile> {
    try {
      this.logger.log('📋 Fetching Kakao user profile');

      const response = await firstValueFrom(
        this.httpService.get(this.profileUrl, {
          headers: {
            Authorization: `Bearer ${kakaoAccessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }),
      );

      const profile: KakaoProfile = response.data;
      if (!profile?.id) {
        throw new BadRequestException('Invalid Kakao profile response');
      }

      this.logger.log(`✅ Kakao profile fetched for ID: ${profile.id}`);
      return profile;
    } catch (error) {
      this.logger.error('❌ Kakao profile fetch failed:', error);
      throw new BadRequestException('Failed to fetch Kakao user profile');
    }
  }

  /**
   * Find or create a user from Kakao profile, return our JWT tokens
   */
  async loginOrRegister(profile: KakaoProfile): Promise<KakaoAuthResult> {
    const kakaoId = String(profile.id);
    const kakaoAccount = profile.kakao_account;
    const kakaoEmail = kakaoAccount?.email;
    const nickname = kakaoAccount?.profile?.nickname || profile.properties?.nickname;
    const profileImage = kakaoAccount?.profile?.profile_image_url || profile.properties?.profile_image;

    this.logger.log(`🔍 Looking up user with kakaoId: ${kakaoId}`);

    let user = await this.usersRepository.findOne({ where: { kakaoId } });
    let isNewUser = false;

    if (!user) {
      // Try to find by email if Kakao provided one
      if (kakaoEmail) {
        user = await this.usersRepository.findOne({ where: { email: kakaoEmail } });
        if (user) {
          // Link existing email account with Kakao
          this.logger.log(`🔗 Linking existing account (${kakaoEmail}) with Kakao ID`);
          user.kakaoId = kakaoId;
          if (!user.profileImageUrl && profileImage) {
            user.profileImageUrl = profileImage;
          }
          user = await this.usersRepository.save(user);
        }
      }

      if (!user) {
        // Create a new user from Kakao profile
        this.logger.log(`🆕 Creating new user from Kakao profile`);
        isNewUser = true;

        // Generate a placeholder email if Kakao didn't provide one
        const email = kakaoEmail || `kakao_${kakaoId}@kakao.fiscus.app`;

        // Parse nickname into first/last name
        const nameParts = (nickname || '카카오사용자').split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || undefined;

        const newUser = this.usersRepository.create({
          email,
          kakaoId,
          firstName,
          lastName,
          profileImageUrl: profileImage,
          userType: UserType.INDIVIDUAL,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          emailVerified: !!kakaoEmail, // Kakao-provided email is considered verified
          password: undefined, // No password for Kakao-only users
        });

        user = await this.usersRepository.save(newUser);
        this.logger.log(`✅ New Kakao user created: ${user.id}`);
      }
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await this.usersRepository.save(user);
    }

    // Issue our own JWTs
    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        role: user.role,
        isNewUser,
      },
    };
  }

  /**
   * Full flow: code → token → profile → login/register
   */
  async handleCallback(code: string, redirectUri?: string): Promise<KakaoAuthResult> {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const kakaoAccessToken = await this.exchangeCode(code, redirectUri);
      const profile = await this.getKakaoProfile(kakaoAccessToken);
      return await this.loginOrRegister(profile);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('❌ Kakao callback handling failed:', error);
      throw new BadRequestException('Kakao authentication failed');
    }
  }
}
