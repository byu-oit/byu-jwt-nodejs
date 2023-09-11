import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import type { JwtPayload } from '@byu-oit/jwt'
import {
  ByuJwtAuthenticator,
  type ByuJwtAuthenticatorOptions
} from './ByuJwtAuthenticator.js'

/** Enhance the fastify request with the verified caller information */
declare module 'fastify' {
  interface FastifyRequest {
    caller: JwtPayload | null
  }
}

export interface ByuJwtProviderOptions extends ByuJwtAuthenticatorOptions {
  prefix?: string
}

const ByuJwtProviderPlugin: FastifyPluginAsync<ByuJwtProviderOptions> = async (fastify, options) => {
  const { prefix, ...opts } = options
  const authenticator = new ByuJwtAuthenticator(opts)
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
    if (prefix != null && !route.path.startsWith(prefix)) {
      /** Don't add authentication to routes that don't match the specified prefix */
      return
    }
    /** Else add authentication to routes when no prefix is given or a matched route is registered */

    /** Add pre-handler to existing pre-handlers */
    if (route.preValidation == null) {
      route.preValidation = [ByuJwtAuthenticationHandler]
    } else if (Array.isArray(route.preValidation)) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
