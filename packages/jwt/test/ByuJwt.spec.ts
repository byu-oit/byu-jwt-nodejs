import test from 'ava'
import * as sinon from 'sinon'
import { validOpenIdConfig } from './assets/openid-config.js'
import { ByuJwt, OPEN_ID_CONFIG_KEY, BYU_CERT_KEY } from '../src/index.js'
import { validCerts } from './assets/byu-certs.js'
import { expiredJwt } from './assets/jwt.js'

test.serial('should cache an openid configuration', async t => {
  const response = {
    headers: new Headers(),
    async json () {
      return validOpenIdConfig
    }
  }
  const mockFetch = sinon.stub().resolves(response)
  global.fetch = mockFetch
  const byuJwt = new ByuJwt({ issuer: 'https://example.com', development: true })

  await byuJwt.getOpenIdConfiguration()
  await byuJwt.getOpenIdConfiguration()
  t.is(mockFetch.callCount, 1)
  t.truthy(byuJwt.cache.has(OPEN_ID_CONFIG_KEY))
})

test.serial('should cache byu certs', async t => {
  const openIdResponse = {
    headers: new Headers(),
    async json () {
      return validOpenIdConfig
    }
  }
  const byuCertResponse = {
    headers: new Headers(),
    async json () {
      return validCerts
    }
  }
  const mockFetch = sinon.stub()
    .onFirstCall().resolves(openIdResponse)
    .onSecondCall().resolves(byuCertResponse)
  global.fetch = mockFetch
  const byuJwt = new ByuJwt({ issuer: 'https://example.com', development: true })

  await byuJwt.getPem()
  await byuJwt.getPem()
  t.is(mockFetch.callCount, 2)
  t.truthy(byuJwt.cache.has(OPEN_ID_CONFIG_KEY))
  t.truthy(byuJwt.cache.has(BYU_CERT_KEY))
})

test.serial('should decode the jwt when in development', async t => {
  const mockFetch = sinon.stub()
  global.fetch = mockFetch

  const byuJwt = new ByuJwt({ issuer: 'https://example.com', development: true })
  await byuJwt.verify(expiredJwt)

  t.is(mockFetch.callCount, 0)
  t.falsy(byuJwt.cache.has(OPEN_ID_CONFIG_KEY))
  t.falsy(byuJwt.cache.has(BYU_CERT_KEY))
})
