import { Type, type Static } from '@sinclair/typebox'
import { createDecoder, createVerifier, type DecoderOptions, type VerifierOptions } from 'fast-jwt'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ValidationError } from '../util/Errors.js'

export enum KeyType {
  PRD = 'PRODUCTION',
  SND = 'SANDBOX'
}

export enum UserType {
  APP_USER = 'APPLICATION_USER',
  APP = 'APPLICATION'
}

export const RawIssuerClaimsSchema = Type.Object({
  'http://wso2.org/claims/subscriber': Type.String(),
  'http://wso2.org/claims/applicationid': Type.String(),
  'http://wso2.org/claims/applicationname': Type.String(),
  'http://wso2.org/claims/applicationtier': Type.String(),
  'http://wso2.org/claims/apicontext': Type.String(),
  'http://wso2.org/claims/version': Type.String(),
  'http://wso2.org/claims/tier': Type.String(),
  'http://wso2.org/claims/keytype': Type.Enum(KeyType),
  'http://wso2.org/claims/usertype': Type.Enum(UserType),
  'http://wso2.org/claims/enduser': Type.String(),
  'http://wso2.org/claims/enduserTenantId': Type.String(),
  'http://wso2.org/claims/client_id': Type.String()
}, { $id: 'RawIssuerClaimsSchema' })

export type RawIssuerClaims = Static<typeof RawIssuerClaimsSchema>

export enum ClientClaimSource {
  CLIENT_ID = 'CLIENT_ID',
  CLIENT_SUBSCRIBER = 'CLIENT_SUBSCRIBER',
}

export const RawByuClientClaimsSchema = Type.Object({
  'http://byu.edu/claims/client_subscriber_net_id': Type.String(),
  'http://byu.edu/claims/client_claim_source': Type.Enum(ClientClaimSource),
  'http://byu.edu/claims/client_person_id': Type.String(),
  'http://byu.edu/claims/client_byu_id': Type.String(),
  'http://byu.edu/claims/client_net_id': Type.String(),
  'http://byu.edu/claims/client_surname': Type.String(),
  'http://byu.edu/claims/client_surname_position': Type.String(),
  'http://byu.edu/claims/client_rest_of_name': Type.String(),
  'http://byu.edu/claims/client_preferred_first_name': Type.String(),
  'http://byu.edu/claims/client_sort_name': Type.String(),
  'http://byu.edu/claims/client_name_suffix': Type.String(),
  'http://byu.edu/claims/client_name_prefix': Type.String()
}, { $id: 'RawByuClientClaimsSchema' })

export type RawByuClientClaims = Static<typeof RawByuClientClaimsSchema>

export const RawByuResourceOwnerClaimsSchema = Type.Object({
  'http://byu.edu/claims/resourceowner_person_id': Type.String(),
  'http://byu.edu/claims/resourceowner_byu_id': Type.String(),
  'http://byu.edu/claims/resourceowner_net_id': Type.String(),
  'http://byu.edu/claims/resourceowner_surname': Type.String(),
  'http://byu.edu/claims/resourceowner_surname_position': Type.String(),
  'http://byu.edu/claims/resourceowner_rest_of_name': Type.String(),
  'http://byu.edu/claims/resourceowner_preferred_first_name': Type.String(),
  'http://byu.edu/claims/resourceowner_sort_name': Type.String(),
  'http://byu.edu/claims/resourceowner_suffix': Type.String(),
  'http://byu.edu/claims/resourceowner_prefix': Type.String()
}, { $id: 'RawByuResourceOwnerClaimsSchema' })

export type RawByuResourceOwnerClaims = Static<typeof RawByuResourceOwnerClaimsSchema>

export type JwtHeaderType = Static<typeof JwtHeader.Schema>

export class JwtHeader {
  static Schema = Type.Object({
    kid: Type.String(),
    x5t: Type.String(),
    alg: Type.String()
  }, { additionalProperties: true })

  readonly kid: string
  readonly x5t: string
  readonly alg: string

  constructor (jwt: JwtHeaderType) {
    this.kid = jwt.kid
    this.x5t = jwt.x5t
    this.alg = jwt.alg
  }

  static from (value: unknown): JwtHeader {
    const C = TypeCompiler.Compile(JwtHeader.Schema)
    const result = C.Check(value)
    if (!result) {
      const errors = [...C.Errors(value)]
      throw new ValidationError(errors, 'Invalid JWT Header')
    }
    return new JwtHeader(value)
  }
}

export type JwtPayloadType = Static<typeof JwtPayload.Schema>

