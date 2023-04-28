import { type OpenIdConfigurationType } from '../../src/index.js'

export const validOpenIdConfig: OpenIdConfigurationType = {
  issuer: 'https://api.byu.edu',
  authorization_endpoint: 'https://api.byu.edu/authorize',
  token_endpoint: 'https://api.byu.edu/token',
  userinfo_endpoint: 'https://api.byu.edu/userinfo',
  jwks_uri: 'https://api.byu.edu/.well-known/byucerts',
  response_types_supported: [
    'code',
    'token'
  ],
  subject_types_supported: [
    'public'
  ],
  id_token_signing_alg_values_supported: [
    'RS256'
  ],
  scopes_supported: [
    'openid'
  ]
}
