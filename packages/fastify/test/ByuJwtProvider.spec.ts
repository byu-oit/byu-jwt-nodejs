import test from 'node:test'
import assert from 'node:assert'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import ByuJwtProvider, { apiContextValidationFunction, ByuJwtError, BYU_JWT_ERROR_CODES } from '../src/index.js'
import { expiredJwt, decodedJwt } from './assets/jwt.js'

const issuer = 'https://example.com'
const development = true
const errorHandler = (error: ByuJwtError, request: FastifyRequest, reply: FastifyReply): void => {
  request.log.error(error, 'In Error Handler')
  void reply.code(401).send(error)
}

test('authenticated user', async t => {
  const fastify = Fastify()
  await fastify.register(ByuJwtProvider, { issuer, development })
  fastify.get('/', (request) => request.caller)
  const result = await fastify.inject({ url: '/', headers: { 'x-jwt-assertion': expiredJwt } }).then(res => res.json())
  assert.strictEqual(result.netId, 'stuft2')
}).catch((e) => { console.error(e) })

test('cannot fetch key', async t => {
  const fastify = Fastify()
  await fastify.register(ByuJwtProvider, { issuer, basePath: '/test' })
  fastify.get('/', (request) => request.caller)
  const result = await fastify.inject({ url: '/', headers: { 'x-jwt-assertion': expiredJwt } }).then(res => res.json())
  assert.strictEqual(result.message, 'Cannot fetch key.')
}).catch((e) => { console.error(e) })

test('missing expected JWT', async t => {
  const fastify = Fastify()
  fastify.setErrorHandler(errorHandler)
  await fastify.register(ByuJwtProvider, { issuer, development })
  fastify.get('/', () => true)
  const result = await fastify.inject('/').then(res => res.json<ByuJwtError>())
  assert.strictEqual(result.message, 'Missing expected JWT')
}).catch((e) => { console.error(e) })

test('invalid API context in JWT', async t => {
  const validate = apiContextValidationFunction('/test')
  const Error = new ByuJwtError(BYU_JWT_ERROR_CODES.invalidApiContext, 'Invalid API context in JWT')
  assert.throws(() => {
    validate(decodedJwt)
  }, Error)
}).catch((e) => { console.error(e) })

test('invalid audience in JWT', async t => {
  const validate = apiContextValidationFunction('/echo')
  const Error = new ByuJwtError(BYU_JWT_ERROR_CODES.invalidAudience, 'Invalid aud in JWT')
  assert.throws(() => {
    validate(decodedJwt)
  }, Error)
}).catch((e) => { console.error(e) })

test.todo('will return original instead of current').catch((e) => { console.error(e) })
