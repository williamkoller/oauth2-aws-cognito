import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthCredentialsDto } from './dtos/auth-credentials.dto'
import { AuthRegisterDto } from './dtos/auth-register.dto'
import axios from 'axios'
import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' })
@Controller()
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

  @Get()
  async getCode(@Query('code') code: string) {
    const client_id = `${process.env.CLIENT_ID}`
    const client_secret = `${process.env.CLIENT_SECRET}`
    const authorization_code = 'authorization_code'
    console.log({
      code,
      client_id,
      client_secret,
    })

    await axios
      .get(
        `https://sso.plurall.net/oauth/token?grant_type=${authorization_code}&code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      )
      .then((response) => {
        console.log('Return ****', response)
        return response
      })
      .then((response) => {
        axios
          .get('https://sso.plurall.net/oauth/userinfo', {
            headers: {
              Authorization: `Bearer ${response.data.access_token}`,
            },
          })
          .then((response) => {
            console.log(JSON.stringify(response.data))
            return response.data
          })
          .catch((error) => console.log('Error first catch: ', error))
      })
      .catch((error) => console.log('Error ****', error))
  }
}
