import { type FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { type ByuJwtOptions, type JwtPayload } from '@byu-oit/jwt'
import { ByuJwtAuthenticator } from './ByuJwtAuthenticator.js'
import { TokenError } from 'fast-jwt'

/** Enhance the fastify request with the verified caller information */
declare module 'fastify' {
  interface FastifyRequest {
    caller: JwtPayload | null
  }
}

export interface ByuJwtProviderOptions extends ByuJwtOptions {
  /**
   * Formats the error response when authentication fails. The error parameter may be a TokenError or a ByuJwtError,
   * which extends the TokenError by adding additional error codes.
   */
  errorHandler: (error: TokenError) => any
}

const ByuJwtProviderPlugin: FastifyPluginAsync<ByuJwtProviderOptions> = async (fastify, options) => {
  const authenticator = new ByuJwtAuthenticator(options)
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      request.caller = await authenticator.authenticate(request.headers)
    } catch (err) {
      if (err instanceof TokenError) {
        return reply.code(401).send(options.errorHandler(err))
      }
      throw err
    }
  })
}

export const ByuJwtProvider = fp(ByuJwtProviderPlugin, '4.x')

export default ByuJwtProvider
