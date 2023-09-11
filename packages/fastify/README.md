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
  development: process.env.NODE_ENV === 'development',
  /** May pass in ByuJwt options from @byu-oit/jwt */
  byuJwtOptions: {
    issuer: 'https://api.byu.edu',
    additionalValidations: [() => {
      if(false) throw new Error('This will never happen')
    }] 
  }
  
})

await fastify.listen({ port: 3000 }).catch(console.error)
```

## Options

| property              | type    | default     | description                                                                                                                                                                                       |
|-----------------------|---------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| prefix                | string  | `undefined` | Will only authenticate routes matching this prefix.                                                                                                                                               |
| development           | boolean | false       | skips JWT verification for development purposes but will throw an error if NODE_ENV is set to `production`.                                                                                       |
| basePath              | string  | `undefined` | will validate that the audience starts with the provided basePath in production.                                                                                                                  |
| byuJwtOptions         | object  | `undefined` | an object that contains any ByuJwt options passed in. See the [BYU JWT](https://byu-oit.github.io/byu-jwt-nodejs/modules/BYU_JWT.html#md:options) Documentation for a full list of those options. |
