import { Type, type Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ValidationError } from '../util/Errors.js'

export interface PemCertificate {
  kid: string
  x5t: string
  x5c: string
}

export type CertificateType = Static<typeof Certificate.Schema>

export class Certificate {
  static Schema = Type.Object({
    e: Type.String(),
    kty: Type.String(),
    use: Type.String(),
    kid: Type.String(),
    x5t: Type.String(),
    n: Type.String(),
    x5c: Type.Array(Type.String())
  }, { $id: 'CertificateKey' })

  readonly e: string
  readonly kty: string
  readonly use: string
  readonly kid: string
  readonly x5t: string
  readonly n: string
  readonly x5c: string[]

  constructor (cert: CertificateType) {
    this.e = cert.e
    this.kty = cert.kty
    this.use = cert.use
    this.kid = cert.kid
    this.x5t = cert.x5t
    this.n = cert.n
    this.x5c = cert.x5c
  }

  static from (value: unknown): Certificate {
    const C = TypeCompiler.Compile(Certificate.Schema)
    const result = C.Check(value)
    if (!result) {
      const errors = [...C.Errors(value)]
      throw new ValidationError(errors, 'Invalid Certification')
    }
    return new Certificate(value)
  }
}

export type CertificatesType = Static<typeof Certificates.Schema>

export class Certificates {
  keys: Certificate[]
  static Schema = Type.Object({
    keys: Type.Array(Type.Ref(Certificate.Schema))
  })

  constructor (certs: CertificatesType) {
    this.keys = certs.keys
  }

  static from (value: unknown): Certificates {
    const C = TypeCompiler.Compile(Certificates.Schema, [Certificate.Schema])
    const result = C.Check(value)
    if (!result) {
      const errors = [...C.Errors(value)]
      throw new ValidationError(errors, 'Invalid Certificates')
    }
    return new Certificates(value)
  }

  get pemCertificates (): PemCertificate[] {
    return this.keys.map((key) => {
      const x5c = `-----BEGIN CERTIFICATE-----\n${key.x5c[0].replace(/(.{64})/g, '$1\n')}\n-----END CERTIFICATE-----`
      return { kid: key.kid, x5t: key.x5t, x5c }
    })
  }
}
