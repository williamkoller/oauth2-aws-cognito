import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js'
import { AuthConfig } from './auth.config'

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool
  constructor(@Inject('AuthConfig') private readonly authConfig: AuthConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.authConfig.userPoolId,
      ClientId: this.authConfig.clientId,
    })
  }

  registerUser(registerRequest: { name: string; email: string; password: string }) {
    const { name, email, password } = registerRequest

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

  authenticateUser(user: { name: string; password: string }) {
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
