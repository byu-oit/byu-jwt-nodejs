import test from 'ava'
import { validOpenIdConfig } from '../assets/openid-config.js'
import { OpenIdConfiguration } from '../../src/index.js'

test('should validate token input', t => {
  t.notThrows(() => OpenIdConfiguration.from(validOpenIdConfig))
})
test('should throw when given invalid token input', t => {
  t.throws(() => OpenIdConfiguration.from({ accessToken: 0 }))
})
