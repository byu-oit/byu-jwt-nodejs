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
  prefix?: string
}

const ByuJwtProviderPlugin: FastifyPluginAsync<ByuJwtProviderOptions> = async (fastify, options) => {
  const authenticator = new ByuJwtAuthenticator(options)
  fastify.addHook('onRequest', async (request, reply) => {
    if (options.prefix != null) {
      /** The prefix is used to limit the routes that the plugin will be run against */
      const url = new URL(request.url)
      if (!url.pathname.startsWith(options.prefix)) {
        /** The route prefix excludes this request from calling the authentication hook */
        return
      }
    }

    try {
      request.caller = await authenticator.authenticate(request.headers)
    } catch (err) {
      if (err instanceof TokenError) {
        return await reply.code(401).send(options.errorHandler(err))
      }
      throw err
    }
  })
}

export default fp(ByuJwtProviderPlugin, {
  name: '@byu-oit/fastify-jwt',
  fastify: '4.x'
})
