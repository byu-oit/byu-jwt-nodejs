import test from 'ava'
import { Certificates } from '../../src/index.js'
import { validCerts } from '../assets/byu-certs.js'

test('should validate certificate', t => {
  t.notThrows(() => Certificates.from(validCerts))
})

test('should throw for invalid certificate', t => {
  t.throws(() => Certificates.from({}))
})
