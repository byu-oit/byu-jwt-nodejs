/*
 * Copyright 2017 Brigham Young University
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const Promise = require('bluebird');
const promised_request = Promise.promisify(require('request'));
const jsonwebtoken = require('jsonwebtoken');
const pem = require('pem');

const AuthenticationError = require('./lib/AuthenticationError');
const promisedGetPublicKey = Promise.promisify(pem.getPublicKey);
const wellKnowns = {};

Object.defineProperties(exports, {
  'BYU_JWT_HEADER_CURRENT': {
    value: 'x-jwt-assertion',
    writable: false
  },
  'BYU_JWT_HEADER_ORIGINAL': {
    value: 'x-jwt-assertion-original',
    writable: false
  },
  'cacheWellknowns': {
    value: false,
    writable: true
  },
  'AuthenticationError': {
    value: AuthenticationError,
    writable: false
  },
  'JsonWebTokenError': {
    value: jsonwebtoken.JsonWebTokenError,
    writable: false
  },
  'NotBeforeError': {
    value: jsonwebtoken.NotBeforeError,
    writable: false
  },
  'TokenExpiredError': {
    value: jsonwebtoken.TokenExpiredError,
    writable: false
  },
});

exports.getWellKnown = function (wellKnownURL) {
  if (wellKnowns.hasOwnProperty(wellKnownURL) && exports.cacheWellknowns) {
    return wellKnowns[wellKnownURL].promise;
  }
  else {
    wellKnowns[wellKnownURL] = {};
    const options = {
      url: wellKnownURL,
      method: 'GET',
      headers: {
        'User-Agent': 'BYU-JWT-Node-SDK/1.0 (' + process.version + ')'
      }
    };

    wellKnowns[wellKnownURL].promise = promised_request(options)
      .then(function (result) {
          wellKnowns[wellKnownURL].openid_configuration = JSON.parse(result.body);
          return wellKnowns[wellKnownURL].openid_configuration;
        }
      );
    return wellKnowns[wellKnownURL].promise;
  }
};

// Just return the public key.
exports.getPublicKey = function (wellKnownURL) {
  return exports.getWellKnown(wellKnownURL)
    .then(function (result) {
        return getPublicKeyUtil(result);
      }
    );
};

function getPublicKeyUtil(wellKnownResult) {
  const openid_configuration = wellKnownResult;
  const jwks_uri = openid_configuration.jwks_uri;
  algorithms = openid_configuration.id_token_signing_alg_values_supported;

  const options = {
    url: jwks_uri,
    method: 'GET'
  };

  return promised_request(options)
    .then(function (result) {
      const keys = JSON.parse(result.body).keys;
      let cert = keys[0].x5c[0];

      //format cert
      cert = cert.replace(/(.{64})/g, '$1\n');
      const prefix = '-----BEGIN CERTIFICATE-----\n';
      const postfix = '\n-----END CERTIFICATE-----';
      cert = prefix + cert + postfix;

      //extract public key
      return promisedGetPublicKey(cert);
    });
}

/**
 * @param jwt
 * @param wellKnownURL
 * @returns {*}
 */
exports.verifyJWT = function (jwt, wellKnownURL) {
  if (process.env.NODE_ENV === 'mock') {
    return new Promise.resolve(jsonwebtoken.decode(jwt));
  }
  else {
    var algorithms;
    return exports.getWellKnown(wellKnownURL)
      .then(getPublicKeyUtil)
      .then(function (result) {
        return new Promise(function (resolve, reject) {
          const key = result.publicKey;
          return jsonwebtoken.verify(jwt, key, {algorithms: algorithms}, function (err, decoded) {
            if (err) return reject(err);
            resolve(decoded);
          });
        });
      });
  }
};

/**
 * @param jwt
 * @param wellKnownURL
 */
