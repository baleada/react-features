import { useRef, useLayoutEffect } from 'react'
import type { MutableRefObject } from 'react'
import { findIndex } from 'lazy-collections'
import { Navigateable } from '@baleada/logic'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { createToNextEligible, createToPreviousEligible } from './createToEligible'
import type { ToEligibility } from './createToEligible'

type BaseEligibleNavigationOptions = { toEligibility?: ToEligibility }

/**
 * Creates methods for navigating only to elements that are considered possible locations, e.g. the enabled elements in a list. Methods return the ability of the item, if any, that they were able to navigate to.
 */
export function createEligibleNavigation (
  {
    navigateable,
    ability,
    elementsApi,
    disabledElementsAreEligibleLocations,
    loops,
  }: {
    navigateable: MutableRefObject<Navigateable<HTMLElement>>,
    ability:  StatusOption<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    disabledElementsAreEligibleLocations: boolean,
    loops: boolean,
  }
): {
  exact: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  next: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  previous: (index: number, options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  first: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  last: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
  random: (options?: BaseEligibleNavigationOptions) => 'enabled' | 'disabled' | 'none',
} {
  const getAbility = ensureGetStatus({ element: elementsApi.elements, status: ability }),
        exact: ReturnType<typeof createEligibleNavigation>['exact'] = (index, options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(elementsApi.elements.current).navigate(index),
                possibility = options.toEligibility({ index: n.location, element: elementsApi.elements.current[n.location] })

          if (disabledElementsAreEligibleLocations && possibility === 'eligible') {
            navigateable.current.navigate(index)
            return getAbility(index)
          }

          if (getAbility(index) === 'enabled' && possibility === 'eligible') {
            navigateable.current.navigate(index)
            return 'enabled'
          }

          return 'none'
        },
        first: ReturnType<typeof createEligibleNavigation>['first'] = (options = { toEligibility: () => 'eligible' }) => {
          return next(-1, { toEligibility: options.toEligibility })
        },
        last: ReturnType<typeof createEligibleNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          return previous(elementsApi.elements.current.length, { toEligibility: options.toEligibility })
        },
        random: ReturnType<typeof createEligibleNavigation>['last'] = (options = { toEligibility: () => 'eligible' }) => {
          const n = new Navigateable(elementsApi.elements.current)

          if (options.toEligibility({ index: n.location, element: elementsApi.elements.current[n.location] }) === 'eligible') {
            return exact(n.random().location)
          }

          return 'none'
        },
        next: ReturnType<typeof createEligibleNavigation>['next'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (!loops && index === navigateable.current.array.length - 1) {
            return 'none'
          }
          
          if (
            disabledElementsAreEligibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
          ) {
            const nextEligible = toNextEligible({ index, toEligibility: options.toEligibility })
            
            if (typeof nextEligible === 'number') {
              navigateable.current.navigate(nextEligible)
              return getAbility(navigateable.current.location)
            }
  
            return 'none'
          }

          const nextEligible = toNextEligible({
            index,
            toEligibility: ({ index, element }) => getAbility(index) === 'enabled'
              ? options.toEligibility({ index, element })
              : 'ineligible',
          })
            
          if (typeof nextEligible === 'number') {
            navigateable.current.navigate(nextEligible)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ elementsApi, loops }),
        previous: ReturnType<typeof createEligibleNavigation>['previous'] = (index, options = { toEligibility: () => 'eligible' }) => {
          if (!loops && index === 0) {
            return 'none'
          }

          if (
            disabledElementsAreEligibleLocations
            || (typeof ability === 'string' && ability === 'enabled')
          ) {
            const previousEligible = toPreviousEligible({ index, toEligibility: options.toEligibility })
            
            if (typeof previousEligible === 'number') {
              navigateable.current.navigate(previousEligible)
              return getAbility(navigateable.current.location)
            }
  
            return 'none'
          }
          
          const previousEligible = toPreviousEligible({
            index,
            toEligibility: ({ index, element }) => getAbility(index) === 'enabled'
              ? options.toEligibility({ index, element })
              : 'ineligible',
          })
        
          if (typeof previousEligible === 'number') {
            navigateable.current.navigate(previousEligible)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ elementsApi, loops })

  // TODO: Option to not trigger focus side effect after reordering, adding, or deleting
  // Runs on every render to capture possible changes to element API
  useLayoutEffect(() => {
    const { status, elements: currentElements } = elementsApi

    console.log(status.current)

    if (status.current.order === 'changed') {
      const index = findIndex<HTMLElement>(element => element.isSameNode(previousElements.current[navigateable.current.location]))(currentElements.current) as number
      
      if (typeof index === 'number') {
        exact(index)
        previousElements.current = currentElements.current
        return
      }
      
      previousElements.current = currentElements.current
      first()
      return
    }

    if (status.current.length === 'shortened' && navigateable.current.location > currentElements.current.length - 1) {
      previousElements.current = currentElements.current
      return
    }
  })

  const previousElements = useRef<MultipleIdentifiedElementsApi<HTMLElement>['elements']['current']>([])

  return {
    exact,
    next,
    previous,
    first,
    last,
    random
  }
}
