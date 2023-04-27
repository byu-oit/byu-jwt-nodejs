import { type FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { type ByuJwtOptions, type JwtPayload } from '@byu-oit/jwt'
import { ByuJwtAuthenticator } from './ByuJwtAuthenticator.js'

/** Enhance the fastify request with the verified caller information */
declare module 'fastify' {
  interface FastifyRequest {
    caller: JwtPayload | null
  }
}

export interface ByuJwtProviderOptions extends ByuJwtOptions {}

const ByuJwtProviderPlugin: FastifyPluginAsync<ByuJwtProviderOptions> = async (fastify, options) => {
  const authenticator = new ByuJwtAuthenticator(options)
  fastify.addHook('onRequest', async (request, reply, done) => {
    request.caller = await authenticator.authenticate(request.headers)
  })
}

export const ByuJwtProvider = fp(ByuJwtProviderPlugin, '4.x')

export default ByuJwtProvider
