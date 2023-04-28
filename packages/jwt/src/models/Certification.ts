import { Type, type Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ValidationError } from '../util/Errors.js'

export interface PemCertificate {
  kid: string
  x5t: string
  x5c: string
}

export type CertificationType = Static<typeof Certification.Schema>

export class Certification {
  static Schema = Type.Object({
    e: Type.String(),
    kty: Type.String(),
    use: Type.String(),
    kid: Type.String(),
    x5t: Type.String(),
    n: Type.String(),
    x5c: Type.Array(Type.String())
  }, { $id: 'CertificationKey' })

  readonly e: string
  readonly kty: string
  readonly use: string
  readonly kid: string
  readonly x5t: string
  readonly n: string
  readonly x5c: string[]

  constructor (certification: CertificationType) {
    this.e = certification.e
    this.kty = certification.kty
    this.use = certification.use
    this.kid = certification.kid
    this.x5t = certification.x5t
    this.n = certification.n
    this.x5c = certification.x5c
  }

  static from (value: unknown): Certification {
    const C = TypeCompiler.Compile(Certification.Schema)
    const result = C.Check(value)
    if (!result) {
      const errors = [...C.Errors(value)]
      throw new ValidationError(errors, 'Invalid Certification')
    }
    return new Certification(value)
  }
}

export type CertificationsType = Static<typeof Certifications.Schema>

export class Certifications {
  keys: Certification[]
  static Schema = Type.Object({
    keys: Type.Array(Type.Ref(Certification.Schema))
  })

  constructor (certifications: CertificationsType) {
    this.keys = certifications.keys
  }

  static from (value: unknown): Certifications {
    const C = TypeCompiler.Compile(Certifications.Schema, [Certification.Schema])
    const result = C.Check(value)
    if (!result) {
      const errors = [...C.Errors(value)]
      throw new ValidationError(errors, 'Invalid Certifications')
    }
    return new Certifications(value)
  }

  get pemCertificates (): PemCertificate[] {
    return this.keys.map((key) => {
      const x5c = `-----BEGIN CERTIFICATE-----\n${key.x5c[0].replace(/(.{64})/g, '$1\n')}\n-----END CERTIFICATE-----`
      return { kid: key.kid, x5t: key.x5t, x5c }
    })
  }
}
