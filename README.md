# byu-jwt

This package provides helpful functions for using validating and using BYU's JWTs.

## Table of Contents

- [API](#api)
    - [Constructor](#constructor)
    - [Authenticate](#authenticate)
    - [Authenticate University API Middleware](#authenticate-university-api-middleware)
    - [Decode JWT](#decode-jwt)
    - [Get OpenID Configuration](#get-openid-configuration)
    - [Get Public Key](#get-public-key)
    - [Verify JWT](#verify-jwt)
    - [Cache Time to Live](#cache-time-to-live)
    - [Static Constants](#static-constants)
- [Testing](#testing)

## API

### Constructor

`ByuJWT ([ options ])`

**Parameters**

- *options* - An `object` that defines the options for this instance of the byu-jwt library:

    | Option | Description | Default |
    | ------ | ----------- | ------- |
    | basePath | A `string` that the JWT's API context must begin with. This validates that the JWT came from a server that starts with this path. | `""` |
    | cacheTTL | The `number` of minutes to cache the OpenID configuration for. | `10` |
    | development | A `boolean` then when set to `true` will bypass JWT validation. This cannot be set to `true` when the `NODE_ENV` environment variable is set to `"production"`. Also, when set to `true` expect to see a lot of warning message on your console. | `false` |

**Returns** an instance of the [ByuJWT](#constructor)

### Authenticate

Check the headers to see if the requester is authenticated.

`ByuJWT.prototype.authenticate ( headers )`

**Parameters**

- *headers* - An `object` representing the header names and values. This method is looking specifically for two headers:

    1. `x-jwt-assertion` is a header that contains the JWT for the current client.

    2. `x-jwt-assertion-original` is a header that contains the JWT for the original requester. This value should be set if a client is making an authenticated request on behalf of a different client.

**Returns** a promise that, if authenticated, resolves to an object with some of these properties:

- *current* - The current client's [decoded JWT](#decode-jwt).

- *original* - The original client's [decoded JWT](#decode-jwt). This property may not be defined.

- *originalJWT* - The JWT string provided by the original requester, or if that doesn't exist then of the current client.

- *claims* - A [decoded JWT's](#decode-jwt) primary claim, prioritied in this order:

    1. Original resource owner
    2. Current resource owner
    3. Original client
    4. Current client

### Authenticate University API Middleware

A middleware that will check if the request has authentication and will either add the property `verifiedJWTs` to the request or will respond to the request with a `401` or `500` response code.

`ByuJWT.prototype.authenticateUAPIMiddleware`

**Parameters**

- *req* - The request object.

- *res* - The response object.

- *next* - The next function.

**Returns** `undefined`

```js
const express = require('express')
const byuJwt = require('byu-jwt')()

const app = express()

app.use(byuJwt.authenticateUAPIMiddleware)

const listener = app.listen(3000, err => {
    if (err) {
        console.error(err.stack)
    } else {
        console.log('Server listening on port ' + listener.address().port)
    }
})
```

### Decode JWT

Verify and decode a JWT.

`ByuJWT.prototype.decodeJWT ( jwt )`

**Parameters**

- *jwt* - A JWT `string` to validate and decode.

**Returns** a promise that, if valid, resolves to an object with these properties:

- *client* - An object that contains the client claims. It has the following properties: `byuId`, `claimSource`, `netId`, `personId`, `preferredFirstName`, `prefix`, `restofName`, `sortName`, `subscriberNetId`, `suffix`, `surname`, `surnamePosition`

- *claims* - The primary claims object, prefering resource owner first and client second.

- *raw* - The raw claims aquired by validating the JWT.

- *resourceOwner* - The resource owner claims (if a resource owner is defined). It has the following properties: `byuId`, `netId`, `personId`, `preferredFirstName`, `prefix`, `restofName`, `sortName`, `suffix`, `surname`, `surnamePosition`

- *wso2*- Claims specific to WSO2.It has the following properties: `apiContext`, `application.id`, `application.name`, `application.tier`, `clientId`, `endUser`, `endUserTenantId`, `keyType`, `subscriber`, `tier`, `userType`, `version`

### Get OpenId Configuration

Get the OpenID configuration from the well known url.

`ByuJWT.prototype.getOpenIdConfiguration ()`

**Parameters** None

**Returns** a promise that resolves to the OpenID configuration.

### Get Public Key

Get the public key for the OpenID configuration.

`ByuJWT.prototype.getPublicKey ()`

**Parameters** None

**Returns** a promise that resolves to the public key `string`.

### Verify JWT

Check to see if a JWT is valid.

`ByuJWT.prototype.verifyJWT ( jwt )`

**Parameters**

- *jwt* - A JWT `string` to verify.

**Returns** a promise that resolves to a `boolean`.

### Cache Time to Live

Get or set the cache time to live. The cache only affects how often the OpenID configuration is redownloaded.

```js
const byuJwt = require('byu-jwt')()
byuJWT.cacheTTL = 15                    // set cache to 15 minutes
```

### Static Constants

The following properties are accessible on the ByuJWT object without needing an instantiated object.

- *BYU_JWT_HEADER_CURRENT* - The header name for the current JWT.

- *BYU_JWT_HEADER_ORIGINAL* - The header name for the original JWT.

- *AuthenticationError* - A reference to the AuthenticationError constructor.

- *JsonWebTokenError* - A reference to the JsonWebTokenError constructor.

- *NotBeforeError* - A reference to the NotBeforeError constructor.

- *TokenExpiredError* - A reference to the TokenExpiredError constructor.

```js
const ByuJWT = require('byu-jwt')
console.log(ByuJWT.BYU_JWT_HEADER_CURRENT)  // "x-jwt-assertion"
```

## Testing

To test this library:

1. Run `npm install`

2. Run `awslogin` (https://github.com/byu-oit/awslogin)

3. Run `npm test`