import { useRef, useLayoutEffect } from 'react'
import type { MutableRefObject } from 'react'
import { findIndex } from 'lazy-collections'
import { createReduce, Pickable } from '@baleada/logic'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { createToNextEligible, createToPreviousEligible } from './createToEligible'
import type { ToEligibility } from './createToEligible'

type BaseEligiblePickingOptions = { toEligibility?: ToEligibility }

const defaultEligiblePickingOptions: BaseEligiblePickingOptions = {
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for picking only the elements that are considered possible picks,
   and updating picks if element ability changes. Methods return the ability of the item, if any, that they pick.
 */
export function createEligiblePicking (
  { pickable, ability, elementsApi }: {
    pickable: MutableRefObject<Pickable<HTMLElement>>,
    ability: StatusOption<'enabled' | 'disabled'>,
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  }
): {
  exact: (indexOrIndices: number | number[], options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  next: (index: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
  previous: (index: number, options?: BaseEligiblePickingOptions & Parameters<Pickable<HTMLElement>['pick']>[1]) => 'enabled' | 'none',
} {
  const getAbility = ensureGetStatus({ element: elementsApi.elements, status: ability }),
        exact: ReturnType<typeof createEligiblePicking>['exact'] = (indexOrIndices, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'disabled')
          ) {
            return 'none'
          }

          if (
            (typeof ability === 'string' && ability === 'enabled')
          ) {
            const eligible = new Pickable(pickable.current.array)
              .pick(indexOrIndices)
              .picks
              .filter(index => toEligibility({ index, element: elementsApi.elements.current[index] }) === 'eligible')
            
            pickable.current.pick(eligible, pickOptions)
            return 'enabled'
          }

          const eligible = new Pickable(pickable.current.array)
            .pick(indexOrIndices)
            .picks
            .filter(index =>
              getAbility(index) === 'enabled'
              && toEligibility({ index, element: elementsApi.elements.current[index] }) === 'eligible'
            )

          if (eligible.length > 0) {
            pickable.current.pick(eligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        next: ReturnType<typeof createEligiblePicking>['next'] = (index, options = {}) => {
          if (index === pickable.current.array.length - 1) {
            return 'none'
          }

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'enabled')
          ) {
            const nextEligible = toNextEligible({ index, toEligibility })
            
            if (typeof nextEligible === 'number') {
              pickable.current.pick(nextEligible, pickOptions)
              return 'enabled'
            }
  
            return 'none'
          }

          const nextEligible = toNextEligible({
            index,
            toEligibility: ({ index, element }) => getAbility(index) === 'enabled'
              ? toEligibility({ index, element })
              : 'ineligible',
          })
            
          if (typeof nextEligible === 'number') {
            pickable.current.pick(nextEligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        toNextEligible = createToNextEligible({ elementsApi, loops: false }),
        previous: ReturnType<typeof createEligiblePicking>['next'] = (index, options = {}) => {          
          if (index === 0) {
            return 'none'
          }

          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickingOptions, ...options }

          if (
            (typeof ability === 'string' && ability === 'enabled')
          ) {
            const previousEligible = toPreviousEligible({ index, toEligibility })
            
            if (typeof previousEligible === 'number') {
              pickable.current.pick(previousEligible, pickOptions)
              return 'enabled'
            }
  
            return 'none'
          }

          const previousEligible = toPreviousEligible({
            index,
            toEligibility: ({ index, element }) => getAbility(index) === 'enabled'
              ? toEligibility({ index, element })
              : 'ineligible',
          })
        
          if (typeof previousEligible === 'number') {
            pickable.current.pick(previousEligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        toPreviousEligible = createToPreviousEligible({ elementsApi, loops: false })

  if (typeof ability !== 'string' && typeof ability !== 'function') {
    useLayoutEffect(() => {
      const p = new Pickable(pickable.current.array).pick(pickable.current.picks)

      p.array.forEach((_, index) => {
        if (ability.get({ element: elementsApi.elements.current[index], index }) === 'disabled') {
          p.omit(index)
        }
      })

      pickable.current.pick(p.picks, { replace: 'all' })
    }, ability.dependencyList)
  }

  useLayoutEffect(() => {
      const { status, elements: currentElements } = elementsApi

      debugger

      if (status.current.order === 'changed') {
        const indices = createReduce<number, number[]>((indices, pick) => {
          const index = findIndex<HTMLElement>(element => element.isSameNode(previousElements.current[pick]))(currentElements.current) as number
        
          if (typeof index === 'number') {
            indices.push(index)
          }

          return indices
        }, [])(pickable.current.picks)

        exact(indices, { replace: 'all' })

        return
      }

      if (status.current.length === 'shortened') {
        const indices = createReduce<number, number[]>((indices, pick) => {
          if (pick <= currentElements.current.length - 1) {
            indices.push(pick)
          }

          return indices
        }, [])(pickable.current.picks)

        if (indices.length === 0) {
          pickable.current.omit()
          return
        }

        exact(indices, { replace: 'all' })
      }

      previousElements.current = [...currentElements.current]
    }
  )

  const previousElements = useRef<MultipleIdentifiedElementsApi<HTMLElement>['elements']['current']>([])

  return {
    exact,
    next,
    previous,
  }
}
