// (OpenID Connect Discovery 1.0)[https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata]

import { Type, type Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ValidationError } from '../util/Errors.js'

export type OpenIdConfigurationType = Static<typeof OpenIdConfiguration.Schema>

export class OpenIdConfiguration {
  static Schema = Type.Object({
    issuer: Type.String(),
    authorization_endpoint: Type.String(),
    token_endpoint: Type.Optional(Type.String()),
    userinfo_endpoint: Type.Optional(Type.String()),
    jwks_uri: Type.String(),
    registration_endpoint: Type.Optional(Type.String()),
    scopes_supported: Type.Optional(Type.Array(Type.String())),
    response_types_supported: Type.Array(Type.String()),
    response_modes_supported: Type.Optional(Type.Array(Type.String())),
    grant_type_supported: Type.Optional(Type.Array(Type.String())),
    acr_values_supported: Type.Optional(Type.Array(Type.String())),
    subject_types_supported: Type.Array(Type.String()),
    id_token_signing_alg_values_supported: Type.Array(Type.String()),
    id_token_encryption_alg_values_supported: Type.Optional(Type.Array(Type.String())),
    id_token_encryption_enc_values_supported: Type.Optional(Type.Array(Type.String())),
    user_info_signing_alg_values_supported: Type.Optional(Type.Array(Type.String())),
    user_info_encryption_alg_values_supported: Type.Optional(Type.Array(Type.String())),
    user_info_encryption_enc_values_supported: Type.Optional(Type.Array(Type.String())),
    request_object_signing_alg_values_supported: Type.Optional(Type.Array(Type.String())),
    request_object_encryption_alg_values_supported: Type.Optional(Type.Array(Type.String())),
    request_object_encryption_enc_values_supported: Type.Optional(Type.Array(Type.String())),
    token_endpoint_auth_methods_supported: Type.Optional(Type.Array(Type.String())),
    token_endpoint_auth_signing_alg_values_supported: Type.Optional(Type.Array(Type.String())),
    display_values_supported: Type.Optional(Type.Array(Type.String())),
    claim_types_supported: Type.Optional(Type.Array(Type.String())),
    claims_supported: Type.Optional(Type.Array(Type.String())),
    service_documentation: Type.Optional(Type.String()),
    claims_locales_supported: Type.Optional(Type.Array(Type.String())),
    ui_locales_supported: Type.Optional(Type.Array(Type.String())),
    claims_parameter_supported: Type.Optional(Type.Boolean()),
    request_parameter_supported: Type.Optional(Type.Boolean()),
    request_uri_parameter_supported: Type.Optional(Type.Boolean()),
    require_request_uri_registration: Type.Optional(Type.Boolean()),
    op_policy_uri: Type.Optional(Type.String()),
    op_tos_uri: Type.Optional(Type.String())
  }, { additionalProperties: true })

  /**
     *  URL using the https scheme with no query or fragment component that the OP
     *  asserts as its Issuer Identifier. If Issuer discovery is supported (see Section
     *  2), this value MUST be identical to the issuer value returned by WebFinger. This
     *  also MUST be identical to the iss Claim value in ID Tokens issued from this Issuer.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * Section 2: https://openid.net/specs/openid-connect-discovery-1_0.html#IssuerDiscovery
     */
  readonly issuer: string

  /**
     *  URL of the OP's OAuth 2.0 Authorization Endpoint [OpenID.Core].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Core: https://openid.net/specs/openid-connect-core-1_0.html
     */
  readonly authorizationEndpoint: string

  /**
     *  URL of the OP's OAuth 2.0 Token Endpoint [OpenID.Core]. This is REQUIRED unless
     *  only the Implicit Flow is used.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Core: https://openid.net/specs/openid-connect-core-1_0.html
     */
  readonly tokenEndpoint: string | undefined

  /**
     *  URL of the OP's UserInfo Endpoint [OpenID.Core]. This URL MUST use the https
     *  scheme and MAY contain port, path, and query parameter components.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Core: https://openid.net/specs/openid-connect-core-1_0.html
     */
  readonly userInfoEndpoint: string | undefined

