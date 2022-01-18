import { on } from '../../../../../../src/affordances/on'


export default function ({ el, setCount }) {
  on<'click'>({
    element: el,
    effects: defineEffect => [
      defineEffect(
        'click',
        () => {
          setCount(count => count + 1)
        }
      )
    ]
  })

  return (
    // Element to wait for, so mounting can be proven
    <div></div>
  )
}
