import { useState } from 'react'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

export default function () {
  const [stub, setStub] = useState(null)
  

  bindAttributeOrProperty({
    element: stub,
    key: 'dataLabel',
    value: 'stub',
    dependencyList: [],
  })

  return (
    <span ref={setStub}></span>
  )
}
