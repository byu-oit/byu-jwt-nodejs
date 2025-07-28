import test from 'node:test'
import assert from 'node:assert'

import { ByuJwt } from '../src/index.js'
import { expiredJwt, decodedJwtPayload } from './assets/jwt.js'

test('should decode the jwt', async t => {
  const byuJwt = ByuJwt.create({ issuer: 'https://example.com' })

  assert.ok(() => byuJwt.decode(expiredJwt))
  const decodedJwt = byuJwt.decode(expiredJwt)
  assert.deepStrictEqual(decodedJwt.payload, decodedJwtPayload)
}).catch((e) => { console.error(e) })

test('verify should fail on an expired jwt', async t => {
  const byuJwt = ByuJwt.create({ issuer: 'https://api.byu.edu' })
  assert.throws(async () => await byuJwt.verify(expiredJwt))
}).catch((e) => { console.error(e) })
