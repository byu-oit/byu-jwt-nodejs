# `@byu-oit/fastify-jwt`

> Provides a fastify plugin for verifying JWTs at BYU OIT

## Usage

```javascript
import Fastify from 'fastify'
import { ByuLogger } from '@byu-oit/logger'
import { ByuJwtProvider } from '@byu-oit/fastify-jwt'

const logger = ByuLogger()
const fastify = Fastify({ logger })

fastify.register(ByuJwtProvider, {
  /** Only authenticate routes matching this prefix */
  prefix: '/example/v1',
  /** May pass in ByuJwt options from @byu-oit/jwt */
  development: process.env.NODE_ENV === 'development'
})

await fastify.listen({ port: 3000 }).catch(console.error)
```
