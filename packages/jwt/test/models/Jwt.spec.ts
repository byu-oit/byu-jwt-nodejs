import test from 'ava'
import { Jwt } from '../../src/index.js'
import { expiredJwt } from '../assets/jwt.js'

test('decodes a valid jwt', t => {
  t.notThrows(() => Jwt.decode(expiredJwt))
})

test('throws an error for an invalid jwt', t => {
  t.throws(() => Jwt.decode(''))
})
