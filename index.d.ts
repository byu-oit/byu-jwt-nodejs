import {NextFunction, Request, Response} from 'express'

// Cache Implementation
interface Cache {
  clearCache: () => void;
  getCache: () => any;
  setCache: (value: any) => void;
  getTTL: () => number;
  setTTL: (ttl: number) => void;
}

interface Options {
  cacheTTL?: number
  development?: boolean
}

interface JwtClaim {
  byuId: string
  claimSource: string
  netId: string
  personId: string
  preferredFirstName: string
  prefix: string
  restOfName: string
  sortName: string
  suffix: string
  surname: string
  surnamePosition: string
}

type Client = JwtClaim & { subscriberNetId: string }

interface Wso2Claim {
  apiContext: string
  application: {
    id: string
    name: string
    tier: string
  }
  clientId: string
  endUser: string
  endUserTenantId: string
  keyType: string
  subscriber: string
  tier: string
  userType: string
  version: string
}

interface DecodedByuJwtBase {
  client: Client;
  raw: any;
  wso2: Wso2Claim
}

type DecodedByuJwtResourceOwner = DecodedByuJwtBase & { resourceOwner: JwtClaim; claims: JwtClaim }

type DecodedByuJwtClient = DecodedByuJwtBase & { claims: Client }

type DecodedByuJwt = DecodedByuJwtClient | DecodedByuJwtResourceOwner

interface ByuOpenIdConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint: string;
  jwks_uri: string;
  response_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
}

// ByuJWT Implementation
declare function ByuJWT(options?: Options): any

declare namespace ByuJWT {
  const BYU_JWT_HEADER_CURRENT: string
  const BYU_JWT_HEADER_ORIGINAL: string
  const WELL_KNOWN_URL: string

  function authenticate(options: any, cache: Cache, headers: any): Promise<any> // TODO

  function authenticateUAPIMiddleware(req: Request, response: Response, next: NextFunction): Promise<void>

  function decodeJWT(options: any, cache: Cache, jwt: string): Promise<DecodedByuJwt>

  function getOpenIdConfiguration(cache: Cache): Promise<ByuOpenIdConfig>

  function getPublicKey(cache: Cache): Promise<string>

  function verifyJWT(options: any, cache: Cache, jwt: string): Promise<boolean>

  function AuthenticationError(message: string, error?: Error): void

  function JsonWebTokenError(message: string, error?: Error): void

  function NotBeforeError(message: string, date: Date): void

  function TokenExpiredError(message: string, expiredAt: Date): void
}
export default ByuJWT
