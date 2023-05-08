import { TokenError, type TokenValidationErrorCode } from 'fast-jwt'

export const BYU_JWT_ERROR_CODES = {
  ...TokenError.codes,
  missingExpectedJwt: 'BYU_JWT_MISSING_EXPECTED_JWT',
  invalidApiContext: 'BYU_JWT_INVALID_API_CONTEXT',
  invalidAudience: 'BYU_JWT_INVALID_AUD'
} as const

export type ByuJwtErrorCodes = TokenValidationErrorCode
| 'BYU_JWT_MISSING_EXPECTED_JWT'
| 'BYU_JWT_INVALID_API_CONTEXT'
| 'BYU_JWT_INVALID_AUD'

export class ByuJwtError extends TokenError {
  static codes = BYU_JWT_ERROR_CODES

  // @ts-expect-error Overwriting the TokenValidationErrorCode type
  public code: ByuJwtErrorCodes
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (code: ByuJwtErrorCodes, message: string, additional?: Record<string, unknown>) {
    // @ts-expect-error TokenError improperly defines the types for its implementation
    super(code, message, additional)
  }

  static wrap (error: TokenError): ByuJwtError {
    const { code, message, ...additional } = error
    return new ByuJwtError(code, message, additional)
  }
}
