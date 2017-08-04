# byu-jwt
The *byu-jwt* module provides helpful functions to retrieve a specified BYU *.well-known* URL and verify BYU signed JWTs.

## API

### JWT Header Names
BYU's API Manager creates an HTTP header that contains a signed JWT(https://jwt.io). The names of the designed BYU signed headers can be referenced here for lookup convenience.

<i>Note: The values of the headers are in lowercase because Node.js converts the headers by convention.</i>

[https://github.com/nodejs/node-v0.x-archive/issues/1954](https://github.com/nodejs/node-v0.x-archive/issues/1954)
[https://nodejs.org/api/http.html#http_response_getheaders](https://nodejs.org/api/http.html#http_response_getheaders)
#### BYU_JWT_HEADER_CURRENT
The property containing the name of the HTTP header that contains the BYU signed JWT sent directly from BYU's API Manager.

Value is `x-jwt-assertion`.

**Example**

The example uses the property to retrieve the header from the request.

```js
const byuJwt          = require('byu-jwt');
...
var current_jwt = req.headers[byuJwt.BYU_JWT_HEADER_CURRENT];
byuJwt.verifyJWT(current_jwt, 'http://the-wellknown-url.com');
```

#### BYU_JWT_HEADER_ORIGINAL
The property containing the name of the HTTP header that contains the BYU signed JWT forwarded on from a service that received the BYU signed JWT sent directly from BYU's API Manager.

Value is `x-jwt-assertion-original`.

**Example**

The example uses the property to retrieve the header from the request.

```js
const byuJwt          = require('byu-jwt');
...
var original_jwt = req.headers[byuJwt.BYU_JWT_HEADER_ORIGINAL];
byuJwt.verifyJWT(current_jwt, 'http://the-wellknown-url.com');
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

### AuthenticationError

An error type that inherits from standard Error. Used in **authenticate** function.

**Example**

The example will throw an AuthenticationError and then immediately catch it:

```js
const byuJwt = require('byu-jwt');
const AuthenticationError= byuJwt.AuthenticationError;

try {
    throw new AuthenticationError('No expected JWTs found'));
} catch (e) {
    if (e instanceof AuthenticationError) {
        // Do something (send 401 status?)
    } else {
        // Do something else
    }
}
```

### JsonWebTokenError, NotBeforeError, and TokenExpiredError

Exposed error types from [the jsonwebtoken npm package](https://www.npmjs.com/package/jsonwebtoken#errors--codes) that also inherit from standard Error.

**Example**

The example will throw an JsonWebTokenError and then immediately catch it:

```js
const byuJwt = require('byu-jwt');
const JsonWebTokenError= byuJwt.JsonWebTokenError;

try {
    throw new JsonWebTokenError('expired jwt'));
} catch (e) {
    if (e instanceof JsonWebTokenError) {
        // Do something
    } else {
        // Do something else
    }
}
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

### jwtDecoded( jwt : string, wellKnownURL : string ) : Promise\<object\>

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

### authenticate( headers : object, wellKnownURL : string, [optional] basePath : string ) : Promise\<object\>

Verifies and decodes the signed JWT and then formats it to provide easier access to important properties within the JWT.

**Parameters**

- **headers** - The headers. An object that looks like:
```js
{
    'x-jwt-assertion': 'ey...gQ'
}
```
- **wellKnownUrl** - The URL to use to get the well known information.
- **basePath** - (Optional) The base path to compare with API context found in JWT sent from BYU's API manager.

**Returns** a promise that resolves to an object or rejects with an **AuthenticationError**. The object will have the following structure:

```js
{
    current: {
        /* The object returned by running jwtDecoded on current JWT */
    },

    // Only set if we have an original in addition to a current JWT
    original: { 
        /* The object returned by running jwtDecoded on original JWT */
    },
    
    originalJwt: 'ey...gQ', // Here for convenience in passing it along
    prioritizedClaims: {
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
    }
}
```

**Example**

```js
const byuJwt = require('byu-jwt');

const headers = {
    'x-jwt-assertion': 'ey...gQ',
    'x-jwt-assertion-original': 'ey...gQ'
}

byuJwt.authenticate(headers, 'http://the-wellknown-url.com')
    .then(function(verifiedJwts) {
        console.log(verifiedJwts.originalJwt); // example output: 'ey...gQ'
        console.log(verifiedJwts.prioritizedClaims);
        /**
         *  example output:
         *  {
         *      byuId: string,
         *      netId: string,
         *      personId: string,
         *      preferredFirstName: string,
         *      prefix: string,
         *      restOfName: string,
         *      sortName: string,
         *      suffix: string,
         *      surname: string,
         *      surnamePosition: string
         *  }
         **/
    });
```

###Use in tests
For use in tests (like mocha tests), you can set the environment variable __NODE_ENV__ to `mock`. This will bypass the verifying of the JWT string parameter and simply decode it in **jwtDecoded**. Similarly, this will bypass the verifying of JWTs and basePath checking in **authenticate**.

**Example (snippet)**
```js
  it('decode JWT without verifying', function (done) {
    process.env.NODE_ENV = 'mock';
    //to run test case capture a jwt and copy in the function invokation below.
    byuJwt.jwtDecoded('ey...gQ', 'http://the-wellknown-url.com')
      .then(function (jwtDecoded) {
        try {
          assert.equal(jwtDecoded.byu.client.netId, '');
          done()
        }
        catch (e) {
          console.log(e);
          done(e);
        }
      })
      .catch(function (e) {
        console.log(e);
        done(e);
      });
  });
```
Note: Be sure to unset the environment variable for tests run after this test.