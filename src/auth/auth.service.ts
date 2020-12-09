import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js'
import { AuthConfig } from './config/auth.config'
import { AuthCredentialsDto } from './dtos/auth-credentials.dto'
import { AuthRegisterDto } from './dtos/auth-register.dto'

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool
  constructor(@Inject('AuthConfig') private readonly authConfig: AuthConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.authConfig.userPoolId,
      ClientId: this.authConfig.clientId,
    })
  }

  get secretKey() {
    return this.authConfig.secretKey
  }

  registerUser(authRegisterRequest: AuthRegisterDto) {
    const { name, email, password } = authRegisterRequest

    return new Promise((resolve, reject) => {
      return this.userPool.signUp(
        name,
        password,
        [new CognitoUserAttribute({ Name: 'email', Value: email })],
        null,
        (err, result) => {
          if (!result) {
            reject(err)
          } else {
            resolve(result.user)
          }
        },
      )
    })
  }

  authenticateUser(user: AuthCredentialsDto) {
    try {
      const { name, password } = user

      const authenticateDetails = new AuthenticationDetails({
        Username: name,
        Password: password,
      })
      const userData = {
        Username: name,
        Pool: this.userPool,
      }

      const newUser = new CognitoUser(userData)
      return new Promise((resolve, reject) => {
        return newUser.authenticateUser(authenticateDetails, {
          onSuccess: (result) => {
            resolve(result)
          },
          onFailure: (err) => {
            reject(err)
          },
        })
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
