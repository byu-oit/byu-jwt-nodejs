/*
* Copyright 2018 Brigham Young University
*
* Licensed under the Apache License, Version 2.0 (the "License")
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/
/* global describe it beforeEach before */

// This should be a WSO2 token authorized to call the Echo v1 service at
// https://api.byu.edu/store/apis/info?name=Echo&version=v1&provider=BYU%2Fbcwinter
const TOKEN = process.env.TOKEN

const expect = require('chai').expect
const ByuJWT = require('../index')
const request = require('request')

describe('byu-jwt', function () {
  let byuJWT
  let jwt

  before(done => {
    if (!TOKEN) throw Error('No TOKEN specified for tests')

    byuJWT = ByuJWT({ cacheTTL: 0 })

    const reqConfig = {
      method: 'get',
      url: 'https://api.byu.edu:443/echo/v1/echo/admin',
      headers: {
        Authorization: 'Bearer ' + TOKEN
      }
    }
    request(reqConfig, function (err, res, body) {
      if (err) throw Error('Unable to request JWT: \n' + err)
      try {
        const obj = typeof body === 'object' ? body : JSON.parse(body)
        jwt = obj.Headers['X-Jwt-Assertion'][0]
      } catch (err) {
        throw Error('Unable to get JWT: \n' + body)
      }
      done()
    })
  })

  it('can get OpenID configuration', () => {
    return byuJWT.getOpenIdConfiguration()
      .then(config => {
        expect(config).to.be.an.instanceOf(Object)
        expect(config).to.have.ownProperty('issuer')
      })
  })

  it('can get pem', () => {
    return byuJWT.getPem()
      .then(value => {
        expect(value).to.match(/^-----BEGIN CERTIFICATE-----/)
        expect(value).to.match(/-----END CERTIFICATE-----$/)
      })
  })

  describe('verifyJWT', () => {
    it('valid JWT', () => {
      return byuJWT.verifyJWT(jwt)
        .then(value => {
          expect(value).to.equal(true)
        })
    })

    it('invalid JWT', () => {
      return byuJWT.verifyJWT('not-a-jwt')
        .then(value => {
          expect(value).to.equal(false)
        })
    })

    it('invalid x5t in JWT', () => {
      const [encodedJwtHeaders, ...restOfJwt] = jwt.split('.')
      const decodedJwtHeaders = JSON.parse(Buffer.from(encodedJwtHeaders, 'base64url').toString())
      const jwtHeadersWithInvalidX5t = { ...decodedJwtHeaders, x5t: 'invalid x5t' }
      const encodedJwtHeadersWithInvalidX5t = Buffer.from(JSON.stringify(jwtHeadersWithInvalidX5t)).toString('base64url')
      const jwtWithInvalidX5t = [encodedJwtHeadersWithInvalidX5t, ...restOfJwt].join('.')
      return byuJWT.verifyJWT(jwtWithInvalidX5t)
        .then(value => {
          expect(value).to.equal(false)
        })
    })
  })

  describe('decodeJWT', () => {
    it('valid JWT', () => {
      return byuJWT.decodeJWT(jwt)
        .then(value => {
          expect(value.client).to.have.ownProperty('byuId')
        })
    })

    it('invalid JWT', () => {
      return byuJWT.decodeJWT('not-a-jwt')
        .then(() => { throw Error('not this error') })
        .catch(err => {
          expect(err.message).to.equal('jwt malformed')
        })
    })
  })

  describe('authenticate', () => {
    it('valid JWT', () => {
      const headers = {}
      headers[ByuJWT.BYU_JWT_HEADER_CURRENT] = jwt
      return byuJWT.authenticate(headers)
        .then(result => {
          expect(result.claims).to.deep.equal(result.current.client)
        })
    })

    it('invalid JWT', () => {
      const headers = {}
      headers[ByuJWT.BYU_JWT_HEADER_CURRENT] = 'not-a-jwt'
      return byuJWT.authenticate(headers)
        .then(() => { throw Error('not this error') })
        .catch(err => {
          expect(err.message).to.equal('Invalid JWT')
        })
    })
  })

  describe('authenticateUAPIMiddleware', () => {
    let res

    beforeEach(() => {
      const deferred = {}
      deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve
        deferred.reject = reject
      })
      res = {
        code: 0,
        body: '',
        promise: deferred.promise,
        status: function (code) {
          this.code = code
          return res
        },
        send: function (body) {
          this.body = body
          deferred.resolve()
        }
      }
    })

    it('valid JWT', done => {
      const headers = {}
      headers[ByuJWT.BYU_JWT_HEADER_CURRENT] = jwt
      const req = { headers: headers }

      byuJWT.authenticateUAPIMiddleware(req, res, function () {
        expect(req).to.have.ownProperty('verifiedJWTs')
        done()
      })
    })

    it('authenticate invalid JWT', () => {
      const headers = {}
      headers[ByuJWT.BYU_JWT_HEADER_CURRENT] = 'not-a-jwt'
      const req = { headers: headers }
      byuJWT.authenticateUAPIMiddleware(req, res, function () {
        throw Error('should not get here')
      })
      return res.promise
        .then(() => {
          expect(res.code).to.equal(401)
        })
    })
  })
})
