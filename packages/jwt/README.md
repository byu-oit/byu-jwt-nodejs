# `@byu-oit/jwt`

> Provides helpful functions to retrieve a specified BYU .well-known URL and verify BYU signed JWTs.

## Usage

```javascript
import { ByuJwt } from '@byu-oit/jwt'

const byuJwt = new ByuJwt({ issuer: 'https://api.byu.edu' })

const jwt = byuJwt.verify('[your jwt]')

/** Access the jwt payload information */
const { byuId } = jwt.payload

/** Access the jwt header information */
const { alg } = jwt.header
```

> **Note**
> Please refer
> to [the API documentation](https://byu-oit.github.io/byu-jwt-nodejs) if you need
> to see what information is made available in
> the [jwt payload](https://byu-oit.github.io/byu-jwt-nodejs/classes/BYU_JWT.JwtPayload.html)
> or [header](https://byu-oit.github.io/byu-jwt-nodejs/classes/BYU_JWT.JwtHeader.html).

## Options

| property              | type    | default            | description                                                                                                                                                                                                                        |
|-----------------------|---------|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| issuer                | string  | `undefined`        | The OAuth Provider host, e.g. `https://api.byu.edu`. Either the issuer or the discoveryEndpoint are required but not both. If the discoveryEndpoint is not provided, the issuer will be used to specify the open id configuration. |
| discoveryEndpoint     | string  | `undefined`        | Can specify the discoveryEndpoint explicitly if your open id configuration is not located at `/.well-known/openid-configuration`. Either the issuer or the discoveryEndpoint are required but not both.                            |
| key                   | string  | `undefined`        | A JWK in the form of a PEM Certificate that will be used to verify the JWT.                                                                                                                                                        |
| additionalValidations | array   | `undefined`        | An array of additional validation functions that can be run when `verify()` is called. Each function should accept a decoded jwt as its parameter, throw an error if the validation fails, and return void if it succeeds.         |
> There are additional options that can be passed in that are all listed under the fast-jwt [VerifierOptions](https://nearform.github.io/fast-jwt/docs/api/interfaces/VerifierOptions) properties. Descriptions of these properties can be found [here](https://nearform.github.io/fast-jwt/#createverifier).
