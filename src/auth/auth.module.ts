import { Module } from '@nestjs/common'
import { AuthConfig } from './auth.config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
  providers: [AuthService, AuthConfig],
  controllers: [AuthController],
})
export class AuthModule {}
