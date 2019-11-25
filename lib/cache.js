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
const debug = require('debug')('byu-jwt-cache')

module.exports = Cache

function Cache () {
  const cache = {}
  const data = {
    endTime: null,
    timeoutId: null,
    ttl: 10, // 10 minute default
    value: null
  }

  process.on('exit', () => shutdown('exit', data)) // app is closing
  process.on('SIGINT', () => shutdown('SIGINT', data)) // catches ctrl+c event
  process.on('SIGBREAK', () => shutdown('SIGBREAK', data)) // catches Windows ctrl+c event
  process.on('SIGUSR1', () => shutdown('SIGUSR1', data)) // catches "kill pid"
  process.on('SIGUSR2', () => shutdown('SIGUSR2', data)) // catches "kill pid"

  cache.clearCache = function () {
    clearCache(data)
    clearTimeout(data.timeoutId)
  }

  cache.getCache = function () {
    const value = data.value
    debug('cache retrieved')
    return value
  }

  cache.setCache = function (value) {
    if (data.ttl > 0) {
      data.value = value
      refreshCache(data)
      debug('cache stored')
    }
  }

  cache.getTTL = function () {
    return data.ttl
  }

  cache.setTTL = function (ttl) {
    data.ttl = ttl > 0 ? ttl : 0
    if (Date.now() + ttlInMilliseconds(data) < data.endTime) refreshCache(data)
  }

  return cache
}

function clearCache (data) {
  debug('cache cleared')
  data.value = null
}

function refreshCache (data) {
  debug('cache updated')
  const ttl = ttlInMilliseconds(data)
  clearTimeout(data.timeoutId)
  data.endTime = Date.now() + ttl
  data.timeoutId = setTimeout(() => clearCache(data), ttl)
}

function ttlInMilliseconds (data) {
  return data.ttl * 60000
}

function shutdown (mode, data) {
  clearTimeout(data.timeoutId)
}
