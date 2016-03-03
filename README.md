# byu-jwt
The `byu-jwt` module provides helpful functions to retrieve a specified BYU `.well-known` URL and verify BYU signed JWTs.

## Functions
* getWellKnown
* verifyJWT

## getWellKnown(wellKnownURL)
getWellKnown retrieves the response of the specified `.well-known` URL and if `cachWellKnowns` is set to `true` returns the previously retrieved response in the form of a promise.

## verifyJWT(jwt, wellKnownURL)
verifyJWT uses the URLs and values found from the specified `.well-known` URL to verify and decode the provided signed JWT.

## cacheWellknowns
cacheWellknowns is a boolean variable provided to set whether to cache the response of previously requested `.well-known` URLs.