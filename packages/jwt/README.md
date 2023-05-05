# `@byu-oit/jwt`

> Provides helpful functions to retrieve a specified BYU .well-known URL and verify BYU signed JWTs.

## Usage

```javascript
import {ByuJwt} from '@byu-oit/jwt'

const byuJwt = new ByuJwt({ issuer: 'https://api.byu.edu' })

const jwt = byuJwt.verify('[your jwt]')

/** Access the jwt payload information */
const { byuId } = jwt.payload

/** Access the jwt header information */
const { alg } = jwt.header
```

> **Note**
> Please refer to the API documentation if you need to see what information is made available in the jwt payload or header.

## Options

| property        | type    | default            | description                                                                                                                                                                                                                                                   |
|-----------------|---------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| basePath        | string  | `undefined`        | will validate that the audience starts with the provided basePath in production.                                                                                                                                                                              |
| cacheDuration   | number  | `60 * 60` (1 hour) | the default cache duration in seconds if one isn't provided by the max-age header for the certs or openid configuration                                                                                                                                       |
| development     | boolean | false              | skips JWT verification for development purposes but will throw an error if NODE_ENV is set to `production`                                                                                                                                                    |
| issuer          | string  | `undefined`        | The OAuth Provider host, e.g. `https://api.byu.edu`. Either the issuer or the openIdConfigUrl are required but not both.                                                                                                                                      |
| openIdConfigUrl | string  | `undefined`        | Can specify the openIdConfigUrl explicitly if your open id configuration is not located at `/.well-known/openid-configuration`. Overwrites issuer when fetching the OpenID configuration. Either the issuer or the openIdConfigUrl are required but not both. |
