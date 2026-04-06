export const BYU_JWT_ERROR_CODES = {
  missingExpectedJwt: 'BYU_JWT_MISSING_EXPECTED_JWT',
  invalidApiContext: 'BYU_JWT_INVALID_API_CONTEXT',
  invalidAudience: 'BYU_JWT_INVALID_AUD'
} as const

export type ByuJwtErrorCodes = 'BYU_JWT_MISSING_EXPECTED_JWT'
| 'BYU_JWT_INVALID_API_CONTEXT'
| 'BYU_JWT_INVALID_AUD'

export class ByuJwtError extends Error {
  public code: ByuJwtErrorCodes
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (code: ByuJwtErrorCodes, message: string, additional?: Record<string, unknown>) {
    super(message, additional)
    this.code = code
  }
}
