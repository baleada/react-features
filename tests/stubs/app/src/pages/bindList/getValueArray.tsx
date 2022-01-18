import { useState, useRef } from 'react'
import type { WithGlobals } from '../../../../../fixtures/types'
import { bindList } from '../../../../../../src/extracted/bindList'

export default function () {
  const els = useRef([]),
        [stubs, setStubs] = useState(['red', 'blue', 'green']),
        [color, setColor] = useState('red')
  
  els.current = []

  bindList({
    element: els,
    list: 'class',
    value: ({ element, index }) => stubs[index],
    dependencyList: [color],
  });

  (window as unknown as WithGlobals).testState =  { setColor }

  return (
    <>
      {stubs.map((stub, index) =>
        <span
          key={stub}
          ref={el => els.current.push(el)}
          className="stub"
        >
          {stub}
        </span>
      )}
    </> 
  )
}
