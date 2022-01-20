import { useState, useLayoutEffect, useRef } from 'react'
import { useNavigateable } from '@baleada/react-composition';
import { createReorder } from '@baleada/logic';
import { useElementApi } from '../../../../../../src/extracted/useElementApi';
import { createEligibleNavigation } from '../../../../../../src/extracted/createEligibleNavigation';
import { WithGlobals } from '../../../../../fixtures/types';
import { items as staticItems } from './items'

export default function () {
  const [items, setItems] = useState(staticItems)

  const elementsApi = useElementApi({ multiple: true, identified: true });

  const navigateable = useNavigateable<HTMLElement>([]);

  // useLayoutEffect(() => {
  //   navigateable.current.array = elementsApi.elements.current
  // });

  const [abilities, setAbilities] = useState(new Array(10).fill('disabled'))
  const ability = ({ index }) => abilities[index];


  (window as unknown as WithGlobals).testState = {
    navigateable,
    elementsApi,
    ability,
    abilities,
    setAbilities,
    eligibleNavigation: createEligibleNavigation({
      disabledElementsAreEligibleLocations: false,
      navigateable,
      loops: false,
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
