import test from 'ava'
import Fastify from 'fastify'
import { type ByuJwtError, ByuJwtProvider } from '../src/index.js'
import { expiredJwt } from './assets/jwt.js'

const issuer = 'https://example.com'
const development = true
const errorHandler = (error: ByuJwtError): ByuJwtError => {
  return error
}

test('authenticated user', async t => {
  const fastify = Fastify()
  await fastify.register(ByuJwtProvider, { issuer, development, errorHandler })
  fastify.get('/', (request) => request.caller)
  const result = await fastify.inject({ url: '/', headers: { 'x-jwt-assertion': expiredJwt } }).then(res => res.json())
  t.is(result.netId, 'stuft2')
})

test('missing expected JWT', async t => {
  const fastify = Fastify()
  await fastify.register(ByuJwtProvider, { issuer, development, errorHandler })
  fastify.get('/', () => true)
  const result = await fastify.inject('/').then(res => res.json<ByuJwtError>())
  t.is(result.message, 'Missing expected JWT')
})
test.todo('invalid API context in JWT')
test.todo('invalid audience in JWT')
test.todo('will return original instead of current')
