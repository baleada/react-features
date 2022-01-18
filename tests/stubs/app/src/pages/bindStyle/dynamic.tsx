import { useState } from 'react'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

export default function () {
  
  const [stub, setStub] = useState(null),
        [color, setColor] = useState('red')

  bindStyle({
    element: stub,
    property: 'backgroundColor',
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
