# byu-jwt
The *byu-jwt* module provides helpful functions to retrieve a specified BYU *.well-known* URL and verify BYU signed JWTs.

## API

### JWT Header Names
BYU's API Manager creates an HTTP header that contains a signed JWT(https://jwt.io). The names of the designed BYU signed headers can be referenced here for lookup convenience.
#### BYU_JWT_HEADER_CURRENT
The property containing the name of the HTTP header that contains the BYU signed JWT sent directly from BYU's API Manager.

Value is `X-JWT-Assertion`.

**Example**

The example uses the property to retrieve the header from the request.

```js
const byuJwt          = require('byu-jwt');
...
var current_jwt = req.headers[byuJwt.BYU_JWT_HEADER_CURRENT];
byuJwt.verifyJWT(current_jwt,'http://the-wellknown-url.com');
```

#### BYU_JWT_HEADER_ORIGINAL
The property containing the name of the HTTP header that contains the BYU signed JWT forwarded on from a service that received the BYU signed JWT sent directly from BYU's API Manager.

Value is `X-JWT-Assertion-Original`.

**Example**

The example uses the property to retrieve the header from the request.

```js
const byuJwt          = require('byu-jwt');
...
var original_jwt = req.headers[byuJwt.BYU_JWT_HEADER_ORIGINAL];
byuJwt.verifyJWT(current_jwt,'http://the-wellknown-url.com');
```

### cacheWellknowns

A property that can be set to enable or disable caching of the responses from well known URLs.

Defaults to `false`.

**Example**

The example will set the module to cache well known URL responses:

```js
const byuJwt = require('byu-jwt');
byuJwt.cacheWellknowns = true;
```

### getWellKnown ( wellKnownURL : string ) : Promise\<object\>

Get the response of the specified *.well-known* URL. If *cacheWellKnowns* is set to `true` then it returns the previously retrieved response.

**Parameters**

- **wellKnownUrl** - The URL to use to get the well known information.

**Returns** a promise that resolves to an object. The object is the parsed JSON response from the well known URL.

**Example**

```js
const byuJwt = require('byu-jwt');
byuJwt.getWellKnown('http://the-wellknown-url.com')
    .then(function(wellKnownObject) {
        console.log('Response:', wellKnownObject);
    });
```

### getPublicKey ( wellKnownURL : string ) : Promise\<string\>

Get the PEM formatted X509 certificate.

**Parameters**

- **wellKnownUrl** - The URL to use to get the well known information.

**Returns** a promise that resolves a string.

**Example**

```js
const byuJwt = require('byu-jwt');
byuJwt.getPublicKey('http://the-wellknown-url.com')
    .then(function(publicKey) {
        console.log('Response:', publicKey);
    });
```

### verifyJWT ( jwt : string, wellKnownURL : string ) : Promise\<object\>

Verify and decode the signed JWT.

**Parameters**

- **jwt** - The signed JWT.
- **wellKnownUrl** - The URL to use to get the well known information.

**Returns** a promise that resolves an object.

### jwtDecoded( jwt : string, wellKnownURL : string) : Promise\<object\>

Verifies and decodes the signed JWT and then formats it to provide easier access to important properties within the JWT.

**Parameters**

- **jwt** - The signed JWT.
- **wellKnownUrl** - The URL to use to get the well known information.

**Returns** a promise that resolves to an object. The object will have many properties, but the most relevant will have the following structure:

```js
{
    byu: {
        client: {
            byuId: string,
            claimSource: string,
            netId: string,
            personId: string,
            preferredFirstName: string,
            prefix: string,
            restOfName: string,
            sortName: string,
            subscriberNetId: string,
            suffix: string,
            surname: string,
            surnamePosition: string
        },
        resourceOwner: {                    // only set if resource owner exists
            byuId: string,
            netId: string,
            personId: string,
            preferredFirstName: string,
            prefix: string,
            restOfName: string,
            sortName: string,
            suffix: string,
            surname: string,
            surnamePosition: string
        },
        webresCheck: {
            byuId: string,
            netId: string,
            personId: string,
        }
    },
    wso2: {
        apiContext: string,
        application: {
            id: string,
            name: string,
            tier: string
        },
        clientId: string,
        endUser: string,
        endUserTenantId: string,
        keyType: string,
        subscriber: string,
        tier: string,
        userType: string,
        version: string
    }
}
```

**Example**

```js
const byuJwt = require('byu-jwt');

byuJwt.jwtDecoded('ey...gQ', 'http://the-wellknown-url.com')
    .then(function(decoded) {
        console.log(decoded.byu.client_byu_id); // example output: '123456789'
    });
```
