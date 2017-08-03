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

const assert = require('assert');
const byuJwt = require('../index');

// To run test cases, capture a JWT and modify the values below
let test_jwt = 'jwt goes here';
let wellknown_url = 'well known url goes here';
let expected_client_netId = '?';
let expected_resourceOwner_netId = '?';
let expected_wso2_keyType = '?';

describe('byuJWTTests', function () {
  it('verify and decode JWT', function (done) {
    byuJwt.jwtDecoded(test_jwt, wellknown_url)
      .then(function (jwtDecoded) {
        try {
          assert.equal(jwtDecoded.byu.client.netId, expected_client_netId);
          assert.equal(jwtDecoded.byu.resourceOwner.netId, expected_resourceOwner_netId);
          assert.equal(jwtDecoded.wso2.keyType, expected_wso2_keyType);
          done();
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

  it('decode JWT without verifying', function (done) {
    process.env.NODE_ENV = 'mock';
    byuJwt.jwtDecoded(test_jwt, wellknown_url)
      .then(function (jwtDecoded) {
        try {
          assert.equal(jwtDecoded.byu.client.netId, expected_client_netId);
          assert.equal(jwtDecoded.byu.resourceOwner.netId, expected_resourceOwner_netId);
          assert.equal(jwtDecoded.wso2.keyType, expected_wso2_keyType);
          done();
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
});
