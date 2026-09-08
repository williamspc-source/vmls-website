import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  // 30s, not the 10s default: booting Payload takes ~7s now that the config
  // carries 521 rich-text fields (measured 2026-08-21), and a cold schema pull
  // pushes it past the default hook timeout. The symptom is a *skipped* test,
  // not a failed one — the suite reports green while checking nothing.
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
 }, 30_000)

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