  /**
     *  URL of the OP's JSON Web Key Set [JWK] document. This contains the signing
     *  key(s) the RP uses to validate signatures from the OP. The JWK Set MAY also
     *  contain the Server's encryption key(s), which are used by RPs to encrypt
     *  requests to the Server. When both signing and encryption keys are made
     *  available, a use (Key Use) parameter value is REQUIRED for all keys in the
     *  referenced JWK Set to indicate each key's intended usage. Although some
     *  algorithms allow the same key to be used for both signatures and encryption,
     *  doing so is NOT RECOMMENDED, as it is less secure. The JWK x5c parameter MAY be
     *  used to provide X.509 representations of keys provided. When used, the bare key
     *  values MUST still be present and MUST match those in the certificate.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * JWK: https://datatracker.ietf.org/doc/html/draft-ietf-jose-json-web-key
     */
  readonly jwksUri: string

  /**
     *  URL of the OP's Dynamic Client Registration Endpoint [OpenID.Registration].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Registration: https://openid.net/specs/openid-connect-registration-1_0.html
     */
  readonly registrationEndpoint: string | undefined

  /**
     *  JSON array containing a list of the OAuth 2.0 [RFC6749] scope values that this
     *  server supports. The server MUST support the openid scope value. Servers MAY
     *  choose not to advertise some supported scope values even when this parameter is
     *  used, although those defined in [OpenID.Core] SHOULD be listed, if supported.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * RFC6749: https://www.rfc-editor.org/rfc/rfc6749
     *
     * OpenID.Core: https://openid.net/specs/openid-connect-core-1_0.html
     */
  readonly scopesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the OAuth 2.0 response_type values that this OP
     *  supports. Dynamic OpenID Providers MUST support the code, id_token, and the
     *  token id_token Response Type values.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly responseTypesSupported: string[]

  /**
     *  JSON array containing a list of the OAuth 2.0 response_mode values that this OP
     *  supports, as specified in OAuth 2.0 Multiple Response Type Encoding Practices
     *  [OAuth.Responses]. If omitted, the default for Dynamic OpenID Providers is
     *  ["query", "fragment"].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OAuth.Responses: https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html
     */
  readonly responseModesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the OAuth 2.0 Grant Type values that this OP
     *  supports. Dynamic OpenID Providers MUST support the authorization_code and
     *  implicit Grant Type values and MAY support other Grant Types. If omitted, the
     *  default value is ["authorization_code", "implicit"].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly grantTypeSupported: string[] | undefined

  /**
     *  JSON array containing a list of the Authentication Context Class References that
     *  this OP supports.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly acrValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the Subject Identifier types that this OP
     *  supports. Valid types include pairwise and public.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly subjectTypesSupported: string[]

  /**
     *  JSON array containing a list of the JWS signing algorithms (alg values)
     *  supported by the OP for the ID Token to encode the Claims in a JWT [JWT]. The
     *  algorithm RS256 MUST be included. The value none MAY be supported, but MUST NOT
     *  be used unless the Response Type used returns no ID Token from the Authorization
     *  Endpoint (such as when using the Authorization Code Flow).
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * JWT: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-json-web-token
     */
  readonly idTokenSigningAlgValuesSupported: string[]

