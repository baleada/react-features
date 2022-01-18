import { useState } from 'react'
import { bind } from '../../../../../../src/affordances/bind'

export default function () {
  const [stub, setStub] = useState(null),
        [name, setName] = useState(undefined)

  bind({
    element: stub,
    values: {
      id: 'stub',
      style_backgroundColor: 'red',
      class: 'stub',
      name,
    }
  })

  return (
    <span ref={setStub} />
  )
}
