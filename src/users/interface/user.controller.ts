import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { User } from '../domain/user.entity';
import { AccessTokenGuard } from '../../auth/infrastructure/access-token.guard';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<{ message: string }> {
    await this.userService.create(createUserDto);
    return { message: '회원가입이 완료되었습니다.' };
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async getProfile(@Req() req: Request): Promise<User> {
    const user = req.user as { userId: string };
    const userId = user.userId;
    return this.userService.findById(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Put('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = req.user as { userId: string };
    const userId = user.userId;
    return this.userService.update(userId, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('withdraw')
  async withdraw(@Req() req: Request): Promise<{ message: string }> {
    const user = req.user as { userId: string };
    const userId = user.userId;
    await this.userService.remove(userId);
    return { message: '회원탈퇴가 완료되었습니다.' };
  }
}
