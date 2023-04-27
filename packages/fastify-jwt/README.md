# `@byu-oit/fastify-jwt`

> Provides a fastify plugin for verifying JWTs

## Usage

```javascript
import Fastify from 'fastify'
import {ByuLogger} from '@byu-oit/logger'
import {ByuJwtProvider} from '@byu-oit/fastify-jwt'

const logger = ByuLogger()
const fastify = Fastify({logger})

/** May pass in ByuJwt options as the second parameter */
fastify.register(ByuJwtProvider/*, { development: process.env.NODE_ENV === 'development' } */)

fastify.listen({ port: 3000 }).catch(console.error)
```
