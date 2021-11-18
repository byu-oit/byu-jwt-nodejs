/**
 *  @license
 *    Copyright 2018 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict'
const AuthenticationError = require('./AuthenticationError')
const Cache = require('./cache')
const debug = require('debug')('byu-jwt')
const jsonWebToken = require('jsonwebtoken')
const request = require('./request')
const { promisify } = require('util')

const jsonWebTokenVerify = promisify(jsonWebToken.verify)

const BYU_JWT_CURRENT = { name: '', key: 'current', header: 'x-jwt-assertion' }
const BYU_JWT_ORIGINAL = { name: 'Original', key: 'original', header: 'x-jwt-assertion-original' }
const WELL_KNOWN_URL = 'https://api.byu.edu/.well-known/openid-configuration'

module.exports = ByuJWT

function ByuJWT (options) {
  const byuJwt = {}

  // normalize options
  if (!options) options = {}
  if (!Object.hasOwnProperty.call(options, 'basePath')) options.basePath = ''
  if (!Object.hasOwnProperty.call(options, 'cacheTTL')) options.cacheTTL = 10
  if (!Object.hasOwnProperty.call(options, 'development')) options.development = false

  // validate options
  if (typeof options.cacheTTL !== 'number') throw Error('Option "cacheTTL" must be a number')
  if (options.development && process.env.NODE_ENV === 'production') {
    throw Error('byu-jwt set to development mode but environment variable NODE_ENV is set to production')
  }

  // store options
  byuJwt.options = Object.assign({}, options)

  // set cache TTL
  byuJwt.cache = { openId: Cache(), byuCert: Cache() }
  byuJwt.cache.openId.setTTL(options.cacheTTL)
  byuJwt.cache.byuCert.setTTL(options.cacheTTL)

  byuJwt.authenticate = async (headers) => {
    return authenticate(byuJwt.options, byuJwt.cache, headers)
  }

  byuJwt.authenticateUAPIMiddleware = async function (req, res, next) {
    debug('running authenticateUAPIMiddleware')
    try {
      req.verifiedJWTs = await byuJwt.authenticate(req.headers)
      debug('completed authenticateUAPIMiddleware')
      next()
    } catch (err) {
      const cleanedStack = err.stack
        .replace(/\r\n/g, '\r')
        .replace(/\n/g, '\r')
      console.error('[ByuJWT]', cleanedStack)
      const response = err instanceof AuthenticationError
        ? { code: 401, message: err.message }
        : { code: 500, message: 'Error determining authentication' }
      debug('failed authenticateUAPIMiddleware: ' + err.stack)
      res.status(response.code).send({ metadata: { validation_response: response } })
    }
  }

  byuJwt.decodeJWT = async function (jwt) {
    return decodeJWT(byuJwt.options, byuJwt.cache, jwt)
  }

  byuJwt.getOpenIdConfiguration = function () {
    return getOpenIdConfiguration(byuJwt.cache)
  }

  byuJwt.getPem = async function () {
    const keys = await initPem(byuJwt.cache)
    return keys[0] && keys[0].x5c
  }

  byuJwt.verifyJWT = async function (jwt) {
    try {
      await verifyJWT(byuJwt.options, byuJwt.cache, jwt)
      return true
    } catch (e) {
      return false
    }
  }

  Object.defineProperties(byuJwt, {
    cacheTTL: {
      get: () => ({
        openId: byuJwt.cache.openId.getTTL(),
        byuCert: byuJwt.cache.byuCert.getTTL()
      }),
      set: (ttl) => ({
        openId: byuJwt.cache.openId.setTTL(ttl),
        byuCert: byuJwt.cache.byuCert.setTTL(ttl)
      })
    },
    openIdTTL: {
      get: () => byuJwt.cache.openId.getTTL(),
      set: (ttl) => byuJwt.cache.openId.setTTL(ttl)
    },
    byuCertTTL: {
      get: () => byuJwt.cache.byuCert.getTTL(),
      set: (ttl) => byuJwt.cache.byuCert.setTTL(ttl)
    }
  })

  return byuJwt
}

Object.defineProperties(ByuJWT, {
  BYU_JWT_HEADER_CURRENT: {
    value: BYU_JWT_CURRENT.header,
    writable: false
  },

  BYU_JWT_HEADER_ORIGINAL: {
    value: BYU_JWT_ORIGINAL.header,
    writable: false
  },

  AuthenticationError: {
    value: AuthenticationError,
    writable: false
  },

  JsonWebTokenError: {
    value: jsonWebToken.JsonWebTokenError,
    writable: false
  },

  NotBeforeError: {
    value: jsonWebToken.NotBeforeError,
    writable: false
  },

  TokenExpiredError: {
    value: jsonWebToken.TokenExpiredError,
    writable: false
  },

  WELL_KNOWN_URL: {
    value: WELL_KNOWN_URL,
    writable: false
  }
})

async function authenticate (options, cache, headers) {
  const verifiedJWTs = {}
  await Promise.all([BYU_JWT_ORIGINAL, BYU_JWT_CURRENT].map(async ({ header, name, key }) => {
    if (headers[header]) {
      debug('verifying JWT in header ' + header)
      try {
        const decodedJWT = await decodeJWT(options, cache, headers[header])
        debug('verify JWT complete for header ' + header)
        verifiedJWTs[key] = decodedJWT
      } catch (err) {
        debug('verify JWT failed for header ' + header + ': ' + err.stack)
        const prefix = err instanceof jsonWebToken.TokenExpiredError ? 'Expired ' : 'Invalid '
        throw new AuthenticationError(prefix + (name ? name + ' ' : '') + 'JWT', err)
      }
    }
  }))

  if (!verifiedJWTs.current) {
    debug('verify JWT missing expected JWT')
    throw new AuthenticationError('Missing expected JWT')
  }

  // extra validation step for production
  if (!options.development && options.basePath) {
    const context = verifiedJWTs.current.raw['http://wso2.org/claims/apicontext']
    if (context && !context.startsWith(options.basePath)) {
      throw new AuthenticationError('Invalid API context in JWT')
    }

    const aud = verifiedJWTs.current.raw.aud
    if (aud) {
      // aud can be a string or an array: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3
      if (typeof aud === 'string') {
        if (!aud.startsWith(options.basePath)) throw new AuthenticationError('Invalid aud in JWT')
      } else {
        if (!aud.some(audience => audience.startsWith(options.basePath))) throw new AuthenticationError('Invalid aud in JWT')
      }
    }
  }

  verifiedJWTs.originalJWT = headers[BYU_JWT_ORIGINAL.header] || headers[BYU_JWT_CURRENT.header]
  verifiedJWTs.claims = (verifiedJWTs.original && verifiedJWTs.original.resourceOwner) ||
    (verifiedJWTs.current && verifiedJWTs.current.resourceOwner) ||
    (verifiedJWTs.original && verifiedJWTs.original.client) ||
    verifiedJWTs.current.client

  return verifiedJWTs
}

/**
 * Take a JWT that has already been verified and make it easier to use.
 * @param {object} options
 * @param {object} cache
 * @param {string} jwt
 * @returns {Promise.<Object>}
 */
