import { useState } from 'react'
import { model } from '../../../../../../src/affordances/model'
import { WithGlobals } from '../../../../../fixtures/types';

export default function () {
  const [stub, setStub] = useState(null),
        [modelValue, setModelValue] = useState('')

  model(
    {
      element: stub,
      modelValue,
      setModelValue
    },
    {
      key: 'dataValue',
      event: 'change',
    }
  );

  (window as unknown as WithGlobals).testState =  { modelValue, setModelValue }

  return (
    <input type="text" ref={setStub} />
  )
}
