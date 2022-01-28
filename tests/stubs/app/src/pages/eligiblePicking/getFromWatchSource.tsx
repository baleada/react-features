import { useState, useLayoutEffect, useRef } from 'react'
import { usePickable } from '@baleada/react-composition';
import { createReorder } from '@baleada/logic';
import { useElementApi } from '../../../../../../src/extracted/useElementApi';
import { createEligiblePicking } from '../../../../../../src/extracted/createEligiblePicking';
import { WithGlobals } from '../../../../../fixtures/types';
import { items as staticItems } from './items'

export default function () {
  const [items, setItems] = useState(staticItems)

  const elementsApi = useElementApi({ multiple: true, identified: true });

  const pickable = usePickable<HTMLElement>([]);

  useLayoutEffect(() => {
    if (elementsApi.status.current.order !== 'none' || elementsApi.status.current.length !== 'none') {
      pickable.current.array = elementsApi.elements.current
    }
  });

  const [abilities, setAbilities] = useState(new Array(10).fill('disabled'))
  const ability = ({ index }) => abilities[index];


  (window as unknown as WithGlobals).testState = {
    pickable,
    elementsApi,
    ability,
    abilities,
    setAbilities,
    eligiblePicking: createEligiblePicking({
      pickable,
      ability: {
        get: ability,
        dependencyList: [abilities],
      },
      elementsApi,
    }),
    reorder: () => setItems(createReorder<number>({ from: 0, to: 9 })(items)),
    remove: () => setItems(items.slice(0, 5)),
    removeAndReorder: () => setItems(createReorder<number>({ from: 0, to: 9 })(items).slice(0, 5)),
  }

  return (
    <ul>
      {items.map((item, index) =>
        <li ref={elementsApi.getRef(index)} key={item}>
          {item}
        </li>
      )}
    </ul>
  )
}