async function decodeJWT (options, cache, jwt) {
  const verifiedJWT = await verifyJWT(options, cache, jwt)
  const hasResourceOwner = typeof verifiedJWT['http://byu.edu/claims/resourceowner_byu_id'] !== 'undefined'
  const result = {
    client: {
      byuId: verifiedJWT['http://byu.edu/claims/client_byu_id'],
      claimSource: verifiedJWT['http://byu.edu/claims/client_claim_source'],
      netId: verifiedJWT['http://byu.edu/claims/client_net_id'],
      personId: verifiedJWT['http://byu.edu/claims/client_person_id'],
      preferredFirstName: verifiedJWT['http://byu.edu/claims/client_preferred_first_name'],
      prefix: verifiedJWT['http://byu.edu/claims/client_name_prefix'],
      restOfName: verifiedJWT['http://byu.edu/claims/client_rest_of_name'],
      sortName: verifiedJWT['http://byu.edu/claims/client_sort_name'],
      subscriberNetId: verifiedJWT['http://byu.edu/claims/client_subscriber_net_id'],
      suffix: verifiedJWT['http://byu.edu/claims/client_name_prefix'],
      surname: verifiedJWT['http://byu.edu/claims/client_surname'],
      surnamePosition: verifiedJWT['http://byu.edu/claims/client_surname_position']
    },
    ...(hasResourceOwner && {
      resourceOwner: {
        byuId: verifiedJWT['http://byu.edu/claims/resourceowner_byu_id'],
        netId: verifiedJWT['http://byu.edu/claims/resourceowner_net_id'],
        personId: verifiedJWT['http://byu.edu/claims/resourceowner_person_id'],
        preferredFirstName: verifiedJWT['http://byu.edu/claims/resourceowner_preferred_first_name'],
        prefix: verifiedJWT['http://byu.edu/claims/resourceowner_prefix'],
        restOfName: verifiedJWT['http://byu.edu/claims/resourceowner_rest_of_name'],
        sortName: verifiedJWT['http://byu.edu/claims/resourceowner_sort_name'],
        suffix: verifiedJWT['http://byu.edu/claims/resourceowner_suffix'],
        surname: verifiedJWT['http://byu.edu/claims/resourceowner_surname'],
        surnamePosition: verifiedJWT['http://byu.edu/claims/resourceowner_surname_position']
      }
    }),
    raw: verifiedJWT,
    wso2: {
      apiContext: verifiedJWT['http://wso2.org/claims/apicontext'],
      application: {
        id: verifiedJWT['http://wso2.org/claims/applicationid'],
        name: verifiedJWT['http://wso2.org/claims/applicationname'],
        tier: verifiedJWT['http://wso2.org/claims/applicationtier']
      },
      clientId: verifiedJWT['http://wso2.org/claims/client_id'],
      endUser: verifiedJWT['http://wso2.org/claims/enduser'],
      endUserTenantId: verifiedJWT['http://wso2.org/claims/enduserTenantId'],
      keyType: verifiedJWT['http://wso2.org/claims/keytype'],
      subscriber: verifiedJWT['http://wso2.org/claims/subscriber'],
      tier: verifiedJWT['http://wso2.org/claims/tier'],
      userType: verifiedJWT['http://wso2.org/claims/usertype'],
      version: verifiedJWT['http://wso2.org/claims/version']
    }
  }
  result.claims = hasResourceOwner ? result.resourceOwner : result.client
  debug('decoded JWT')
  return result
}

