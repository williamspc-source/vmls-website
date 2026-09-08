import { createLocalReq, getPayload } from 'payload'
import { seedVerify } from '@/endpoints/seedVerify'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(): Promise<Response> {
  // Authentication alone is not a sufficient guard here. There are no user
  // roles, so every logged-in user is a full admin — and this endpoint rewrites
  // page parents (changing live URLs, with no redirect and no revalidation) and
  // overwrites taxonomy copy from code fixtures. It is a build-time scaffolding
  // tool, not an admin feature, so it stays off unless explicitly switched on.
  if (process.env.ENABLE_SEED_ENDPOINT !== 'true') {
    return new Response(
      'Seed endpoint disabled. Set ENABLE_SEED_ENDPOINT=true to enable it.',
      { status: 404 },
    )
  }

  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const payloadReq = await createLocalReq({ user }, payload)

    await seedVerify({ payload, req: payloadReq })

    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error running VERIFY scaffold seed' })
    return new Response('Error running VERIFY scaffold seed.', { status: 500 })
  }
}
