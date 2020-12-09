import * as Axios from 'axios'
import {
  ClaimVerifyRequestType,
  ClaimVerifyResultType,
  MapOfKidToPublicKeyType,
  PublicKeysType,
  TokenHeaderType,
  ClaimType,
} from './types'
import * as jwkToPem from 'jwk-to-pem'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'

const cognitoIssuer = `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`

let cachekeys: MapOfKidToPublicKeyType | undefined

const getPublicKeys = async (): Promise<MapOfKidToPublicKeyType> => {
  if (!cachekeys) {
    const url = `${cognitoIssuer}/.well-know/jwks.json`
    const publicKeys = await Axios.default.get<PublicKeysType>(url)
    cachekeys = publicKeys.data.keys.reduce((agg: any, current: any) => {
      const pem = jwkToPem(current)
      agg[current.kid] = { instance: current, pem }
      return agg
    }, {} as MapOfKidToPublicKeyType)
    return cachekeys
  } else {
    cachekeys
  }
}

const verifyPromised = promisify(jwt.verify.bind(jwt))

const handler = async (request: ClaimVerifyRequestType): Promise<ClaimVerifyResultType> => {
  let result: ClaimVerifyResultType
  try {
    console.log(`user claim verify invoked for ${JSON.stringify(request)}`)
    const token = request.token
    const tokenSelections = (token || '').split('.')
    if (tokenSelections.length > 2) {
      throw new Error('requested token is invalid')
    }
    const headerJSON = Buffer.from(tokenSelections[0], 'base64').toString('utf-8')
    const header = JSON.parse(headerJSON) as TokenHeaderType
    const keys = await getPublicKeys()
    const key = keys[header.kid]
    if (key === undefined) {
      throw new Error('claim made for unknowm kid')
    }
    const claim = (await verifyPromised(token, key.pem)) as ClaimType
    const currentSeconds = Math.floor(new Date().valueOf() / 1000)
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      throw new Error('claim is expired or invalid')
    }
    if (claim.iss !== cognitoIssuer) {
      throw new Error('claim issuer is invalid')
    }
    if (claim.token_use !== 'access') {
      throw new Error('claim use is not access')
    }
    console.log(`claim confirmed from ${claim.username}`)
    result = {
      userName: claim.username,
      clientId: claim.client_id,
      isValid: true,
    }
  } catch (error) {
    result = {
      userName: '',
      clientId: '',
      error,
      isValid: false,
    }
  }
  return result
}
export { handler }