exports.jwtDecoded = function (jwt, wellKnownURL) {
  return exports.verifyJWT(jwt, wellKnownURL)
    .then(function (jwtDecoded) {
      const hasResourceOwner = typeof jwtDecoded['http://byu.edu/claims/resourceowner_byu_id'] !== 'undefined';

      jwtDecoded.byu = {};

      jwtDecoded.byu.client = {
        byuId:              jwtDecoded['http://byu.edu/claims/client_byu_id'],
        claimSource:        jwtDecoded['http://byu.edu/claims/client_claim_source'],
        netId:              jwtDecoded['http://byu.edu/claims/client_net_id'],
        personId:           jwtDecoded['http://byu.edu/claims/client_person_id'],
        preferredFirstName: jwtDecoded['http://byu.edu/claims/client_preferred_first_name'],
        prefix:             jwtDecoded['http://byu.edu/claims/client_name_prefix'],
        restOfName:         jwtDecoded['http://byu.edu/claims/client_rest_of_name'],
        sortName:           jwtDecoded['http://byu.edu/claims/client_sort_name'],
        subscriberNetId:    jwtDecoded['http://byu.edu/claims/client_subscriber_net_id'],
        suffix:             jwtDecoded['http://byu.edu/claims/client_name_prefix'],
        surname:            jwtDecoded['http://byu.edu/claims/client_surname'],
        surnamePosition:    jwtDecoded['http://byu.edu/claims/client_surname_position']
      };

      if (hasResourceOwner) {
        jwtDecoded.byu.resourceOwner = {
          byuId:              jwtDecoded['http://byu.edu/claims/resourceowner_byu_id'],
          netId:              jwtDecoded['http://byu.edu/claims/resourceowner_net_id'],
          personId:           jwtDecoded['http://byu.edu/claims/resourceowner_person_id'],
          preferredFirstName: jwtDecoded['http://byu.edu/claims/resourceowner_preferred_first_name'],
          prefix:             jwtDecoded['http://byu.edu/claims/resourceowner_prefix'],
          restOfName:         jwtDecoded['http://byu.edu/claims/resourceowner_rest_of_name'],
          sortName:           jwtDecoded['http://byu.edu/claims/resourceowner_sort_name'],
          suffix:             jwtDecoded['http://byu.edu/claims/resourceowner_suffix'],
          surname:            jwtDecoded['http://byu.edu/claims/resourceowner_surname'],
          surnamePosition:    jwtDecoded['http://byu.edu/claims/resourceowner_surname_position']
        };
      }

      const webresCheckKey = hasResourceOwner ? 'resourceOwner' : 'client';
      jwtDecoded.byu.webresCheck = {
        byuId:    jwtDecoded.byu[webresCheckKey].byuId,
        netId:    jwtDecoded.byu[webresCheckKey].netId,
        personId: jwtDecoded.byu[webresCheckKey].personId
      };

      jwtDecoded.wso2 = {
        apiContext:       jwtDecoded['http://wso2.org/claims/apicontext'],
        application: {
          id:             jwtDecoded['http://wso2.org/claims/applicationid'],
          name:           jwtDecoded['http://wso2.org/claims/applicationname'],
          tier:           jwtDecoded['http://wso2.org/claims/applicationtier']
        },
        clientId:         jwtDecoded['http://wso2.org/claims/client_id'],
        endUser:          jwtDecoded['http://wso2.org/claims/enduser'],
        endUserTenantId:  jwtDecoded['http://wso2.org/claims/enduserTenantId'],
        keyType:          jwtDecoded['http://wso2.org/claims/keytype'],
        subscriber:       jwtDecoded['http://wso2.org/claims/subscriber'],
        tier:             jwtDecoded['http://wso2.org/claims/tier'],
        userType:         jwtDecoded['http://wso2.org/claims/usertype'],
        version:          jwtDecoded['http://wso2.org/claims/version']
      };

      return jwtDecoded;
    });
};

/**
 * @param headers
 * @param wellKnownURL
 * @param [basePath]
 */
exports.authenticate = function validateJWTsFromHeaders(headers, wellKnownURL, basePath) {
  const jwtPromises = [];

  if (headers[exports.BYU_JWT_HEADER_ORIGINAL]) {
    const originalJwt = headers[exports.BYU_JWT_HEADER_ORIGINAL];
    jwtPromises.push(exports.jwtDecoded(originalJwt, wellKnownURL));
  }
  if (headers[exports.BYU_JWT_HEADER_CURRENT]) {
    const currentJwt = headers[exports.BYU_JWT_HEADER_CURRENT];
    jwtPromises.push(exports.jwtDecoded(currentJwt, wellKnownURL));
  }

  // If this came through WSO2, the request should have at least one of these
  if (jwtPromises.length === 0) {
    return Promise.reject(new AuthenticationError('No expected JWTs found'));
  }

  return Promise.settle(jwtPromises)
    .then(verifiedResults => {
      const verifiedJwts = {};

      // Check that they're valid JWTs
      const currentJwtIndex = verifiedResults.length > 1 ? 1 : 0;
      const currentJwtResult = verifiedResults[currentJwtIndex]._settledValue();
      if (verifiedResults[currentJwtIndex].isFulfilled()) {
        verifiedJwts.current = currentJwtResult;
      } else if (currentJwtResult instanceof jsonwebtoken.TokenExpiredError) {
        throw new AuthenticationError('Expired JWT', currentJwtResult);
      } else {
        throw new AuthenticationError('Invalid JWT', currentJwtResult);
      }

      if (verifiedResults.length > 1) {
        const originalJwtResult = verifiedResults[0]._settledValue();
        if (verifiedResults[0].isFulfilled()) {
          verifiedJwts.original = originalJwtResult;
        } else if (originalJwtResult instanceof jsonwebtoken.TokenExpiredError) {
          throw new AuthenticationError('Expired Original JWT', originalJwtResult);
        } else {
          throw new AuthenticationError('Invalid Original JWT', originalJwtResult);
        }
      }

      // Check that user is calling our API and not just reusing a JWT obtained elsewhere
      if (basePath && typeof basePath === 'string') {
        if (process.env.NODE_ENV !== 'mock') { // To skip this check when testing
          const context_from_current_jwt = verifiedJwts.current['http://wso2.org/claims/apicontext'];
          if (!context_from_current_jwt.startsWith(basePath)) {
            throw new AuthenticationError('Invalid API context in JWT.');
          }
        }
      }

      // For convenience
      verifiedJwts.originalJwt = headers[exports.BYU_JWT_HEADER_ORIGINAL] || headers[exports.BYU_JWT_HEADER_CURRENT];
      verifiedJwts.prioritizedClaims = getPrioritizedClaims(verifiedJwts);

      return verifiedJwts;
    });
};

/**
 * Returns one of the following claims objects, in order of precedence:
 *   1) Original Resource Owner
 *   2) Current Resource Owner
 *   3) Original Client
 *   4) Current Client
 */
function getPrioritizedClaims(verifiedJwts) {
  if (verifiedJwts.original && verifiedJwts.original.byu.resourceOwner) return verifiedJwts.original.byu.resourceOwner;
  if (verifiedJwts.current && verifiedJwts.current.byu.resourceOwner) return verifiedJwts.current.byu.resourceOwner;
  if (verifiedJwts.original && verifiedJwts.original.byu.client) return verifiedJwts.original.byu.client;
  return verifiedJwts.current.byu.client;
}
