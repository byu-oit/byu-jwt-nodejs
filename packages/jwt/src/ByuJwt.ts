import {
  JwtPayload,
  RawByuClientClaimsSchema,
  RawByuResourceOwnerClaimsSchema,
  RawIssuerClaimsSchema
} from './models/Jwt.js'
import {
  createJwt,
  type CreateJwtOptions,
  type JwtPayloadTransformer
} from '@byu-oit-sdk/jwt'
import { type Static, Type } from '@sinclair/typebox'

export const JwtPayloadSchema = Type.Intersect([
  Type.Object({
    iss: Type.Optional(Type.String()),
    exp: Type.Optional(Type.Number()),
    aud: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())]))
  }),
  RawIssuerClaimsSchema,
  RawByuClientClaimsSchema,
  Type.Partial(RawByuResourceOwnerClaimsSchema)
])

export type JwtPayloadData = Static<typeof JwtPayloadSchema>
export interface TransformedJwtPayload extends Record<string, unknown> {
  readonly iss?: string
  readonly exp?: number
  readonly aud?: string[] | string

  /**
     * Issuer Claims
     */
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

  /**
     * Client Claims
     */
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
}

export const transformer: JwtPayloadTransformer<typeof JwtPayloadSchema, TransformedJwtPayload> = (payload) => {
  const iss = payload.iss
  const exp = payload.exp
  const aud = payload.aud

  /**
     * Issuer Claims
     */
  const apiContext = payload['http://wso2.org/claims/apicontext']
  const application = {
    id: payload['http://wso2.org/claims/applicationid'],
    name: payload['http://wso2.org/claims/applicationname'],
    tier: payload['http://wso2.org/claims/applicationtier']
  }
  const clientId = payload['http://wso2.org/claims/client_id']
  const endUser = payload['http://wso2.org/claims/enduser']
  const endUserTenantId = payload['http://wso2.org/claims/enduserTenantId']
  const keyType = payload['http://wso2.org/claims/keytype']
  const subscriber = payload['http://wso2.org/claims/subscriber']
  const tier = payload['http://wso2.org/claims/tier']
  const userType = payload['http://wso2.org/claims/usertype']
  const version = payload['http://wso2.org/claims/version']

  /**
     * Resource Owner or Client Claims
     */
  const hasResourceOwner = payload['http://byu.edu/claims/resourceowner_byu_id'] !== undefined
  const byuId = payload['http://byu.edu/claims/resourceowner_byu_id'] ?? payload['http://byu.edu/claims/client_byu_id']
  const netId = payload['http://byu.edu/claims/resourceowner_net_id'] ?? payload['http://byu.edu/claims/client_net_id']
  const personId = payload['http://byu.edu/claims/resourceowner_person_id'] ?? payload['http://byu.edu/claims/client_person_id']
  const preferredFirstName = payload['http://byu.edu/claims/resourceowner_preferred_first_name'] ?? payload['http://byu.edu/claims/client_preferred_first_name']
  const prefix = payload['http://byu.edu/claims/resourceowner_prefix'] ?? payload['http://byu.edu/claims/client_name_prefix']
  const restOfName = payload['http://byu.edu/claims/resourceowner_rest_of_name'] ?? payload['http://byu.edu/claims/client_rest_of_name']
  const sortName = payload['http://byu.edu/claims/resourceowner_sort_name'] ?? payload['http://byu.edu/claims/client_sort_name']
  const suffix = payload['http://byu.edu/claims/resourceowner_suffix'] ?? payload['http://byu.edu/claims/client_name_suffix']
  const surname = payload['http://byu.edu/claims/resourceowner_surname'] ?? payload['http://byu.edu/claims/client_surname']
  const surnamePosition = payload['http://byu.edu/claims/resourceowner_surname_position'] ?? payload['http://byu.edu/claims/client_surname_position']
  const claimSource = hasResourceOwner ? payload['http://byu.edu/claims/client_claim_source'] : undefined
  const subscriberNetId = hasResourceOwner ? payload['http://byu.edu/claims/client_subscriber_net_id'] : undefined

  return {
    iss,
    exp,
    aud,
    apiContext,
    application,
    clientId,
    endUser,
    endUserTenantId,
    keyType,
    subscriber,
    tier,
    userType,
    version,
    byuId,
    netId,
    personId,
    preferredFirstName,
    prefix,
    restOfName,
    sortName,
    suffix,
    surname,
    surnamePosition,
    claimSource,
    subscriberNetId
  }
}

export type CreateByuJwtOptions = Omit<CreateJwtOptions<typeof JwtPayloadSchema, TransformedJwtPayload>, 'schema' | 'transformer'>

export class ByuJwt extends createJwt({ schema: JwtPayload.Schema, transformer }) {
  static create (options?: CreateByuJwtOptions): typeof ByuJwt {
    return class CustomByuJwt extends createJwt({ ...options, schema: JwtPayload.Schema, transformer }) {
      static create = ByuJwt.create
    }
  }
}
