/*
 * Copyright 2016 Brigham Young University
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

var Promise = require('bluebird');
var promised_request = Promise.promisify(require('request'));
var jsonwebtoken = require('jsonwebtoken');
var pem = require('pem');


var promisedGetPublicKey = Promise.promisify(pem.getPublicKey);
var wellKnowns = {};

exports.cacheWellknowns = false;

exports.getWellKnown = function(wellKnownURL) {
  if( wellKnowns.hasOwnProperty(wellKnownURL) && exports.cacheWellknowns) {
    return wellKnowns[wellKnownURL].promise;
  }
  else {
    wellKnowns[wellKnownURL] = {};
    var options = {
      url: wellKnownURL,
      method: 'GET'
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
exports.getPublicKey = function(wellKnownURL) {
  return exports.getWellKnown(wellKnownURL)
    .then(function (result) {
        return getPublicKeyUtil(result);
      }
    );
};

function getPublicKeyUtil(wellKnownResult) {
  var openid_configuration = wellKnownResult;
  var jwks_uri = openid_configuration["jwks_uri"];
  algorithms = openid_configuration["id_token_signing_alg_values_supported"];

  var options = {
    url: jwks_uri,
    method: 'GET'
  };

  return promised_request(options)
    .then(function (result) {
      var keys = JSON.parse(result.body).keys;
      var cert = keys[0].x5c[0];

      //format cert
      cert = cert.replace(/(.{64})/g, "$1\n");
      var prefix = "-----BEGIN CERTIFICATE-----\n";
      var postfix = "\n-----END CERTIFICATE-----";
      cert = prefix + cert + postfix;

      //extract public key
      return promisedGetPublicKey(cert);
    });
}

exports.verifyJWT = function (jwt, wellKnownURL) {
  var algorithms;
  return exports.getWellKnown(wellKnownURL)
    .then(function (result) {
      return getPublicKeyUtil(result)
        .then(function (result) {
          var key = result.publicKey;

          //verify jwt and returns decoded jwt
          return jsonwebtoken.verify(jwt, key, {algorithms: algorithms});
        });
    });
};
