import { useState, useEffect } from 'react'
import { identify } from '../../../../../../src/affordances/identify'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const [stub, setStub] = useState(null),
        id = identify({ element: stub })

  useEffect(() => {
    (window as unknown as WithGlobals).testState = { id }
  }, [stub, id])

  return (
    <span ref={setStub} id="stub" />
  )
}
