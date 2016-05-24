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

/**
 * @param jwt
 * @param wellKnownURL
 * @returns {*}
 */
exports.verifyJWT = function (jwt, wellKnownURL) {
    var algorithms;
    return exports.getWellKnown(wellKnownURL)
        .then(getPublicKeyUtil)
        .then(function (result) {
            return new Promise(function(resolve, reject) {
                var key = result.publicKey;
                return jsonwebtoken.verify(jwt, key, {algorithms: algorithms}, function(err, decoded) {
                    if (err) return reject(err);
                    resolve(decoded);
                });
            });
        });
};

/**
 * @param jwt
 * @param wellKnownURL
 */
exports.jwtDecoded = function (jwt, wellKnownURL)
{
    return exports.verifyJWT(jwt, wellKnownURL)
        .then(function (jwtDecoded)
        {
            jwtDecoded.byu={};
            jwtDecoded.byu.client_byu_id               = jwtDecoded['http://byu.edu/claims/client_byu_id'               ];
            jwtDecoded.byu.client_claim_source         = jwtDecoded['http://byu.edu/claims/client_claim_source'         ];
            jwtDecoded.byu.client_name_prefix          = jwtDecoded['http://byu.edu/claims/client_name_prefix'          ];
            jwtDecoded.byu.client_name_suffix          = jwtDecoded['http://byu.edu/claims/client_name_suffix'          ];
            jwtDecoded.byu.client_net_id               = jwtDecoded['http://byu.edu/claims/client_net_id'               ];
            jwtDecoded.byu.client_person_id            = jwtDecoded['http://byu.edu/claims/client_person_id'            ];
            jwtDecoded.byu.client_preferred_first_name = jwtDecoded['http://byu.edu/claims/client_preferred_first_name' ];
            jwtDecoded.byu.client_rest_of_name         = jwtDecoded['http://byu.edu/claims/client_rest_of_name'         ];
            jwtDecoded.byu.client_sort_name            = jwtDecoded['http://byu.edu/claims/client_sort_name'            ];
            jwtDecoded.byu.client_subscriber_net_id    = jwtDecoded['http://byu.edu/claims/client_subscriber_net_id'    ];
            jwtDecoded.byu.client_surname              = jwtDecoded['http://byu.edu/claims/client_surname'              ];
            jwtDecoded.byu.client_surname_position     = jwtDecoded['http://byu.edu/claims/client_surname_position'     ];
            if(typeof jwtDecoded['http://byu.edu/claims/resourceowner_byu_id'] !== "undefined")
            {
                jwtDecoded.byu.resourceowner_byu_id              =jwtDecoded['http://byu.edu/claims/resourceowner_byu_id'               ];
                jwtDecoded.byu.resourceowner_net_id              =jwtDecoded['http://byu.edu/claims/resourceowner_net_id'               ];
                jwtDecoded.byu.resourceowner_person_id           =jwtDecoded['http://byu.edu/claims/resourceowner_person_id'            ];
                jwtDecoded.byu.resourceowner_preferred_first_name=jwtDecoded['http://byu.edu/claims/resourceowner_preferred_first_name' ];
                jwtDecoded.byu.resourceowner_prefix              =jwtDecoded['http://byu.edu/claims/resourceowner_prefix'               ];
                jwtDecoded.byu.resourceowner_rest_of_name        =jwtDecoded['http://byu.edu/claims/resourceowner_rest_of_name'         ];
                jwtDecoded.byu.resourceowner_sort_name           =jwtDecoded['http://byu.edu/claims/resourceowner_sort_name'            ];
                jwtDecoded.byu.resourceowner_suffix              =jwtDecoded['http://byu.edu/claims/resourceowner_suffix'               ];
                jwtDecoded.byu.resourceowner_surname             =jwtDecoded['http://byu.edu/claims/resourceowner_surname'              ];
                jwtDecoded.byu.resourceowner_surname_position    =jwtDecoded['http://byu.edu/claims/resourceowner_surname_position'     ];
                jwtDecoded.byu.webres_check_byu_id    = jwtDecoded.byu.resourceowner_byu_id;
                jwtDecoded.byu.webres_check_net_id    = jwtDecoded.byu.resourceowner_net_id;
                jwtDecoded.byu.webres_check_person_id = jwtDecoded.byu.resourceowner_person_id;
            }
            else
            {
                jwtDecoded.byu.webres_check_byu_id    = jwtDecoded.byu.client_byu_id;
                jwtDecoded.byu.webres_check_net_id    = jwtDecoded.byu.client_net_id;
                jwtDecoded.byu.webres_check_person_id = jwtDecoded.byu.client_person_id;
            }
            jwtDecoded.wso2=
            {
                apicontext      :jwtDecoded["http://wso2.org/claims/apicontext"      ],
                applicationid   :jwtDecoded["http://wso2.org/claims/applicationid"   ],
                applicationname :jwtDecoded["http://wso2.org/claims/applicationname" ],
                applicationtier :jwtDecoded["http://wso2.org/claims/applicationtier" ],
                client_id       :jwtDecoded["http://wso2.org/claims/client_id"       ],
                enduser         :jwtDecoded["http://wso2.org/claims/enduser"         ],
                enduserTenantId :jwtDecoded["http://wso2.org/claims/enduserTenantId" ],
                keytype         :jwtDecoded["http://wso2.org/claims/keytype"         ],
                subscriber      :jwtDecoded["http://wso2.org/claims/subscriber"      ],
                tier            :jwtDecoded["http://wso2.org/claims/tier"            ],
                usertype        :jwtDecoded["http://wso2.org/claims/usertype"        ],
                version         :jwtDecoded["http://wso2.org/claims/version"         ]
            };
          
            return jwtDecoded;
        })
};


