import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { passportJwtSecret } from 'jwks-rsa'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { AuthService } from '../auth.service'
import { AuthConfig } from '../config/auth.config'
import { handler } from '../jwt/jwt-token'
import { ClaimVerifyResultType } from '../jwt/types'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private authConfig: AuthConfig) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${authConfig.authority}/.weel-kown/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: authConfig.clientId,
      issuer: authConfig.authority,
      algoritms: ['RS256'],
    })
  }

  public async validate(payload: any, done: (err: Error | null, result: ClaimVerifyResultType) => void) {
    const userInfo = await handler(payload)
    console.log('userInfo', userInfo)
    if (!userInfo) {
      return done(new UnauthorizedException(), null)
    }
    done(null, userInfo)
  }
}
