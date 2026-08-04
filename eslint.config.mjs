import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: false,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/icons/**', 'src/components/ui/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@awesome.me/**',
                '@fortawesome/**',
                '@headlessui/**',
                '@heroicons/**',
                '@mui/**',
                '@radix-ui/**',
                'lucide-react',
              ],
              message:
                'Use the central AppIcon registry and the approved shadcn/Radix primitive layer.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@awesome.me/**',
                '@fortawesome/**',
                '@headlessui/**',
                '@heroicons/**',
                '@mui/**',
                'lucide-react',
              ],
              message: 'Use the central AppIcon registry and approved Radix primitives.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      '.next/**',
      'output/**',
      'playwright-report/**',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/database/migrations/**',
      'migration/work/**',
    ],
  },
]

export default eslintConfig
