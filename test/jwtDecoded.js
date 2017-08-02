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

var assert = require('assert');
var byuJwt = require('../index');

describe('byuJWTTests', function () {
  it('verify and decode JWT', function (done) {
    //to run test case capture a jwt and copy in the function invokation below.
    byuJwt.jwtDecoded('jwtgoes here', 'well known url goes here')
      .then(function (jwtDecoded) {
        try {
          assert.equal(jwtDecoded.byu.client.netId, '?');
          assert.equal(jwtDecoded.byu.resourceOwner.netId, '?');
          assert.equal(jwtDecoded.wso2.keyType, '?');
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

  it('decode JWT without verifying', function (done) {
    process.env.NODE_ENV = 'mock';
    //to run test case capture a jwt and copy in the function invokation below.
    byuJwt.jwtDecoded('jwtgoes here', 'well known url goes here')
      .then(function (jwtDecoded) {
        try {
          assert.equal(jwtDecoded.byu.client.netId, '?');
          assert.equal(jwtDecoded.byu.resourceOwner.netId, '?');
          assert.equal(jwtDecoded.wso2.keyType, '?');
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
});
