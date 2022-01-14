import { configureable } from '@baleada/prepare'

export default new configureable.Vite()
  .alias({
    '@src': `/src`,
  })
  .includeDeps([
    '@baleada/logic'
  ])
  .react()
  .pages({
    pagesDir: 'tests/stubs/app/src/pages/toEffectedStatus',
    extensions: ['tsx']
  })
  .configure()
