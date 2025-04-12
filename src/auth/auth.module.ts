import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './application/auth.service';
import { AuthController } from './interface/auth.controller';
import { UsersModule } from '../users/users.module';
import { GroupsModule } from '../groups/groups.module';
import { AccessTokenStrategy } from './infrastructure/access-token.strategy';
import { RefreshTokenStrategy } from './infrastructure/refresh-token.strategy';
import { RolesGuard } from './infrastructure/roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
    UsersModule,
    GroupsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    RolesGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
