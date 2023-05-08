import test from 'ava'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import ByuJwtProvider, { type ByuJwtError } from '../src/index.js'
import { expiredJwt } from './assets/jwt.js'

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
  t.is(result.netId, 'stuft2')
})

test('missing expected JWT', async t => {
  const fastify = Fastify()
  fastify.setErrorHandler(errorHandler)
  await fastify.register(ByuJwtProvider, { issuer, development })
  fastify.get('/', () => true)
  const result = await fastify.inject('/').then(res => res.json<ByuJwtError>())
  t.is(result.message, 'Missing expected JWT')
})
test.todo('invalid API context in JWT')
test.todo('invalid audience in JWT')
test.todo('will return original instead of current')
