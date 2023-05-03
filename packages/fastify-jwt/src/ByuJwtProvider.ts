import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import type { ByuJwtOptions, JwtPayload } from '@byu-oit/jwt'
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
  prefix?: string
}

const ByuJwtProviderPlugin: FastifyPluginAsync<ByuJwtProviderOptions> = async (fastify, options) => {
  const authenticator = new ByuJwtAuthenticator(options)

  async function preHandler (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      request.caller = await authenticator.authenticate(request.headers)
    } catch (err) {
      if (err instanceof TokenError) {
        await reply.code(401).send(options.errorHandler(err))
        return
      }
      throw err
    }
  }

  /**
   * Any routes created after this plugin is registered will add the authentication pre-handler, if the route falls
   * under the specified prefix.
   */
  fastify.addHook('onRoute', (route) => {
    const foundPrefix = options.prefix != null
    const matchesRoute = route.prefix === options.prefix
    if (foundPrefix && !matchesRoute) {
      /** Don't add authentication to routes that don't match the specified prefix */
      return
    }
    /** Else add authentication to routes when no prefix is given or a matched route is registered */

    /** Add pre-handler to existing pre-handlers */
    if (route.preHandler == null) {
      route.preHandler = [preHandler]
    } else if (Array.isArray(route.preHandler)) {
      route.preHandler.push(preHandler)
    } else {
      route.preHandler = [route.preHandler, preHandler]
    }
  })
}

export default fp(ByuJwtProviderPlugin, {
  name: '@byu-oit/fastify-jwt',
  fastify: '4.x'
})
