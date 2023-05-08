import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import type { ByuJwtOptions, JwtPayload } from '@byu-oit/jwt'
import { ByuJwtAuthenticator } from './ByuJwtAuthenticator.js'

/** Enhance the fastify request with the verified caller information */
declare module 'fastify' {
  interface FastifyRequest {
    caller: JwtPayload | null
  }
}

export interface ByuJwtProviderOptions extends ByuJwtOptions {
  prefix?: string
}

const ByuJwtProviderPlugin: FastifyPluginAsync<ByuJwtProviderOptions> = async (fastify, options) => {
  const authenticator = new ByuJwtAuthenticator(options)

  async function ByuJwtAuthenticationHandler (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      request.caller = await authenticator.authenticate(request.headers)
    } catch (err) {
      void reply.code(401)
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
    if (route.preValidation == null) {
      route.preValidation = [ByuJwtAuthenticationHandler]
    } else if (Array.isArray(route.preValidation)) {
      route.preValidation.push(ByuJwtAuthenticationHandler)
    } else {
      route.preValidation = [route.preValidation, ByuJwtAuthenticationHandler]
    }
  })
}

export default fp(ByuJwtProviderPlugin, {
  name: '@byu-oit/fastify-jwt',
  fastify: '4.x'
})
