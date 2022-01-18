import { useState, useMemo } from 'react'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

export default function () {
  
  const [stub, setStub] = useState(null),
        [count, setCount] = useState(0),
        id = useMemo(() => `stub-${count}`, [count])

  bindAttributeOrProperty({
    element: stub,
    key: 'id',
    value: id,
    dependencyList: [id],
  })

  return (
    <>
      <span ref={setStub}>stub</span>
      <button onClick={() => setCount(count + 1)}>button</button>
    </>
  )
}
