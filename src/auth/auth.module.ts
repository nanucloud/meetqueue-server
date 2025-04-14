import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './application/auth.service';
import { AuthController } from './interface/auth.controller';
import { UsersModule } from '../users/users.module';
import { AccessTokenStrategy } from './infrastructure/access-token.strategy';
import { RefreshTokenStrategy } from './infrastructure/refresh-token.strategy';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
    UsersModule,
    HttpModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
