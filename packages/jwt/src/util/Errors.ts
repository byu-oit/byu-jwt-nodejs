import { Type, type Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export class ErrorDetails<I = unknown> extends Error {
    readonly details: I[]
    constructor (message?: string, errors: I[] = []) {
        super(message ?? 'Multiple errors occurred: see additional details.')
        this.details = errors
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }

    push (...detail: I[]): this {
        this.details.push(...detail)
        return this
    }
}

export class ValidationError extends ErrorDetails {
    name = 'ValidationError'
    constructor (errors: unknown[] = [], message?: string) {
        super(message ?? 'Validation error', errors)
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class NoAccessTokenError extends ErrorDetails {
    name = 'NoAccessTokenError'
    constructor (errors: unknown[] = []) {
        super('Unable to retrieve access token', errors)
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class NoRefreshTokenError extends Error {
    name = 'NoRefreshTokenError'
    constructor () {
        super('The access token did not have a refresh token.')
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

// (Error Response)[https://www.rfc-editor.org/rfc/rfc6749#section-5.2]
export type OAuthProviderErrorType = Static<typeof OAuthProviderErrorSchema>

export enum OAuthProviderErrorCode {
    INVALID_CLIENT = 'invalid_client',
    INVALID_GRANT = 'invalid_grant',
    UNAUTHORIZED_CLIENT = 'unauthorized_client',
    UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
    INVALID_SCOPE = 'invalid_scope'
}

export const OAuthProviderErrorSchema = Type.Object({
    error: Type.Enum(OAuthProviderErrorCode),
    error_description: Type.Optional(Type.String()),
    error_uri: Type.Optional(Type.String())
})

export class OAuthProviderError extends Error {
    name = 'OAuthProviderError'
    readonly error: OAuthProviderErrorCode
    readonly description: string | undefined
    readonly uri: string | undefined

    constructor ({ error, error_description: description, error_uri: uri }: OAuthProviderErrorType) {
        super(`Error ${error.toUpperCase()} from Open ID provider`)
        this.error = error
        this.description = description
        this.uri = uri
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }

    static from (value: unknown): OAuthProviderError {
        const C = TypeCompiler.Compile(OAuthProviderErrorSchema)
        const valid = C.Check(value)
        if (!valid) {
            const errors = [...C.Errors(value)]
            throw new ValidationError(errors, 'Invalid error response from Open ID provider')
        }
        return new OAuthProviderError(value)
    }
}


export type AuthorizationCodeRedirectErrorType = Static<typeof AuthorizationCodeErrorSchema>

export const AuthorizationCodeErrorSchema = Type.Intersect([
    OAuthProviderErrorSchema,
    Type.Object({
        state: Type.Optional(Type.String()),
        iss: Type.Optional(Type.String())
    })
])

export class AuthorizationCodeRedirectError extends OAuthProviderError {
    name = 'AuthorizationCodeRedirectError'
    state: string | undefined
    iss: string | undefined

    /**
     * Constructs a type-safe object to interact with authorization code redirect errors.
     *
     * @param options - The remaining OauthResponseError parameters.
     * @param options -.state State that may have been passed back
     * from the
     * authorization server in the error body.
     * @param options -.iss The issuer or authorization server that
     * returned
     * the response. Used to verify the issuer is intended authorization target.
     */
    constructor ({ state, iss, ...options}: AuthorizationCodeRedirectErrorType) {
        super(options)
        this.state = state
        this.iss = iss
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }

    /**
     * This error typically is used to validate an error response during the redirect
     * from the authorization server.
     *
     * @param params - The parameters returned from the failed
     * authorization code redirect.
     * @returns The authorization code redirect error
     * parsed to make the response type-safe.
     */
    static from (params: URLSearchParams | unknown): AuthorizationCodeRedirectError {
        const value = params instanceof URLSearchParams ? Object.fromEntries(params.entries()) : params
        const C = TypeCompiler.Compile(AuthorizationCodeErrorSchema)
        const valid = C.Check(value)
        if (!valid) {
            const errors = [...C.Errors(value)]
            throw new ValidationError(errors, 'Invalid error response from OpenId provider')
        }
        return new AuthorizationCodeRedirectError(value)
    }
}

export class CredentialProviderError extends TypeError {
    name = 'CredentialProviderError'

    constructor (message?: string) {
        super(message ?? 'Credential Provider Error')
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }
}