/** Declaration file generated by dts-gen */
import {Request, Response, NextFunction} from 'express'
import Cache from './cache'

export = byu_jwt

declare function byu_jwt(options: any): any

declare namespace byu_jwt {
  const BYU_JWT_HEADER_CURRENT: string

  const BYU_JWT_HEADER_ORIGINAL: string

  const WELL_KNOWN_URL: string

  function authenticate(options, cache: Cache, headers): Promise<>

  function authenticateUAPIMiddleware(req: Request, response: Response, next: NextFunction): any

  function decodeJWT(options, cache: Cache, jwt: string): Promise<>

  function getOpenIdConfiguration(cache: Cache): Promise<>

  function getPublicKey(cache: Cache): Promise<>

  function verifyJWT(options, cache: Cache, jwt: string): Promise<>

  function AuthenticationError(message: any, error: any): void

  function JsonWebTokenError(message: any, error: any): void

  function NotBeforeError(message: any, date: any): void

  function TokenExpiredError(message: any, expiredAt: any): void
}

