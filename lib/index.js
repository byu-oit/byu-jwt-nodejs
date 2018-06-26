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
const AuthenticationError   = require('./AuthenticationError')
const Cache                 = require('./cache')
const jsonWebToken          = require('jsonwebtoken')
const pem                   = require('pem')
const request               = require('./request')

const BYU_JWT_CURRENT = { name: '', key: 'current', header: 'x-jwt-assertion' }
const BYU_JWT_ORIGINAL = { name: 'Original', key: 'original', header: 'x-jwt-assertion-original' }
const WELL_KNOWN_URL = 'https://api.byu.edu/.well-known/openid-configuration'

module.exports = ByuJWT

function ByuJWT(options) {

  // normalize options
  if (!options) options = {}
  if (!options.hasOwnProperty('basePath')) options.basePath = ''
  if (!options.hasOwnProperty('cacheTTL')) options.cacheTTL = 10
  if (!options.hasOwnProperty('development')) options.development = false

  // validate options
  if (typeof options.cacheTTL !== 'number') throw Error('Option "cacheTTL" must be a number')
  if (options.development && process.env.NODE_ENV === 'production') {
    throw Error('byu-jwt set to development mode but environment variable NODE_ENV is set to production')
  }

  if (!(this instanceof ByuJWT)) return new ByuJWT(options)
  this.options = Object.assign({}, options)

  // set cache TTL
  this.cache = Cache()
  this.cache.setTTL(options.cacheTTL)

}

ByuJWT.prototype.authenticate = function(headers) {
  return init(this.cache)
    .then(openIdConfig => authenticate(this.options, openIdConfig, headers))
}

ByuJWT.prototype.authenticateUAPIMiddleware = function(req, res, next) {
  this.authenticate(req.headers)
    .then(verifiedJWTs => {
      req.verifiedJWTs = verifiedJWTs
      next()
    })
    .catch(err => {
      console.error(err.stack)
      const response = err instanceof AuthenticationError
        ? { code: 401, message: err.message }
        : { code: 500, message: 'Error determining authentication' }
      res.status(response.code).send({ metadata: { validation_response: response } })
    })
}

ByuJWT.prototype.decodeJWT = function(jwt) {
  return init(this.cache)
    .then(openIdConfig => decodeJWT(this.options, openIdConfig, jwt))
}

ByuJWT.prototype.getOpenIdConfiguration = function() {
  return getOpenIdConfiguration(this.cache)
}

ByuJWT.prototype.getPublicKey = function() {
  return init(this.cache)
    .then(getPublicKey)
}

ByuJWT.prototype.verifyJWT = function(jwt) {
  return init(this.cache)
    .then(openIdConfig => verifyJWT(this.options, openIdConfig, jwt))
    .then(() => true)
    .catch(() => false)
}

Object.defineProperties(ByuJWT.prototype, {

  cacheTTL: {
    get: function() { return this.cache.getTTL() },
    set: function(ttl) { this.cache.setTTL(ttl) }
  }

});

Object.defineProperties(ByuJWT, {
  'BYU_JWT_HEADER_CURRENT': {
    value: BYU_JWT_CURRENT.header,
    writable: false
  },

  'BYU_JWT_HEADER_ORIGINAL': {
    value: BYU_JWT_ORIGINAL.header,
    writable: false
  },

  'AuthenticationError': {
    value: AuthenticationError,
    writable: false
  },

  'JsonWebTokenError': {
    value: jsonWebToken.JsonWebTokenError,
    writable: false
  },

  'NotBeforeError': {
    value: jsonWebToken.NotBeforeError,
    writable: false
  },

  'TokenExpiredError': {
    value: jsonWebToken.TokenExpiredError,
    writable: false
  }
})




function authenticate(options, openIdConfig, headers) {
  const promises = []
  const verifiedJWTs = {}

  // scan headers for provided JWT info
  ;[BYU_JWT_ORIGINAL, BYU_JWT_CURRENT]
    .forEach(data => {
      if (headers[data.header]) {
        const promise = decodeJWT(options, openIdConfig, headers[data.header])
          .then(decodedJWT => {
            verifiedJWTs[data.key] = decodedJWT
          })
          .catch(err => {
            const name = (data.name ? data.name + ' ' : '')
            const prefix = err instanceof jsonWebToken.TokenExpiredError ? 'Expired ' : 'Invalid '
            throw new AuthenticationError(prefix + name + 'JWT', err)
          })
        promises.push(promise)
      } else {
        promises.push(null)
      }
    })

  return Promise.all(promises)
    .then(() => {
      if (!verifiedJWTs.current) throw new AuthenticationError('Missing expected JWT')

      // extra validation step for production
      if (!options.development && options.basePath) {
        const context = verifiedJWTs.current.raw['http://wso2.org/claims/apicontext']
        if (!context.startsWith(options.basePath)) throw new AuthenticationError('Invalid API context in JWT')
      }

      verifiedJWTs.originalJWT = headers[BYU_JWT_ORIGINAL.header] || headers[BYU_JWT_CURRENT.header]
      verifiedJWTs.claims = (verifiedJWTs.original && verifiedJWTs.original.resourceOwner) ||
        (verifiedJWTs.current && verifiedJWTs.current.resourceOwner) ||
        (verifiedJWTs.original && verifiedJWTs.original.client) ||
        verifiedJWTs.current.client

      return verifiedJWTs
    })
}

/**
 * Take a JWT that has already been verified and make it easier to use.
 * @param {object} options
 * @param {object} openIdConfig
 * @param {string} jwt
 * @returns {Promise.<Object>}
 */
