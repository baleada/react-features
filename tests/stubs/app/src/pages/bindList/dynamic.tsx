import { useState } from 'react'
import { bindList } from '../../../../../../src/extracted/bindList'

export default function () {
  
  const [stub, setStub] = useState(null),
        [color, setColor] = useState('red')

  bindList({
    element: stub,
    list: 'class',
    value: color,
    dependencyList: [color],
  })

  return (
    <>
      <span ref={setStub} className="stub">stub</span>
      <button onClick={() => setColor('blue')}>set color</button>
    </>
  )
}
