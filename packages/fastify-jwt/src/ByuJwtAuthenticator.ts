import { ByuJwt, type JwtPayload } from '@byu-oit/jwt'
import { BYU_JWT_ERROR_CODES, ByuJwtError } from './ByuJwtError.js'
import { type IncomingHttpHeaders } from 'http'

export class ByuJwtAuthenticator extends ByuJwt {
  static HEADER_CURRENT = 'x-jwt-assertion'
  static HEADER_ORIGINAL = 'x-jwt-assertion-original'

  async authenticate (headers: IncomingHttpHeaders): Promise<JwtPayload> {
    /** Verify any known JWT headers */
    const JwtHeaders = [
      ByuJwtAuthenticator.HEADER_ORIGINAL,
      ByuJwtAuthenticator.HEADER_CURRENT
    ]
    const [original, current] = await Promise.all(JwtHeaders.map(async (header) => {
      const jwt = headers[header]
      if (typeof jwt !== 'string') return
      return await this.verify(jwt).then(({ payload }) => payload)
    }))

    if (current == null) {
      /** Throw when the current JWT is missing */
      throw new ByuJwtError(BYU_JWT_ERROR_CODES.missingExpectedJwt, 'Missing expected JWT')
    }

    /** Extra validation step for production */
    if (!this.development && this.basePath != null) {
      const context = current.apiContext
      if (context.startsWith(this.basePath)) {
        throw new ByuJwtError(BYU_JWT_ERROR_CODES.invalidApiContext, 'Invalid API context in JWT')
      }
      /** Check that the JWT is meant for the audience */
      if (current.aud != null) {
        const audiences = typeof current.aud === 'string' ? [current.aud] : current.aud
        const hasAValidAudience = audiences.some(audience => audience.startsWith(this.basePath)) === false
        if (hasAValidAudience) {
          throw new ByuJwtError(BYU_JWT_ERROR_CODES.invalidAudience, 'Invalid aud in JWT')
        }
      }
    }

    /** Prioritize original caller over current */
    return original ?? current
  }
}
