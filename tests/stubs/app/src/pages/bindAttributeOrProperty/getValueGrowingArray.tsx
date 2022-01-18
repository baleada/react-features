import { useState, useRef } from 'react'
import type { WithGlobals } from '../../../../../fixtures/types'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'
import { createReorder, createDelete } from '@baleada/logic'

export default function () {
  const els = useRef([]),
        getRef = index => el => els.current[index] = el,
        [stubs, setStubs] = useState([0, 1, 2, 3]),
        add = () => {
          setStubs([...stubs, stubs.length])
        },
        reorder = () => {
          setStubs(createReorder<number>({ from: 1, to: 2 })(stubs))
        },
        del = () => {
          setStubs(createDelete<number>({ index: 1 })(stubs))
        },
        [count, setCount] = useState(0),
        increaseCount = () => setCount(count + 1)
  
  els.current = []

  bindAttributeOrProperty({
    element: els,
    key: 'id',
    value: ({ element, index }) => stubs[index],
    dependencyList: [],
  });

  (window as unknown as WithGlobals).testState =  { add, reorder, del }

  return (
    <>
      {stubs.map((stub, index) =>
        <span
          key={`el-${stub}`}
          ref={getRef(index)}
        >
          {stub}
        </span>
      )}
    </> 
  )
}
