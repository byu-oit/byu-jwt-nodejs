import test from 'node:test'
import assert from 'node:assert'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import ByuJwtProvider, { type ByuJwtError } from '../src/index.js'
import { expiredJwt, decodedJwt } from './assets/jwt.js'
import { apiContextValidationFunction } from '../src/index.js'

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
})

test('cannot fetch key', async t => {
  const fastify = Fastify()
  await fastify.register(ByuJwtProvider, { issuer, basePath: '/test' })
  fastify.get('/', (request) => request.caller)
  const result = await fastify.inject({ url: '/', headers: { 'x-jwt-assertion': expiredJwt } }).then(res => res.json())
  assert.strictEqual(result.message, 'Cannot fetch key.')
})

test('missing expected JWT', async t => {
  const fastify = Fastify()
  fastify.setErrorHandler(errorHandler)
  await fastify.register(ByuJwtProvider, { issuer, development })
  fastify.get('/', () => true)
  const result = await fastify.inject('/').then(res => res.json<ByuJwtError>())
  assert.strictEqual(result.message, 'Missing expected JWT')
})

test('invalid API context in JWT', async t => {
  const validate = apiContextValidationFunction('/test')
  assert.throws(() => {
    validate(decodedJwt)
  }, { instanceOf: Error, message: 'Invalid API context in JWT' })
})

test('invalid audience in JWT', async t => {
  const validate = apiContextValidationFunction('/echo')
  assert.throws(() => {
    validate(decodedJwt)
  }, { instanceOf: Error, message: 'Invalid aud in JWT' })
})

test.todo('will return original instead of current')
