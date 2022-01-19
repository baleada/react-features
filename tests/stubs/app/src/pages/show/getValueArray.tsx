import { useState, useRef } from 'react'
import { show } from '../../../../../../src/affordances/show'
import { WithGlobals } from '../../../../../fixtures/types';

export default function () {
  const els = useRef([]),
        getRef = index => el => els.current[index] = el,
        [stubs, setStubs] = useState([0, 1, 2]),
        [conditions, setConditions] = useState([
          true,
          true,
          true,
        ]),
        toggle = index => {
          const newConditions = [...conditions]
          newConditions[index] = !newConditions[index]
          setConditions(newConditions)
        }
  
  els.current = []

  show({
    element: els,
    condition: {
      get: ({ index }) => {
        console.log(conditions)
        return conditions[index]
      },
      dependencyList: [conditions],
    },
  });

  (window as unknown as WithGlobals).testState =  { toggle }

  return (
    <>
      {stubs.map((stub, index) =>
        <span
          key={stub}
          ref={el => els.current[index] = el}
          className="stub"
        >
          {stub}
        </span>
      )}
    </>
  )
}
