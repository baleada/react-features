import { useState } from 'react'
import { on } from '../../../../../../src/affordances/on'
import { WithGlobals } from '../../../../../fixtures/types'


export default function () {
  const [stub, setStub] = useState(null),
        [p, setP] = useState(null),
        [count, setCount] = useState(0)

  on<'click'>({
    element: stub,
    effects: defineEffect => [
      defineEffect(
        'click',
        {
          createEffect: ({ off }) => () => {
            setCount(count + 1)
            off()
          },
        }
      )
    ]
  });

  (window as unknown as WithGlobals).testState =  { update: () => setStub(p) }

  return (
    <>
      <span ref={setStub}>click me</span>
      <code>{count}</code>
      <p ref={p}>click me too</p>
    </>
  )
}
