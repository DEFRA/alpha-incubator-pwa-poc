import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['node', 'vitest'],
    ignores: [...neostandard.resolveIgnoresFromGitignore()],
    noJsx: true,
    noStyle: true
  }),
  {
    files: ['src/client/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly'
      }
    }
  }
]