  /**
     *  JSON array containing a list of the JWE encryption algorithms (alg values)
     *  supported by the OP for the ID Token to encode the Claims in a JWT [JWT].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * JWT: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-json-web-token
     */
  readonly idTokenEncryptionAlgValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the JWE encryption algorithms (enc values)
     *  supported by the OP for the ID Token to encode the Claims in a JWT [JWT].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * JWT: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-json-web-token
     */
  readonly idTokenEncryptionEncValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the JWS [JWS] signing algorithms (alg values)
     *  [JWA] supported by the UserInfo Endpoint to encode the Claims in a JWT [JWT].
     *  The value none MAY be included.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * JWS: https://datatracker.ietf.org/doc/html/draft-ietf-jose-json-web-signature
     *
     * JWA: https://datatracker.ietf.org/doc/html/draft-ietf-jose-json-web-algorithms
     *
     * JWT: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-json-web-token
     */
  readonly userInfoSigningAlgValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the JWE [JWE] encryption algorithms (alg values)
     *  [JWA] supported by the UserInfo Endpoint to encode the Claims in a JWT [JWT].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * JWE: https://datatracker.ietf.org/doc/html/draft-ietf-jose-json-web-encryption
     *
     * JWA: https://datatracker.ietf.org/doc/html/draft-ietf-jose-json-web-algorithms
     *
     * JWT: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-json-web-token
     */
  readonly userInfoEncryptionAlgValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the JWE encryption algorithms (enc values) [JWA]
     *  supported by the UserInfo Endpoint to encode the Claims in a JWT [JWT].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * JWA: https://datatracker.ietf.org/doc/html/draft-ietf-jose-json-web-algorithms
     *
     * JWT: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-json-web-token
     */
  readonly userInfoEncryptionEncValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the JWS signing algorithms (alg values)
     *  supported by the OP for Request Objects, which are described in Section 6.1 of
     *  OpenID Connect Core 1.0 [OpenID.Core]. These algorithms are used both when the
     *  Request Object is passed by value (using the request parameter) and when it is
     *  passed by reference (using the request_uri parameter). Servers SHOULD support
     *  none and RS256.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Core: https://openid.net/specs/openid-connect-core-1_0.html
     */
  readonly requestObjectSigningAlgValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the JWE encryption algorithms (alg values)
     *  supported by the OP for Request Objects. These algorithms are used both when the
     *  Request Object is passed by value and when it is passed by reference.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly requestObjectEncryptionAlgValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the JWE encryption algorithms (enc values)
     *  supported by the OP for Request Objects. These algorithms are used both when the
     *  Request Object is passed by value and when it is passed by reference.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly requestObjectEncryptionEncValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of Client Authentication methods supported by this
     *  Token Endpoint. The options are client_secret_post, client_secret_basic,
     *  client_secret_jwt, and private_key_jwt, as described in Section 9 of OpenID
     *  Connect Core 1.0 [OpenID.Core]. Other authentication methods MAY be defined by
     *  extensions. If omitted, the default is client_secret_basic -- the HTTP Basic
     *  Authentication Scheme specified in Section 2.3.1 of OAuth 2.0 [RFC6749].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Core: https://openid.net/specs/openid-connect-core-1_0.html
     *
     * RFC6749: https://www.rfc-editor.org/rfc/rfc6749
     */
  readonly tokenEndpointAuthMethodsSupported: string[] | undefined

  /**
     *  JSON array containing a list of the JWS signing algorithms (alg values)
     *  supported by the Token Endpoint for the signature on the JWT [JWT] used to
     *  authenticate the Client at the Token Endpoint for the private_key_jwt and
     *  client_secret_jwt authentication methods. Servers SHOULD support RS256. The
     *  value none MUST NOT be used.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * JWT: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-json-web-token
     */
  readonly tokenEndpointAuthSigningAlgValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the display parameter values that the OpenID
     *  Provider supports. These values are described in Section 3.1.2.1 of OpenID
     *  Connect Core 1.0 [OpenID.Core].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Core: https://openid.net/specs/openid-connect-core-1_0.html
     */
  readonly displayValuesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the Claim Types that the OpenID Provider
     *  supports. These Claim Types are described in Section 5.6 of OpenID Connect Core
     *  1.0 [OpenID.Core]. Values defined by this specification are normal, aggregated,
     *  and distributed. If omitted, the implementation supports only normal Claims.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Core: https://openid.net/specs/openid-connect-core-1_0.html
     */
  readonly claimTypesSupported: string[] | undefined

