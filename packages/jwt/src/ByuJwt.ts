import NodeCache from 'node-cache'
import {
  OpenIdConfiguration,
  Certifications,
  type PemCertificate,
  Jwt
} from './models/index.js'
import { getMaxAge } from './util/Fetch.js'

export const OPEN_ID_CONFIG_KEY = 'open-id-config'
export const BYU_CERT_KEY = 'byu-cert'

export interface ByuJwtOptions {
  basePath?: string
  cacheDuration?: number
  development?: boolean
  issuer?: string
  openIdConfigUrl?: string
}

export class ByuJwt {
  protected basePath: string

  protected cacheDuration: number

  public readonly cache: NodeCache

  protected development: boolean

  public readonly openIdConfigUrl: string

  constructor (options?: ByuJwtOptions) {
    this.basePath = options?.basePath ?? ''
    this.cacheDuration = options?.cacheDuration ?? 60 * 60 // 1 hour default

    if (options?.openIdConfigUrl != null) {
      this.openIdConfigUrl = options.openIdConfigUrl
    } else if (options?.issuer != null) {
      const issuer = /^https?:\/\//.test(options.issuer) ? options.issuer : `https://${options.issuer}`
      this.openIdConfigUrl = `${issuer}/.well-known/openid-configuration`
    } else {
      throw Error('Missing OpenID configuration URL')
    }

    this.development = options?.development ?? false
    if (this.development && process.env.NODE_ENV === 'production') {
      throw Error('@byu-oit/jwt is set to development mode but environment variable NODE_ENV is set to production')
    }

    this.cache = new NodeCache()
  }

  async getOpenIdConfiguration (): Promise<OpenIdConfiguration> {
    /** Check cache fo open id config */
    let config = this.cache.get<OpenIdConfiguration>(OPEN_ID_CONFIG_KEY)
    if (config == null) {
      /** Refresh our open id configuration cache */
      const response = await fetch(this.openIdConfigUrl)
      /** Check for max age header or set a default */
      const cacheDuration = getMaxAge(response.headers) ?? this.cacheDuration
      /** Validate the configuration */
      config = OpenIdConfiguration.from(await response.json())
      /** Cache OpenId configuration */
      this.cache.set(OPEN_ID_CONFIG_KEY, config, cacheDuration)
    }
    return config
  }

  async getPem (): Promise<PemCertificate[]> {
    let certs = this.cache.get<Certifications>(BYU_CERT_KEY)
    if (certs == null) {
      /** Refresh our cert cache */
      const config = await this.getOpenIdConfiguration()
      const response = await fetch(config.jwksUri)
      /** Check for max age header or set a default */
      const cacheDuration = getMaxAge(response.headers) ?? this.cacheDuration
      /** Validate the certification endpoint response */
      certs = Certifications.from(await response.json())
      /** Cache certs */
      this.cache.set(BYU_CERT_KEY, certs, cacheDuration)
    }
    /** Return pem-formatted certificates */
    return certs.pemCertificates
  }

  async verify (jwt: string): Promise<Jwt> {
    const decoded = Jwt.decode(jwt)
    if (this.development) {
      /** We can skip verification */
      return decoded
    }

    /** Check for valid key in JWT header */
    const validKeys = await this.getPem()
    const foundKey = validKeys.find(key => key.x5t === decoded.header.x5t)
    if (foundKey == null) {
      throw new Error('x5t in JWT did not correspond to any known key')
    }

    /** Verify JWT integrity */
    return Jwt.verify(jwt, foundKey.x5c)
  }
}
