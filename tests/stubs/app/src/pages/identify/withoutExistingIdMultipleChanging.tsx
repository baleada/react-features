import { useState, useEffect, useRef } from 'react'
import { createReorder } from '@baleada/logic'
import { identify } from '../../../../../../src/affordances/identify'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const els = useRef([]),
        [stubs, setStubs] = useState([0, 1, 2]),
        getRef = index => el => {
          if (el) els.current[index] = el
        },
        add = () => {
          setStubs([...stubs, stubs.length])
        },
        reorder = () => {
          setStubs(createReorder<number>({ from: 1, to: 2 })(stubs))
        }

  const ids = identify({ element: els }, { dependencyList: [stubs] });

  (window as unknown as WithGlobals).testState =  { ids, add, reorder }

  return (
    <>
      {stubs.map((stub, index) =>
        <span
          key={stub}
          ref={getRef(index)}
        >
          {stub}
        </span>
      )}
    </> 
  )
}