  /**
     *  JSON array containing a list of the Claim Names of the Claims that the OpenID
     *  Provider MAY be able to supply values for. Note that for privacy or other
     *  reasons, this might not be an exhaustive list.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly claimsSupported: string[] | undefined

  /**
     *  URL of a page containing human-readable information that developers might want
     *  or need to know when using the OpenID Provider. In particular, if the OpenID
     *  Provider does not support Dynamic Client Registration, then information on how
     *  to register Clients needs to be provided in this documentation.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly serviceDocumentation: string | undefined

  /**
     *  Languages and scripts supported for values in Claims being returned, represented
     *  as a JSON array of BCP47 [RFC5646] language tag values. Not all languages and
     *  scripts are necessarily supported for all Claim values.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * RFC5646: https://www.rfc-editor.org/rfc/rfc5646
     */
  readonly claimsLocalesSupported: string[] | undefined

  /**
     *  Languages and scripts supported for the user interface, represented as a JSON
     *  array of BCP47 [RFC5646] language tag values.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * RFC5646: https://www.rfc-editor.org/rfc/rfc5646
     */
  readonly uiLocalesSupported: string[] | undefined

  /**
     *  Boolean value specifying whether the OP supports use of the claims parameter,
     *  with true indicating support. If omitted, the default value is false.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly claimsParameterSupported: boolean | undefined

  /**
     *  Boolean value specifying whether the OP supports use of the request parameter,
     *  with true indicating support. If omitted, the default value is false.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly requestParameterSupported: boolean | undefined

  /**
     *  Boolean value specifying whether the OP supports use of the request_uri
     *  parameter, with true indicating support. If omitted, the default value is true.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly requestUriParameterSupported: boolean | undefined

  /**
     *  Boolean value specifying whether the OP requires any request_uri values used to
     *  be pre-registered using the request_uris registration parameter.
     *  Pre-registration is REQUIRED when the value is true. If omitted, the default
     *  value is false.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly requireRequestUriRegistration: boolean | undefined

  /**
     * URL that the OpenID Provider provides to the person registering the Client to
     * read about the OP's requirements on how the Relying Party can use the data
     * provided by the OP. The registration process SHOULD display this URL to the
     *  person registering the Client if it is given.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly opPolicyUri: string | undefined

  /**
     * URL that the OpenID Provider provides to the person registering the Client to
     * read about OpenID Provider's terms of service. The registration process SHOULD
     * display this URL to the person registering the Client if it is given.
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     */
  readonly opTosUri: string | undefined

  /**
     *  Additional OpenID Provider Metadata parameters MAY also be used. Some are
     *  defined by other specifications, such as OpenID Connect Session Management 1.0
     *  [OpenID.Session].
     *
     * Source: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
     *
     * OpenID.Session: https://openid.net/specs/openid-connect-session-1_0.html
     */
  readonly additional: Record<string, unknown>

  /**
     * Determines the exact time (in seconds) that the token expires and is used to
     * answer that inquiry. See also: isExpired.
     */
  private readonly expiresAt: number | undefined

