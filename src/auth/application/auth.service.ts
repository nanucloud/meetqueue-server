import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/application/user.service';
import { LoginDto, TokensDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { OAuthTokenResponseDto } from './dto/oAuthTokenResponse.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../../users/application/dto/create-user.dto';
import { OAuthVerifyDto } from './dto/oAuthVerify.dto';

@Injectable()
export class AuthService {
  private readonly authUrl = 'https://auth.nanu.cc/oauth/code';
  private readonly userEmailUrl = 'https://auth.nanu.cc/auth/get/email';
  private readonly userNameUrl = 'https://auth.nanu.cc/auth/get/name';
  private readonly applicationSecret: string;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.applicationSecret = this.configService.get('APPLICATION_SECRET') || 'not_provided';
  }

  async login(loginDto: LoginDto): Promise<TokensDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const tokens = await this.getTokens(user.UUID, user.email);
    await this.updateRefreshToken(user.UUID, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<boolean> {
    await this.userService.updateRefreshToken(userId, null);
    return true;
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokensDto> {
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('액세스가 거부되었습니다.');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('액세스가 거부되었습니다.');
    }

    const tokens = await this.getTokens(user.UUID, user.email);
    await this.updateRefreshToken(user.UUID, tokens.refreshToken);

    return tokens;
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    if (refreshToken) {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.userService.updateRefreshToken(userId, hashedRefreshToken);
    } else {
      await this.userService.updateRefreshToken(userId, null);
    }
  }

  async verifyAndGetToken(code: string): Promise<OAuthTokenResponseDto> {
    const verifyData: OAuthVerifyDto = {
      authCode: code,
      applicationSecret: this.applicationSecret,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.authUrl, verifyData),
      );

      if (response.status !== 200) {
        throw new ForbiddenException()
      }

      const tokenResponse: OAuthTokenResponseDto = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      };

      return tokenResponse;
    } catch (error) {
      if (error.response) {
        throw new ForbiddenException()
      }
      throw new ForbiddenException();
    }
  }

  async oauthLogin(authCode: string): Promise<TokensDto> {
    const oauthTokens = await this.verifyAndGetToken(authCode);
    const email = await this.getUserEmail(oauthTokens.access_token);
    
    let user = await this.userService.findByEmail(email);
    
    if (!user) {
      const username = await this.getUserName(oauthTokens.access_token);
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const createUserDto: CreateUserDto = {
        email,
        username,
        password: hashedPassword,
      };
      
      user = await this.userService.create(createUserDto);
    }
    
    const tokens = await this.getTokens(user.UUID, user.email);
    await this.updateRefreshToken(user.UUID, tokens.refreshToken);
    
    return tokens;
  }
  
  private async getUserEmail(accessToken: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.userEmailUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('이메일 정보를 가져오는 데 실패했습니다.');
    }
  }
  
  private async getUserName(accessToken: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.userNameUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('이름 정보를 가져오는 데 실패했습니다.');
    }
  }

  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      throw new UnauthorizedException('토큰 디코딩에 실패했습니다.');
    }
  }

  private async getTokens(userId: string, email: string): Promise<TokensDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret:
            this.configService.get('JWT_ACCESS_SECRET') || 'access-secret-key',
          expiresIn: '7d',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret:
            this.configService.get('JWT_REFRESH_SECRET') ||
            'refresh-secret-key',
          expiresIn: '365d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}