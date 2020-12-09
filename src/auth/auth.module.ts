import { Module } from '@nestjs/common'
import { AuthConfig } from './config/auth.config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from '../auth/strategy/jwt.strategy'

@Module({
  providers: [AuthService, AuthConfig, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