export class JwtPayload {
  static Schema = Type.Intersect([
    Type.Object({
      iss: Type.Optional(Type.String()),
      exp: Type.Optional(Type.Number()),
      aud: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())]))
    }),
    RawIssuerClaimsSchema,
    RawByuClientClaimsSchema,
    Type.Partial(RawByuResourceOwnerClaimsSchema)
  ])

  readonly iss?: string
  readonly exp?: number
  readonly aud?: string[] | string

  /** Issuer Claims */

  readonly apiContext: string
  readonly application: {
    readonly id: string
    readonly name: string
    readonly tier: string
  }

  readonly clientId: string
  readonly endUser: string
  readonly endUserTenantId: string
  readonly keyType: string
  readonly subscriber: string
  readonly tier: string
  readonly userType: string
  readonly version: string

  /** Client Claims */

  readonly byuId: string
  readonly netId: string
  readonly personId: string
  readonly preferredFirstName: string
  readonly prefix: string
  readonly restOfName: string
  readonly sortName: string
  readonly suffix: string
  readonly surname: string
  readonly surnamePosition: string
  readonly claimSource?: string
  readonly subscriberNetId?: string

  constructor (payload: JwtPayloadType) {
    this.iss = payload.iss
    this.exp = payload.exp
    this.aud = payload.aud

    /** Issuer Claims */

    this.apiContext = payload['http://wso2.org/claims/apicontext']
    this.application = {
      id: payload['http://wso2.org/claims/applicationid'],
      name: payload['http://wso2.org/claims/applicationname'],
      tier: payload['http://wso2.org/claims/applicationtier']
    }
    this.clientId = payload['http://wso2.org/claims/client_id']
    this.endUser = payload['http://wso2.org/claims/enduser']
    this.endUserTenantId = payload['http://wso2.org/claims/enduserTenantId']
    this.keyType = payload['http://wso2.org/claims/keytype']
    this.subscriber = payload['http://wso2.org/claims/subscriber']
    this.tier = payload['http://wso2.org/claims/tier']
    this.userType = payload['http://wso2.org/claims/usertype']
    this.version = payload['http://wso2.org/claims/version']

    /** Resource Owner or Client Claims */
    const hasResourceOwner = payload['http://byu.edu/claims/resourceowner_byu_id'] !== undefined

    this.byuId = payload['http://byu.edu/claims/resourceowner_byu_id'] ?? payload['http://byu.edu/claims/client_byu_id']
    this.netId = payload['http://byu.edu/claims/resourceowner_net_id'] ?? payload['http://byu.edu/claims/client_net_id']
    this.personId = payload['http://byu.edu/claims/resourceowner_person_id'] ?? payload['http://byu.edu/claims/client_person_id']
    this.preferredFirstName = payload['http://byu.edu/claims/resourceowner_preferred_first_name'] ?? payload['http://byu.edu/claims/client_preferred_first_name']
    this.prefix = payload['http://byu.edu/claims/resourceowner_prefix'] ?? payload['http://byu.edu/claims/client_name_prefix']
    this.restOfName = payload['http://byu.edu/claims/resourceowner_rest_of_name'] ?? payload['http://byu.edu/claims/client_rest_of_name']
    this.sortName = payload['http://byu.edu/claims/resourceowner_sort_name'] ?? payload['http://byu.edu/claims/client_sort_name']
    this.suffix = payload['http://byu.edu/claims/resourceowner_suffix'] ?? payload['http://byu.edu/claims/client_name_suffix']
    this.surname = payload['http://byu.edu/claims/resourceowner_surname'] ?? payload['http://byu.edu/claims/client_surname']
    this.surnamePosition = payload['http://byu.edu/claims/resourceowner_surname_position'] ?? payload['http://byu.edu/claims/client_surname_position']
    this.claimSource = hasResourceOwner ? payload['http://byu.edu/claims/client_claim_source'] : undefined
    this.subscriberNetId = hasResourceOwner ? payload['http://byu.edu/claims/client_subscriber_net_id'] : undefined
  }

  static from (value: unknown): JwtPayload {
    const C = TypeCompiler.Compile(JwtPayload.Schema)
    const result = C.Check(value)
    if (!result) {
      const errors = [...C.Errors(value)]
      throw new ValidationError(errors, 'Invalid JWT Payload')
    }
    return new JwtPayload(value)
  }
}

export interface CompleteJwt {
  header: unknown
  payload: unknown
  signature: string
  input: string
}

export class Jwt {
  header: JwtHeader
  payload: JwtPayload
  signature: string
  input: string

  constructor (completeJwt: CompleteJwt) {
    this.header = JwtHeader.from(completeJwt.header)
    this.payload = JwtPayload.from(completeJwt.payload)
    this.signature = completeJwt.signature
    this.input = completeJwt.input
  }

  static decode (value: string, options?: Partial<DecoderOptions>): Jwt {
    const opts = { ...options, complete: true }
    const decode = createDecoder(opts)
    return new Jwt(decode(value))
  }

  static verify (value: string, key: string, options?: Partial<VerifierOptions>): Jwt {
    const opts = { ...options, complete: true, key }
    const verify = createVerifier(opts)
    return new Jwt(verify(value))
  }
}
