import { useState, useCallback } from 'react'
import { identify } from '../../../../../../src/affordances/identify'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const [stub, setStub] = useState(null),
        stubRef = useCallback(setStub, []),
        id = identify({ element: stub });

  (window as unknown as WithGlobals).testState = { id, stub }

  return (
    <span ref={stubRef} />
  )
}
