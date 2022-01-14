import { useState, useEffect, useRef } from 'react'
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
        currentElements = useRef([])

  const ids = identify({ element: els })

  useEffect(() => {
    (window as unknown as WithGlobals).testState =  { ids }
  }, [stubs, ids])

  return (
    <>
      {stubs.data.map((stub, index) =>
        <span
          key={stub}
          ref={stubs.getRef(index)}
          id={`${stub}`}
        >
          {stub}
        </span>
      )}
    </> 
  )
}
