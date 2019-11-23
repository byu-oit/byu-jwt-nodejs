/**
 *  @license
 *    Copyright 2018 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict'
const debug           = require('debug')('byu-jwt-request')
const http            = require('http')
const https           = require('https')

/**
 * Make a simple HTTP or HTTPS GET request.
 * @param {string} url
 * @returns {Promise<{ body: Object, headers: Object }>}
 */
module.exports = function request(url) {
  debug('making request to ' + url);
  return new Promise((resolve, reject) => {
    const mod = /^https/.test(url) ? https : http
    const req = mod.get(url, res => {
      let data = ''
      if (res.statusCode !== 200) return reject(Error('Invalid response code: ' + res.statusCode))
      res.on('data', chunk => {
        data += chunk.toString()
      })
      res.on('end', () => {
        debug('completed request to ' + url);
        let body
        let headers = res.headers
        try {
          body = JSON.parse(data)
        } catch (err) {
          reject(Error('Invalid response body:' + data))
        }
        resolve({ body, headers })
      })
    })

    req.on('error', err => {
      debug('failed request to ' + url);
      reject(err)
    })
  })
}
