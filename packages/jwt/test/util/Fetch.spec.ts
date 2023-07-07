import test from 'ava'
import { getMaxAge } from '../../src/util/Fetch.js'

test('should parse the max-age from the cache-control header', t => {
  const maxAge = 900
  const headers = new Headers({
    'Cache-Control': `max-age=${maxAge}`
  })
  t.is(getMaxAge(headers), 900)
})
