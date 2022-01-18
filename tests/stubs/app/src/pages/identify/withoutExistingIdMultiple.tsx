import { useState, useEffect, useRef } from 'react'
import { identify } from '../../../../../../src/affordances/identify'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const els = useRef([]),
        [stubs, setStubs] = useState([0, 1, 2]),
        getRef = index => el => {
          if (el) els.current[index] = el
        }

  const ids = identify({ element: els });

  (window as unknown as WithGlobals).testState =  { ids }

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
