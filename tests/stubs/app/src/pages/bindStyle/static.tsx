import { useState } from 'react'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

export default function () {
  const [stub, setStub] = useState(null)

  bindStyle({
    element: stub,
    property: 'backgroundColor',
      value: 'red',
    dependencyList: [],
  })

  return (
    <span ref={setStub} className="stub"></span>
  )
}


