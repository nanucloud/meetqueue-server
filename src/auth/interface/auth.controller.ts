import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { LoginDto, TokensDto } from '../application/dto/auth.dto';
import { AccessTokenGuard } from '../infrastructure/access-token.guard';
import { RefreshTokenGuard } from '../infrastructure/refresh-token.guard';
import { Request } from 'express';
import { UserService } from '../../users/application/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TokensDto & { userId: string }> {
    const tokens = await this.authService.login(loginDto);
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return { ...tokens, userId: user.UUID };
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: Request): Promise<{ loggedOut: boolean }> {
    const user = req.user as { userId: string };
    const userId = user.userId;
    const loggedOut = await this.authService.logout(userId);
    return { loggedOut };
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: Request): Promise<TokensDto> {
    const user = req.user as { userId: string; refreshToken: string };
    const userId = user.userId;
    const refreshToken = user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
