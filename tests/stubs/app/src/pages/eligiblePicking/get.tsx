import { useEffect, useRef } from 'react'
import { usePickable } from '@baleada/react-composition';
import { useElementApi } from '../../../../../../src/extracted/useElementApi';
import { createEligiblePicking } from '../../../../../../src/extracted/createEligiblePicking';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

export default function () {
  const itemsRef = useRef(items)

  const elementsApi = useElementApi({ multiple: true, identified: true });

  const pickable = usePickable<HTMLElement>([]);

  useEffect(() => {
    pickable.current.array = elementsApi.elements.current
  }, []);

  const abilities = [
    ...new Array(2).fill('disabled'),
    ...new Array(6).fill('enabled'),
    ...new Array(2).fill('disabled')
  ]
  const ability = ({ index }) => abilities[index];


  (window as unknown as WithGlobals).testState = {
    pickable,
    elementsApi,
    ability,
    eligiblePicking: createEligiblePicking({
      pickable,
      ability,
      elementsApi,
    }),
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
