import { on } from '../../../../../../src/affordances/on'

export default function ({ els, setCounts }) {
  on<'click'>({
    element: els,
    effects: defineEffect => [
      defineEffect(
        'click',
        {
          createEffect: ({ index }) => () => setCounts(index)
        }
      )
    ]
  })

  return (
    // <!-- Element to wait for, so mounting can be proven -->
    <div></div>
  )
}
