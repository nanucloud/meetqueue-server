import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/application/user.service';
import { LoginDto, TokensDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokensDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
    
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
    
    const tokens = await this.getTokens(user.UUID, user.email);
    await this.updateRefreshToken(user.UUID, tokens.refreshToken);
    
    return tokens;
  }

  async logout(userId: string): Promise<boolean> {
    await this.userService.updateRefreshToken(userId, null);
    return true;
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensDto> {
    const user = await this.userService.findById(userId);
    
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('액세스가 거부되었습니다.');
    }
    
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    
    if (!isRefreshTokenValid) {
      throw new ForbiddenException('액세스가 거부되었습니다.');
    }
    
    const tokens = await this.getTokens(user.UUID, user.email);
    await this.updateRefreshToken(user.UUID, tokens.refreshToken);
    
    return tokens;
  }

  private async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    if (refreshToken) {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.userService.updateRefreshToken(userId, hashedRefreshToken);
    } else {
      await this.userService.updateRefreshToken(userId, null);
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
          secret: this.configService.get('JWT_ACCESS_SECRET') || 'access-secret-key',
          expiresIn: '7d', // 7일
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret-key',
          expiresIn: '365d', // 1년
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