function decodeJWT(options, openIdConfig, jwt) {
  return verifyJWT(options, openIdConfig, jwt)
    .then(verifiedJWT => {
      const hasResourceOwner = typeof verifiedJWT['http://byu.edu/claims/resourceowner_byu_id'] !== "undefined"
      const result = {}

      result.client = {
        byuId:              verifiedJWT['http://byu.edu/claims/client_byu_id'],
        claimSource:        verifiedJWT['http://byu.edu/claims/client_claim_source'],
        netId:              verifiedJWT['http://byu.edu/claims/client_net_id'],
        personId:           verifiedJWT['http://byu.edu/claims/client_person_id'],
        preferredFirstName: verifiedJWT['http://byu.edu/claims/client_preferred_first_name'],
        prefix:             verifiedJWT['http://byu.edu/claims/client_name_prefix'],
        restOfName:         verifiedJWT['http://byu.edu/claims/client_rest_of_name'],
        sortName:           verifiedJWT['http://byu.edu/claims/client_sort_name'],
        subscriberNetId:    verifiedJWT['http://byu.edu/claims/client_subscriber_net_id'],
        suffix:             verifiedJWT['http://byu.edu/claims/client_name_prefix'],
        surname:            verifiedJWT['http://byu.edu/claims/client_surname'],
        surnamePosition:    verifiedJWT['http://byu.edu/claims/client_surname_position']
      }

      if (hasResourceOwner) {
        result.resourceOwner = {
          byuId:              verifiedJWT['http://byu.edu/claims/resourceowner_byu_id'],
          netId:              verifiedJWT['http://byu.edu/claims/resourceowner_net_id'],
          personId:           verifiedJWT['http://byu.edu/claims/resourceowner_person_id'],
          preferredFirstName: verifiedJWT['http://byu.edu/claims/resourceowner_preferred_first_name'],
          prefix:             verifiedJWT['http://byu.edu/claims/resourceowner_prefix'],
          restOfName:         verifiedJWT['http://byu.edu/claims/resourceowner_rest_of_name'],
          sortName:           verifiedJWT['http://byu.edu/claims/resourceowner_sort_name'],
          suffix:             verifiedJWT['http://byu.edu/claims/resourceowner_suffix'],
          surname:            verifiedJWT['http://byu.edu/claims/resourceowner_surname'],
          surnamePosition:    verifiedJWT['http://byu.edu/claims/resourceowner_surname_position']
        }
      }

      result.claims = hasResourceOwner ? result.resourceOwner : result.client

      result.raw = verifiedJWT

      result.wso2 = {
        apiContext:         verifiedJWT["http://wso2.org/claims/apicontext"],
        application: {
          id:               verifiedJWT["http://wso2.org/claims/applicationid"],
          name:             verifiedJWT["http://wso2.org/claims/applicationname"],
          tier:             verifiedJWT["http://wso2.org/claims/applicationtier"]
        },
        clientId:           verifiedJWT["http://wso2.org/claims/client_id"],
        endUser:            verifiedJWT["http://wso2.org/claims/enduser"],
        endUserTenantId:    verifiedJWT["http://wso2.org/claims/enduserTenantId"],
        keyType:            verifiedJWT["http://wso2.org/claims/keytype"],
        subscriber:         verifiedJWT["http://wso2.org/claims/subscriber"],
        tier:               verifiedJWT["http://wso2.org/claims/tier"],
        userType:           verifiedJWT["http://wso2.org/claims/usertype"],
        version:            verifiedJWT["http://wso2.org/claims/version"]
      }

      return result
    })
}

/**
 * Get the latest OpenID configuration and refresh cache
 * @param cache
 */
function getOpenIdConfiguration(cache) {
  const promise = request(WELL_KNOWN_URL)
    .catch(err => {
      cache.clearCache()
      throw err
    })
  cache.setCache(promise)
  return promise
}

/**
 * Get the public key for the OpenID configuration
 * @param {object} openIdConfig
 * @returns {string}
 */
function getPublicKey(openIdConfig) {
  return request(openIdConfig["jwks_uri"])
    .then(result => {
      const keys = result.keys
      const cert =
        "-----BEGIN CERTIFICATE-----\n" +
        keys[0].x5c[0].replace(/(.{64})/g, "$1\n") +
        "\n-----END CERTIFICATE-----"

      //extract public key
      return new Promise((resolve, reject) => {
        pem.getPublicKey(cert, (err, data) => {
          if (err) return reject(err)
          resolve(data.publicKey)
        })
      })
    })
}

/**
 * Get cached OpenID configuration or new OpenID configuration if the cached is expired.
 * @param {object} cache
 * @returns {object}
 */
function init(cache) {
  return cache.getCache() || getOpenIdConfiguration(cache)
}

/**
 * Verify the JWT against the OpenID configuration.
 * @param {object} options
 * @param {object} openIdConfig
 * @param {string} jwt
 * @returns {Promise<Object>}
 */
function verifyJWT(options, openIdConfig, jwt) {

  // we can skip verification
  if (options.development) {
    console.error('WARNING: JWT verification skipped in development mode');
    return Promise.resolve(jsonWebToken.decode(jwt))
  }

  const algorithms = openIdConfig["id_token_signing_alg_values_supported"]
  return getPublicKey(openIdConfig)
    .then(publicKey => {
      return new Promise(function(resolve, reject) {
        return jsonWebToken.verify(jwt, publicKey, {algorithms: algorithms}, (err, decoded) => {
          if (err) return reject(err)
          resolve(decoded)
        })
      })
    })
}