import {NextFunction, Request, Response} from 'express'

// Cache Implementation
export interface Cache {
  clearCache: () => void;
  getCache: () => any;
  setCache: (value: any) => void;
  getTTL: () => number;
  setTTL: (ttl: number) => void;
}

export interface Options {
  basePath?: string,
  cacheTTL?: number
  development?: boolean
}

export interface baseClaims {
  byuId: string,
  netId: string,
  personId: string,
  preferredFirstName: string,
  prefix: string,
  restOfName: string,
  sortName: string,
  suffix: string,
  surname: string,
  surnamePosition: string,
}

export type ClientClaims = baseClaims & {
  claimSource: string,
  subscriberNetId: string
}

export type ResourceOwnerClaims = baseClaims

export interface RawJwtClaims {
  iss: string,
  exp: number
}

export interface RawWso2Claims {
  'http://wso2.org/claims/subscriber': string,
  'http://wso2.org/claims/applicationid': string,
  'http://wso2.org/claims/applicationname': string,
  'http://wso2.org/claims/applicationtier': string,
  'http://wso2.org/claims/apicontext': string,
  'http://wso2.org/claims/version': string,
  'http://wso2.org/claims/tier': string,
  'http://wso2.org/claims/keytype': 'PRODUCTION' | 'SANDBOX',
  'http://wso2.org/claims/usertype': 'APPLICATION_USER' | 'APPLICATION',
  'http://wso2.org/claims/enduser': string,
  'http://wso2.org/claims/enduserTennantId': string,
  'http://wso2.org/claims/client_id': string
}

export interface RawByuClientClaims {
  'http://byu.edu/claims/client_subscriber_net_id': string,
  'http://byu.edu/claims/client_claim_source': 'CLIENT_SUBSCRIBER' | 'CLIENT_ID',
  'http://byu.edu/claims/client_person_id': string,
  'http://byu.edu/claims/client_byu_id': string,
  'http://byu.edu/claims/client_net_id': string,
  'http://byu.edu/claims/client_surname': string,
  'http://byu.edu/claims/client_surname_position': string,
  'http://byu.edu/claims/client_rest_of_name': string,
  'http://byu.edu/claims/client_preferred_first_name': string,
  'http://byu.edu/claims/client_sort_name': string,
  'http://byu.edu/claims/client_name_suffix': string,
  'http://byu.edu/claims/client_name_prefix': string
}

export interface RawByuResourceOwnerClaims {
  'http://byu.edu/claims/resourceowner_person_id': string,
  'http://byu.edu/claims/resourceowner_byu_id': string,
  'http://byu.edu/claims/resourceowner_net_id': string,
  'http://byu.edu/claims/resourceowner_surname': string,
  'http://byu.edu/claims/resourceowner_surname_position': string,
  'http://byu.edu/claims/resourceowner_rest_of_name': string,
  'http://byu.edu/claims/resourceowner_preferred_first_name': string,
  'http://byu.edu/claims/resourceowner_sort_name': string,
  'http://byu.edu/claims/resourceowner_suffix': string,
  'http://byu.edu/claims/resourceowner_prefix': string
}

export type RawClaims = RawJwtClaims & RawWso2Claims & RawByuClientClaims & Partial<RawByuResourceOwnerClaims>

export interface Wso2Claims {
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

export interface DecodedByuJwt {
  client: ClientClaims;
  resourceOwner?: ResourceOwnerClaims;
  raw: RawClaims;
  wso2: Wso2Claims;
  claims: ClientClaims | ResourceOwnerClaims;
}

export interface VerifiedJwts {
  current: DecodedByuJwt,
  original?: DecodedByuJwt,
  originalJWT: string,
  claims: ClientClaims | ResourceOwnerClaims
}

export interface ByuOpenIdConfig {
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

export interface ByuJwtInstance {
  authenticate(headers: any): Promise<VerifiedJwts>
  authenticateUAPIMiddleware(req: Request, response: Response, next: NextFunction): Promise<void>
  decodeJWT(jwt: string): Promise<DecodedByuJwt>
  getOpenIdConfiguration(): Promise<ByuOpenIdConfig>
  getPublicKey(): Promise<string>
  verifyJWT(jwt: string): Promise<boolean>
}

export default function (options?: Options): ByuJwtInstance
export const BYU_JWT_HEADER: string
export const BYU_JWT_HEADER_CURRENT: string
export const BYU_JWT_HEADER_ORIGINAL: string
export const WELL_KNOWN_URL: string
export function AuthenticationError(message: string, error?: Error): Error
export function JsonWebTokenError(message: string, error?: Error): Error
export function NotBeforeError(message: string, date: Date): Error
export function TokenExpiredError(message: string, expiredAt: Date): Error
