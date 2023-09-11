import { ByuJwt, type JwtPayload, type CreateByuJwtOptions, type TransformedJwtPayload } from '@byu-oit/jwt'
import { TokenError } from 'fast-jwt'
import { type IncomingHttpHeaders } from 'http'
import { BYU_JWT_ERROR_CODES, ByuJwtError } from './ByuJwtError.js'

export interface ByuJwtAuthenticatorOptions {
  byuJwtOptions?: CreateByuJwtOptions
  development?: boolean
  basePath?: string
}

export class ByuJwtAuthenticator {
  static HEADER_CURRENT = 'x-jwt-assertion'
  static HEADER_ORIGINAL = 'x-jwt-assertion-original'

  private readonly ByuJwt: typeof ByuJwt
  private readonly development: boolean

  constructor ({ development, basePath, byuJwtOptions = {} }: ByuJwtAuthenticatorOptions = {}) {
    this.development = development ?? false

    /** Extra validation step if basePath is provided */
    if (basePath != null) {
      if (byuJwtOptions.additionalValidations == null) {
        byuJwtOptions.additionalValidations = []
      }
      byuJwtOptions.additionalValidations.push(apiContextValidationFunction(basePath))
    }
    this.ByuJwt = ByuJwt.create(byuJwtOptions)
  }

  async authenticate (headers: IncomingHttpHeaders): Promise<JwtPayload> {
    /** Verify any known JWT headers */
    const JwtHeaders = [
      ByuJwtAuthenticator.HEADER_ORIGINAL,
      ByuJwtAuthenticator.HEADER_CURRENT
    ]
    const [original, current] = await Promise.all(JwtHeaders.map(async header => {
      const jwt = headers[header]
      if (typeof jwt !== 'string') return undefined
      try {
        const { payload } = this.development ? this.ByuJwt.decode(jwt) : await this.ByuJwt.verify(jwt)
        return payload
      } catch (e) {
        if (e instanceof TokenError) {
          throw ByuJwtError.wrap(e)
        }
        throw e
      }
    }))

    if (current == null) {
      /** Throw when the current JWT is missing */
      throw new ByuJwtError(BYU_JWT_ERROR_CODES.missingExpectedJwt, 'Missing expected JWT')
    }

    /** Prioritize original caller over current */
    return original ?? current
  }
}

/**
 * Returns a function that provides additional validation to the JWT
 *
 * @param basePath - will validate that the audience starts with the provided basePath in production.
 * @returns - A function that validates the API context and audience.
 */
export function apiContextValidationFunction (basePath: string): (jwt: { payload: TransformedJwtPayload }) => void {
  return (jwt) => {
    const context = jwt.payload.apiContext
    if (!context.startsWith(basePath)) {
      throw new ByuJwtError(BYU_JWT_ERROR_CODES.invalidApiContext, 'Invalid API context in JWT')
    }
    /** Check that the JWT is meant for the audience */
    if (jwt.payload.aud != null) {
      const audiences = typeof jwt.payload.aud === 'string' ? [jwt.payload.aud] : jwt.payload.aud
      const hasAValidAudience = !audiences.some((audience) => audience.startsWith(basePath))
      if (hasAValidAudience) {
        throw new ByuJwtError(BYU_JWT_ERROR_CODES.invalidAudience, 'Invalid aud in JWT')
      }
    }
  }
}
