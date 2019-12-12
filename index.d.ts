import {Request, Response, NextFunction} from 'express'

// Cache Implementation
interface Cache {
  clearCache: () => void;
  getCache: () => any;
  setCache: (value: any) => void;
  getTTL: () => number;
  setTTL: (ttl: number) => void;
}

// ByuJWT Implementation
declare function ByuJWT(options?: any): any
declare namespace ByuJWT {
  const BYU_JWT_HEADER_CURRENT: string
  const BYU_JWT_HEADER_ORIGINAL: string
  const WELL_KNOWN_URL: string
  function authenticate(options: any, cache: Cache, headers: any): Promise<any>
  function authenticateUAPIMiddleware(req: Request, response: Response, next: NextFunction): any
  function decodeJWT(options: any, cache: Cache, jwt: string): Promise<any>
  function getOpenIdConfiguration(cache: Cache): Promise<any>
  function getPublicKey(cache: Cache): Promise<any>
  function verifyJWT(options: any, cache: Cache, jwt: string): Promise<any>
  function AuthenticationError(message: any, error: any): void
  function JsonWebTokenError(message: any, error: any): void
  function NotBeforeError(message: any, date: any): void
  function TokenExpiredError(message: any, expiredAt: any): void
}
export default ByuJWT
