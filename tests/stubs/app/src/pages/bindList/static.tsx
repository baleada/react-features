import { useState } from 'react'
import { bindList } from '../../../../../../src/extracted/bindList'

export default function () {
  const [stub, setStub] = useState(null)

  bindList({
    element: stub,
    list: 'class',
    value: 'red',
    dependencyList: [],
  })

  return (
    <span ref={setStub} className="stub"></span>
  )
}


