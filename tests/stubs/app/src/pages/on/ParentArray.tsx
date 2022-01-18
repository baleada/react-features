import { useState, useRef } from 'react'
import ChildArray from './ChildArray'
import { createReplace } from '@baleada/logic'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const els = useRef([]),
        getRef = index => el => els.current[index] = el,
        [stubs, setStubs] = useState([0, 1, 2]),
        [counts, _setCounts] = useState(stubs.map(() => 0)),
        setCounts = index => {
          _setCounts(counts => createReplace({ index, item: counts[index] + 1 })(counts))
        }
  
  els.current = []
  
  const [childArrayIsMounted, setChildArrayIsMounted] = useState(false);

  (window as unknown as WithGlobals).testState =  {
    mount: () => setChildArrayIsMounted(true),
    counts,
  }

  return (
    <>
      {stubs.map((stub, index) =>
        <span
          key={stub}
          ref={getRef(index)}
        >
          {counts[index]}
        </span>
      )}
      {childArrayIsMounted && <ChildArray
        els={els}
        setCounts={setCounts}
      />}
    </>
  )
}
