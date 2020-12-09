import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthCredentialsDto } from './dtos/auth-credentials.dto'
import { AuthRegisterDto } from './dtos/auth-register.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() authRegisterRequest: AuthRegisterDto) {
    try {
      if (
        authRegisterRequest.password.length < 8 ||
        !/[a-z]/.test(authRegisterRequest.password) ||
        !/[A-Z]/.test(authRegisterRequest.password) ||
        !/[0-9]/.test(authRegisterRequest.password)
      ) {
        throw new BadRequestException('Password requirements not met.')
      }
      return this.authService.registerUser(authRegisterRequest)
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  @Post('login')
  async login(@Body() authenticateRequest: AuthCredentialsDto) {
    try {
      return await this.authService.authenticateUser(authenticateRequest)
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }
}
