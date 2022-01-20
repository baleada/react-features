import { useRef } from 'react'
import { useElementApi } from '../../../../../../src/extracted/useElementApi';
import { createToPreviousEligible } from '../../../../../../src/extracted/createToEligible';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

export default function () {
  const itemsRef = useRef(items)

  const elementsApi = useElementApi({ multiple: true, identified: true });

  (window as unknown as WithGlobals).testState = {
    elementsApi,
    toPreviousEligible: createToPreviousEligible({
      elementsApi,
      loops: false,
    }),
    toPreviousEligible_loops: createToPreviousEligible({
      elementsApi,
      loops: true,
    })
  }

  return (
    <ul>
      {itemsRef.current.map((item, index) =>
        <li ref={elementsApi.getRef(index)}>
          {item}
        </li>
      )}
    </ul>
  )
}
