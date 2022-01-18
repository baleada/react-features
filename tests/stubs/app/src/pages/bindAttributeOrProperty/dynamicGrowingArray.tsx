import { useState, useRef } from 'react'
import type { WithGlobals } from '../../../../../fixtures/types'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

export default function () {
  const els = useRef([]),
        [stubs, setStubs] = useState([0, 1, 2, 3]),
        add = () => {
          setStubs([...stubs, stubs.length])
        },
        [count, setCount] = useState(0),
        increaseCount = () => setCount(count + 1)
  
  els.current = []

  bindAttributeOrProperty({
    element: els,
    key: 'id',
    value: count,
    dependencyList: [count],
  });

  (window as unknown as WithGlobals).testState =  { add, increaseCount }

  return (
    <>
      {stubs.map((stub, index) =>
        <span
          key={stub}
          ref={el => els.current.push(el)}
        >
          {stub}
        </span>
      )}
    </> 
  )
}
