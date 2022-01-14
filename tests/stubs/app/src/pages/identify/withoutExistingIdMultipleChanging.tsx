import { useState, useEffect, useRef } from 'react'
import { createReorder } from '@baleada/logic'
import { identify } from '../../../../../../src/affordances/identify'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const componentStatus = useRef<'rendering' | 'rendered'>('rendering')

  const [els, setEls] = useState([]),
        [stubs, setStubs] = useState({
          data: [0, 1, 2],
          getRef: index => el => {
            if (componentStatus.current = 'rendered') {
              componentStatus.current = 'rendering'
              previousElements.current = currentElements.current
              currentElements.current = []
            }

            if (el) els[index] = el
          }
        }),
        previousElements = useRef([]),
        currentElements = useRef([]),
        add = () => {
          setStubs({
            data: [...stubs.data, stubs.data.length],
            getRef: stubs.getRef,
          })
        },
        reorder = () => {
          setStubs({
            data: createReorder<number>({ from: 1, to: 2 })(stubs.data),
            getRef: stubs.getRef,
          })
          
          setUpdates(updates + 1)
        },
        [updates, setUpdates] = useState(0)

  const ids = identify({ element: els }, { watchSource: updates })

  useEffect(() => {
    (window as unknown as WithGlobals).testState =  { ids, add, reorder }
  }, [stubs, ids])

  return (
    <>
      {stubs.data.map((stub, index) =>
        <span
          key={stub}
          ref={stubs.getRef(index)}
        >
          {stub}
        </span>
      )}
    </> 
  )
}
