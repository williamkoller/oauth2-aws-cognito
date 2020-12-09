import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { AuthService } from '../auth.service'
import { handler } from '../jwt/jwt-token'
import { ClaimVerifyResultType } from '../jwt/types'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name)
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authService.secretKey,
    })
  }

  public async validate(payload: any, done: (err: Error | null, result: ClaimVerifyResultType) => void) {
    const userInfo = await handler(payload)
    this.logger.log(`userInfo: ${userInfo}`)
    if (!userInfo) {
      return done(new UnauthorizedException(), null)
    }
    done(null, userInfo)
  }
}