  constructor (config: OpenIdConfigurationType) {
    const {
      issuer,
      authorization_endpoint: authorizationEndpoint,
      token_endpoint: tokenEndpoint,
      userinfo_endpoint: userInfoEndpoint,
      jwks_uri: jwksUri,
      registration_endpoint: registrationEndpoint,
      scopes_supported: scopesSupported,
      response_types_supported: responseTypesSupported,
      response_modes_supported: responseModesSupported,
      grant_type_supported: grantTypeSupported,
      acr_values_supported: acrValuesSupported,
      subject_types_supported: subjectTypesSupported,
      id_token_signing_alg_values_supported: idTokenSigningAlgValuesSupported,
      id_token_encryption_alg_values_supported: idTokenEncryptionAlgValuesSupported,
      id_token_encryption_enc_values_supported: idTokenEncryptionEncValuesSupported,
      user_info_signing_alg_values_supported: userInfoSigningAlgValuesSupported,
      user_info_encryption_alg_values_supported: userInfoEncryptionAlgValuesSupported,
      user_info_encryption_enc_values_supported: userInfoEncryptionEncValuesSupported,
      request_object_signing_alg_values_supported: requestObjectSigningAlgValuesSupported,
      request_object_encryption_alg_values_supported: requestObjectEncryptionAlgValuesSupported,
      request_object_encryption_enc_values_supported: requestObjectEncryptionEncValuesSupported,
      token_endpoint_auth_methods_supported: tokenEndpointAuthMethodsSupported,
      token_endpoint_auth_signing_alg_values_supported: tokenEndpointAuthSigningAlgValuesSupported,
      display_values_supported: displayValuesSupported,
      claim_types_supported: claimTypesSupported,
      claims_supported: claimsSupported,
      service_documentation: serviceDocumentation,
      claims_locales_supported: claimsLocalesSupported,
      ui_locales_supported: uiLocalesSupported,
      claims_parameter_supported: claimsParameterSupported,
      request_parameter_supported: requestParameterSupported,
      request_uri_parameter_supported: requestUriParameterSupported,
      require_request_uri_registration: requireRequestUriRegistration,
      op_policy_uri: opPolicyUri,
      op_tos_uri: opTosUri,
      // additional properties stored separately from the core config
      ...additional
    } = config

    this.issuer = issuer
    this.authorizationEndpoint = authorizationEndpoint
    this.tokenEndpoint = tokenEndpoint
    this.userInfoEndpoint = userInfoEndpoint
    this.jwksUri = jwksUri
    this.registrationEndpoint = registrationEndpoint
    this.scopesSupported = scopesSupported
    this.responseTypesSupported = responseTypesSupported
    this.responseModesSupported = responseModesSupported
    this.grantTypeSupported = grantTypeSupported
    this.acrValuesSupported = acrValuesSupported
    this.subjectTypesSupported = subjectTypesSupported
    this.idTokenSigningAlgValuesSupported = idTokenSigningAlgValuesSupported
    this.idTokenEncryptionAlgValuesSupported = idTokenEncryptionAlgValuesSupported
    this.idTokenEncryptionEncValuesSupported = idTokenEncryptionEncValuesSupported
    this.userInfoSigningAlgValuesSupported = userInfoSigningAlgValuesSupported
    this.userInfoEncryptionAlgValuesSupported = userInfoEncryptionAlgValuesSupported
    this.userInfoEncryptionEncValuesSupported = userInfoEncryptionEncValuesSupported
    this.requestObjectSigningAlgValuesSupported = requestObjectSigningAlgValuesSupported
    this.requestObjectEncryptionAlgValuesSupported = requestObjectEncryptionAlgValuesSupported
    this.requestObjectEncryptionEncValuesSupported = requestObjectEncryptionEncValuesSupported
    this.tokenEndpointAuthMethodsSupported = tokenEndpointAuthMethodsSupported
    this.tokenEndpointAuthSigningAlgValuesSupported = tokenEndpointAuthSigningAlgValuesSupported
    this.displayValuesSupported = displayValuesSupported
    this.claimTypesSupported = claimTypesSupported
    this.claimsSupported = claimsSupported
    this.serviceDocumentation = serviceDocumentation
    this.claimsLocalesSupported = claimsLocalesSupported
    this.uiLocalesSupported = uiLocalesSupported
    this.claimsParameterSupported = claimsParameterSupported
    this.requestParameterSupported = requestParameterSupported
    this.requestUriParameterSupported = requestUriParameterSupported
    this.requireRequestUriRegistration = requireRequestUriRegistration
    this.opPolicyUri = opPolicyUri
    this.opTosUri = opTosUri

    // Additional properties made available on this property
    this.additional = this.additional = Object.freeze(additional) as Record<string, unknown>
  }

  /**
     * Validates the input and converts it to an OpenIdConfiguration.
     *
     * @param value - Any unknown value that is needing validation to use as
     * OpenIdConfiguration input.
     * @returns Access validated input on an access token instance.
     */
  static from (value: unknown): OpenIdConfiguration {
    const C = TypeCompiler.Compile(OpenIdConfiguration.Schema)
    const result = C.Check(value)
    if (!result) {
      const errors = [...C.Errors(value)]
      throw new ValidationError(errors, 'Invalid Open ID Configuration')
    }
    return new OpenIdConfiguration(value)
  }
}
