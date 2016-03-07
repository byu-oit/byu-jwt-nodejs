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

exports.verifyJWT = function (jwt, wellKnownURL) {
  var algorithms;
  return exports.getWellKnown(wellKnownURL)
    .then(function (result) {

      var openid_configuration = result;
      var jwks_uri = openid_configuration["jwks_uri"];
      algorithms = openid_configuration["id_token_signing_alg_values_supported"];

      var options = {
        url: jwks_uri,
        method: 'GET'
      };

      return promised_request(options);
    })
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
      }
    )
    .then(function (result) {
        var key = result.publicKey;

        //verify jwt and returns decoded jwt
        return jsonwebtoken.verify(jwt, key, {algorithms: algorithms});
      }
    );
};