/**
 * Get the latest OpenID configuration and refresh cache
 * @param cache
 */
async function getOpenIdConfiguration (cache) {
  debug('get OpenID configuration')
  try {
    const config = await request(WELL_KNOWN_URL)
    debug('OpenID configuration acquired')
    const maxAge = getMaxAge(config.headers)
    const ttl = maxAgeInMinutes(maxAge)
    cache.openId.setTTL(ttl)
    cache.openId.setCache(config.body)
    return config.body
  } catch (err) {
    cache.openId.clearCache()
    throw err
  }
}

/**
 * Get the .pem certificate for the OpenID configuration
 * @param {object} cache
 * @returns {string}
 */
async function getPem (cache) {
  debug('getting pem')
  const openIdConfig = await initOpenId(cache)
  try {
    const result = await request(openIdConfig.jwks_uri)
    const certs = result.body.keys.map(key => {
      return {
        kid: key.kid,
        x5t: key.x5t,
        x5c: '-----BEGIN CERTIFICATE-----\n' +
          key.x5c[0].replace(/(.{64})/g, '$1\n') +
          '\n-----END CERTIFICATE-----'
      }
    })

    debug('pem acquired')
    const maxAge = getMaxAge(result.headers)
    const ttl = maxAgeInMinutes(maxAge)
    cache.byuCert.setTTL(ttl)
    cache.byuCert.setCache(certs)
    return certs
  } catch (err) {
    debug('failed to get pem')
    cache.byuCert.clearCache()
    throw err
  }
}

/**
 * Get the max-age cache control from headers
 * @params {object} headers
 * @returns {number}
 */
function getMaxAge (headers) {
  debug('getting max age from cache control header')
  const cacheControl = headers['cache-control']
  let maxAge
  if (cacheControl) {
    const match = cacheControl.match(/max-age=(\d+)/) // Get digits
    maxAge = match[1]
    maxAge = parseInt(maxAge, 10)
  }
  if (!maxAge) {
    debug('defaulting max age to 3600')
    return 3600
  }
  debug(`max age is ${maxAge}`)
  return maxAge
}

/**
 * Convert seconds to mintues
 * @params {number} seconds
 * @returns {number}
 */
function maxAgeInMinutes (seconds) {
  return Math.floor(seconds / 60)
}

/**
 * Get cached OpenID configuration or new OpenID configuration if the cached is expired.
 * @param {object} cache
 * @returns {object}
 */
function initOpenId (cache) {
  return cache.openId.getCache() || getOpenIdConfiguration(cache)
}

async function initPem (cache) {
  return cache.byuCert.getCache() || getPem(cache)
}

/**
 * Verify the JWT against the OpenID configuration.
 * @param {object} options
 * @param {object} cache
 * @param {string} jwt
 * @returns {Promise<Object>}
 */
async function verifyJWT (options, cache, jwt) {
  // we can skip verification
  if (options.development) {
    console.error('[ByuJWT] WARNING: JWT verification skipped in development mode')
    debug('JWT verification skipped in development mode')
    return jsonWebToken.decode(jwt)
  }

  let jwtHeaders = { }
  try {
    const jwtHeadersDecoded = Buffer.from(jwt.split('.')[0], 'base64').toString()
    jwtHeaders = JSON.parse(jwtHeadersDecoded)
  } catch (err) {
    debug('Invalid JWT. Unable to parse JWT headers: ' + err.message)
    throw new Error('jwt malformed')
  }

  const openIdConfig = await initOpenId(cache)
  const algorithms = openIdConfig.id_token_signing_alg_values_supported

  const validKeys = await initPem(cache)
  const matchingKey = validKeys.find(key => (key.kid === jwtHeaders.kid || key.x5t === jwtHeaders.x5t)) // Tyk has kid, WSO2 has x5t
  if (!matchingKey) {
    debug('Failed verifying JWT: x5t/kid in JWT did not correspond to any known key')
    throw new Error('x5t/kid in JWT did not correspond to any known key')
  }
  const pem = matchingKey.x5c

  debug('verifying JWT')
  try {
    const verifiedJWT = await jsonWebTokenVerify(jwt, pem, { algorithms })
    debug('verified JWT')
    return verifiedJWT
  } catch (err) {
    if (err.name === 'TokenExpiredError') debug('token expired at ' + err.expiredAt + ' for JWT ' + jwt)
    else debug('failed verifying JWT: ' + err.message + ' for JWT ' + jwt)
    throw err
  }
}
