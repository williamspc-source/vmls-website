import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'

type Props = {
  /**
   * The path the preview should render, from src/utilities/routes.ts.
   *
   * This used to be a `collection` + `slug` pair resolved through a local
   * collection→prefix map — the last surviving copy of the map that
   * src/utilities/routes.ts replaced everywhere else. It still said posts live at
   * `/posts/<slug>`, which is now a redirect stub rather than the article route,
   * so Preview and Live Preview for a Post landed on the stub and 404'd.
   *
   * Callers pass an already-resolved path instead, so this can never drift from
   * the real routes again. `null` means the document has no previewable URL yet
   * (no slug, or a Post with no stream) — the admin then shows no preview button
   * rather than one that leads somewhere broken.
   */
  path?: string | null
}

export const generatePreviewPath = ({ path }: Props) => {
  if (!path) return null

  const encoded = '/' + path.split('/').filter(Boolean).map(encodeURIComponent).join('/')

  const encodedParams = new URLSearchParams({
    path: encoded || '/',
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  return `/next/preview?${encodedParams.toString()}`
}
