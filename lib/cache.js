/**
 *  @license
 *    Copyright 2018 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License")
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
module.exports = Cache

function Cache() {

  const cache = {}
  const data = {
    endTime: null,
    timeoutId: null,
    ttl: 10,            // 10 minute default
    value: null
  }

  process.on('exit', () => clearTimeout(data.timeoutId))      // app is closing
  process.on('SIGINT', () => clearTimeout(data.timeoutId))    // catches ctrl+c event
  process.on('SIGUSR1', () => clearTimeout(data.timeoutId))   // catches "kill pid"
  process.on('SIGUSR2', () => clearTimeout(data.timeoutId))   // catches "kill pid"

  cache.clearCache = function() {
    clearCache(data)
    clearTimeout(data.timeoutId)
  }

  cache.getCache = function() {
    return data.value
  }

  cache.setCache = function(value) {
    if (data.ttl > 0) {
      data.value = value
      refreshCache(data)
    }
  }

  cache.getTTL = function() {
    return data.ttl
  }

  cache.setTTL = function(ttl) {
    data.ttl = ttl > 0 ? ttl : 0
    if (Date.now() + ttlInMilliseconds(data) < data.endTime) refreshCache(data)
  }

  return cache
}

function clearCache(data) {
  data.value = null
}

function refreshCache(data) {
  const ttl = ttlInMilliseconds(data)
  clearTimeout(data.timeoutId)
  data.endTime = Date.now() + ttl
  data.timeoutId = setTimeout(() => clearCache(data), ttl)
}

function ttlInMilliseconds(data) {
  return data.ttl * 60000
}