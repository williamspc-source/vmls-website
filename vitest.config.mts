import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // `.tsx` too: the rich-text renderers can only be checked by rendering them.
    // The `<h2><p>…</p></h2>` failure they exist to prevent produces valid HTML
    // and no error, so a test that does not look at the markup cannot see it.
    include: ['tests/int/**/*.int.spec.{ts,tsx}'],
  },
})
