import test from 'ava'
import { Certifications } from '../../src/index.js'
import { validCerts } from '../assets/byu-certs.js'

test('should validate certificate', t => {
  t.notThrows(() => Certifications.from(validCerts))
})

test('should throw for invalid certificate', t => {
  t.throws(() => Certifications.from({}))
})
