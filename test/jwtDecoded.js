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
let testJwt = 'jwt goes here';
let wellKnownUrl = 'well known url goes here';
let expectedClientNetId = '?';
let expectedResourceOwnerNetId = '?';
let expectedWso2KeyType = '?';
let testBasePath = ''; // Can optionally leave this empty

describe('byuJWTTests', function () {
  let NODE_ENV;
  before(() => {
    NODE_ENV = process.env.NODE_ENV;
  });
  beforeEach(() => {
    delete process.env.NODE_ENV;
  });
  after(() => {
    process.env.NODE_ENV = NODE_ENV;
  });

  it('verify and decode JWT', function (done) {
    byuJwt.jwtDecoded(testJwt, wellKnownUrl)
      .then(function (jwtDecoded) {
        try {
          assert.equal(jwtDecoded.byu.client.netId, expectedClientNetId);
          assert.equal(jwtDecoded.byu.resourceOwner.netId, expectedResourceOwnerNetId);
          assert.equal(jwtDecoded.wso2.keyType, expectedWso2KeyType);
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
    byuJwt.jwtDecoded(testJwt, wellKnownUrl)
      .then(function (jwtDecoded) {
        try {
          assert.equal(jwtDecoded.byu.client.netId, expectedClientNetId);
          assert.equal(jwtDecoded.byu.resourceOwner.netId, expectedResourceOwnerNetId);
          assert.equal(jwtDecoded.wso2.keyType, expectedWso2KeyType);
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

  it('authenticate from JWT in headers', function (done) {
    const testHeaders = {
      'x-jwt-assertion': testJwt
      //'x-jwt-assertion-original': testJwt
    };

    byuJwt.authenticate(testHeaders, wellKnownUrl, testBasePath)
      .then(function (verifiedJwts) {
        try {
          assert.equal(verifiedJwts.originalJwt, testJwt);
          assert.equal(verifiedJwts.current.byu.client.netId, expectedClientNetId);
          assert.equal(verifiedJwts.current.byu.resourceOwner.netId, expectedResourceOwnerNetId);
          assert.equal(verifiedJwts.current.wso2.keyType, expectedWso2KeyType);
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

  it('authenticate from JWT in headers without verifying', function (done) {
    process.env.NODE_ENV = 'mock';
    const testHeaders = {
      'x-jwt-assertion': testJwt
      //'x-jwt-assertion-original': testJwt
    };

    byuJwt.authenticate(testHeaders, wellKnownUrl, testBasePath)
      .then(function (verifiedJwts) {
        try {
          assert.equal(verifiedJwts.originalJwt, testJwt);
          assert.equal(verifiedJwts.current.byu.client.netId, expectedClientNetId);
          assert.equal(verifiedJwts.current.byu.resourceOwner.netId, expectedResourceOwnerNetId);
          assert.equal(verifiedJwts.current.wso2.keyType, expectedWso2KeyType);
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
