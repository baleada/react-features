import { useEffect, useRef } from 'react'
import { useNavigateable } from '@baleada/react-composition';
import { useElementApi } from '../../../../../../src/extracted/useElementApi';
import { createEligibleNavigation } from '../../../../../../src/extracted/createEligibleNavigation';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

export default function () {
  const itemsRef = useRef(items)

  const elementsApi = useElementApi({ multiple: true, identified: true });

  const navigateable = useNavigateable<HTMLElement>([]);

  useEffect(() => {
    navigateable.current.array = elementsApi.elements.current
  }, []);

  const abilities = [
    ...new Array(2).fill('disabled'),
    ...new Array(6).fill('enabled'),
    ...new Array(2).fill('disabled')
  ]
  const ability = ({ index }) => abilities[index];


  (window as unknown as WithGlobals).testState = {
    navigateable,
    elementsApi,
    ability,
    eligibleNavigation: createEligibleNavigation({
      disabledElementsAreEligibleLocations: false,
      navigateable,
      loops: false,
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
