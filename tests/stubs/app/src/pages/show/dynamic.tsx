import { useState } from 'react'
import { show } from '../../../../../../src/affordances/show'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const [stub, setStub] = useState(null),
        [isShown, setIsShown] = useState(true),
        toggle = () => {
          setIsShown(!isShown)
        }

  show({
    element: stub,
    condition: {
      get: () => isShown,
      dependencyList: [isShown],
    },
  });

  (window as unknown as WithGlobals).testState =  { toggle }

  return (
    <span ref={setStub}>show</span>
  )
}
