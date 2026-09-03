import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// `pnpm lint` used to crash before linting a single file:
//
//   TypeError: Converting circular structure to JSON
//     at ConfigValidator.formatErrors (@eslint/eslintrc/.../config-validator.js)
//
// The config went through `FlatCompat`, the eslintrc→flat shim. eslint-config-next
// 16 already exports flat config arrays (`eslint-config-next/core-web-vitals` and
// `/typescript`), so running them back through the legacy validator made it try to
// JSON.stringify a plugin object that references itself. Import them directly —
// no shim, and one less thing between the command and the rules.
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // Generated or vendored — not ours to lint, and lint findings in them are
    // noise that trains people to ignore the output.
    //   payload-types / payload-generated-schema : `pnpm generate:types` output
    //   src/migrations                           : `payload migrate:create` output,
    //                                              and every future migration would
    //                                              add four more warnings
    //   .design-reference                        : the static HTML/JS redesign target
    //                                              we are building *towards*, kept for
    //                                              reference; never executed here
    ignores: [
      '.next/',
      '.design-reference/',
      'src/migrations/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
    ],
  },
]

export default eslintConfig
