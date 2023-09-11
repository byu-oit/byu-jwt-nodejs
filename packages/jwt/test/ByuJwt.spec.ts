import test from 'ava'
import { ByuJwt } from '../src/index.js'
import { expiredJwt, decodedJwtPayload } from './assets/jwt.js'

test.serial('should decode the jwt', async t => {
  const byuJwt = ByuJwt.create({ issuer: 'https://example.com' })

  t.notThrows(() => byuJwt.decode(expiredJwt))
  const decodedJwt = byuJwt.decode(expiredJwt)
  t.deepEqual(decodedJwt.payload, decodedJwtPayload)
})

test.serial('verify should fail on an expired jwt', async t => {
  const byuJwt = ByuJwt.create({ issuer: 'https://api.byu.edu' })
  await t.throwsAsync(async () => await byuJwt.verify(expiredJwt))
})
