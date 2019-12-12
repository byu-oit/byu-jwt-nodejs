import {Request, Response, NextFunction} from 'express'
import Cache from './cache'
declare function ByuJWT(options: any): any
declare namespace ByuJWT {
  const BYU_JWT_HEADER_CURRENT: string
  const BYU_JWT_HEADER_ORIGINAL: string
  const WELL_KNOWN_URL: string
  function authenticate(options, cache: Cache, headers): Promise<any>
  function authenticateUAPIMiddleware(req: Request, response: Response, next: NextFunction): any
  function decodeJWT(options, cache: Cache, jwt: string): Promise<any>
  function getOpenIdConfiguration(cache: Cache): Promise<any>
  function getPublicKey(cache: Cache): Promise<any>
  function verifyJWT(options, cache: Cache, jwt: string): Promise<any>
  function AuthenticationError(message: any, error: any): void
  function JsonWebTokenError(message: any, error: any): void
  function NotBeforeError(message: any, date: any): void
  function TokenExpiredError(message: any, expiredAt: any): void
}
export = ByuJWT
